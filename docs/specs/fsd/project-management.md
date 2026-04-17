# FSD: Project Management

**Path:** `GET/POST/PUT/DELETE /v1/projects`

---

## Deskripsi

Endpoint untuk mengelola project di dalam sistem Query Analyzer. Setiap project merepresentasikan satu aplikasi atau service yang di-monitor query-nya. Project terhubung dengan platform, Gitlab repository, Slack channels, dan API keys.

---

## Konten

### Autentikasi

Semua endpoint menggunakan JWT Bearer Token (`AccessToken`) dan permission-based access control.

### 1. Paginate Projects

**Path:** `GET /v1/projects`
**Permission:** `RESOURCE.PROJECT` + `OPERATION.VIEW`

#### Query Parameters

| Parameter | Tipe | Wajib | Default | Validasi | Keterangan |
|-----------|------|-------|---------|----------|------------|
| `page` | `number` | Tidak | `1` | Min 1 | Halaman saat ini |
| `perPage` | `number` | Tidak | `10` | Min 1 | Jumlah item per halaman |
| `sort` | `string` | Tidak | `updated_at` | String | Field untuk sorting |
| `order` | `string` | Tidak | `DESC` | Enum: `ASC`, `DESC` | Urutan sorting |
| `search` | `string` | Tidak | - | String | Kata kunci pencarian |
| `status` | `string` | Tidak | - | Enum: `active`, `inactive`, `archived` | Filter berdasarkan status project |

#### Response

**HTTP 200 - OK**
```json
{
  "message": "Project pagination retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "My Project",
        "description": "Project description",
        "status": "active",
        "platform": {
          "id": "uuid",
          "name": "NestJS"
        },
        "keys": [
          {
            "id": "uuid",
            "name": "Default Key",
            "maskedKey": "qm_l****abcd",
            "lastUsedAt": null
          }
        ],
        "projectGitlab": {
          ...
        }
      }
    ],
    "meta": {
      "page": 1,
      "perPage": 10,
      "total": 25,
      "totalPage": 3
    }
  }
}
```

---

### 2. Get Project Detail

**Path:** `GET /v1/projects/:id`
**Permission:** `RESOURCE.PROJECT` + `OPERATION.VIEW`

#### Path Parameters

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| `id` | `string` | Ya | UUID project |

#### Response

**HTTP 200 - OK**
```json
{
  "message": "Project detail retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "My Project",
    "description": "Project description",
    "status": "active",
    "platform": { ... },
    "keys": [ ... ],
    "projectGitlab": { ... }
  }
}
```

**HTTP 404 - Not Found**
```json
{
  "message": "Data not found"
}
```

Detail memuat relasi `platform` dan `projectKeys`.

---

### 3. Create Project

**Path:** `POST /v1/projects`
**Permission:** `RESOURCE.PROJECT` + `OPERATION.CREATE`

#### Request Body

| Field | Tipe | Wajib | Validasi | Keterangan |
|-------|------|-------|----------|------------|
| `name` | `string` | Ya | Min 2, Max 100 chars | Nama project (harus unik) |
| `description` | `string` | Tidak | Max 500 chars | Deskripsi project |
| `status` | `string` | Tidak | Enum: `active`, `inactive`, `archived`. Default: `active` | Status project |
| `platformId` | `string` | Ya | UUID format | ID platform yang digunakan |
| `gitlab` | `object` | Tidak | - | Informasi Gitlab repository |
| `gitlab.projectId` | `number` | Tidak | Number | Gitlab project ID |
| `gitlab.url` | `string` | Tidak | URL format | URL Gitlab repository |
| `gitlab.groupId` | `number` | Tidak | Number | Gitlab group ID |
| `gitlab.groupName` | `string` | Tidak | String | Nama Gitlab group |
| `gitlab.defaultBranch` | `string` | Tidak | String | Branch default (e.g., "main") |
| `gitlab.visibility` | `string` | Tidak | String | Visibility level (e.g., "private") |
| `slackChannel` | `object` | Tidak | - | Informasi Slack channel |
| `slackChannel.slackChannelId` | `string` | Tidak | String | ID Slack channel untuk notifikasi |

**Contoh Request Body:**
```json
{
  "name": "Payment Service",
  "description": "Payment microservice query monitoring",
  "status": "active",
  "platformId": "550e8400-e29b-41d4-a716-446655440000",
  "gitlab": {
    "projectId": 12345,
    "url": "https://gitlab.com/org/payment-service",
    "groupId": 100,
    "groupName": "backend",
    "defaultBranch": "main",
    "visibility": "private"
  },
  "slackChannel": {
    "slackChannelId": "C0123456789"
  }
}
```

#### Response

**HTTP 201 - Created**
```json
{
  "message": "Project created successfully",
  "data": {
    "id": "uuid",
    "name": "Payment Service",
    "description": "Payment microservice query monitoring",
    "status": "active",
    "platform": { ... },
    "keys": [
      {
        "id": "uuid",
        "name": "Default Key",
        "maskedKey": "qm_l****abcd",
        "plainKey": "qm_live_a1b2c3d4e5f6..."
      }
    ]
  }
}
```

**Catatan penting:** Field `plainKey` hanya ditampilkan satu kali pada saat create. Setelah itu, hanya `maskedKey` yang tersedia.

#### Business Logic
1. **Validasi nama project** - Cek apakah nama sudah digunakan. Jika sudah, throw `UnprocessableEntityException`
2. **Validasi platform** - Cek apakah `platformId` valid di database
3. **Buat entity project** - Dengan field `platform`, `name`, `description`, `status`
4. **Generate default API key** - Otomatis membuat key dengan prefix `qm_live_` + 24 random hex bytes. Key di-hash dengan bcrypt untuk penyimpanan, dan di-mask untuk tampilan
5. **Buat Gitlab entity** (opsional) - Jika field `gitlab` disertakan
6. **Buat Slack channel entity** (opsional) - Jika field `slackChannel` disertakan
7. **Eksekusi dalam transaction** - Semua operasi (project, key, gitlab, slack channel) disimpan dalam satu database transaction. Jika salah satu gagal, semua di-rollback

---

### 4. Update Project

**Path:** `PUT /v1/projects/:id`
**Permission:** `RESOURCE.PROJECT` + `OPERATION.UPDATE`

#### Path Parameters

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| `id` | `string` | Ya | UUID project yang akan di-update |

#### Request Body

Schema sama dengan Create (`ProjectCreateV1Schema`):

| Field | Tipe | Wajib | Validasi | Keterangan |
|-------|------|-------|----------|------------|
| `name` | `string` | Ya | Min 2, Max 100 chars | Nama project baru (harus unik) |
| `description` | `string` | Tidak | Max 500 chars | Deskripsi project |
| `status` | `string` | Tidak | Enum: `active`, `inactive`, `archived`. Default: `active` | Status project |
| `platformId` | `string` | Ya | UUID format | ID platform |
| `gitlab` | `object` | Tidak | - | Tidak diproses pada update |
| `slackChannel` | `object` | Tidak | - | Tidak diproses pada update |

#### Response

**HTTP 200 - OK**
```json
{
  "message": "Project updated successfully"
}
```

**Catatan:** Hanya field `platform`, `name`, `description`, dan `status` yang di-update. Informasi Gitlab **tidak** di-update pada operasi ini.

---

### 5. Delete Projects

**Path:** `DELETE /v1/projects`
**Permission:** `RESOURCE.PROJECT` + `OPERATION.DELETE`

#### Request Body

| Field | Tipe | Wajib | Validasi | Keterangan |
|-------|------|-------|----------|------------|
| `ids` | `string[]` | Ya | Array of strings | Daftar UUID project yang akan dihapus |

#### Response

**HTTP 200 - OK**
```json
{
  "message": "Projects detail deleted successfully"
}
```

#### Business Logic
1. Validasi setiap project ID ada di database. Jika tidak ditemukan, throw `NotFoundException`
2. Eksekusi penghapusan dalam transaction dengan urutan:
   1. Hapus `projectGitlab` records terkait
   2. Hapus `projectSlackChannels` records terkait
   3. Hapus `projectKeys` records terkait
   4. Hapus `projects` records
3. Jika salah satu operasi gagal, seluruh transaction di-rollback

---

## Aksi

| Aksi | Behavior |
|------|----------|
| **GET /v1/projects** | Mengambil daftar project dengan pagination dan filter status |
| **GET /v1/projects/:id** | Mengambil detail satu project beserta relasi platform dan keys |
| **POST /v1/projects** | Membuat project baru lengkap dengan default API key, opsional Gitlab dan Slack channel |
| **PUT /v1/projects/:id** | Memperbarui informasi dasar project (name, description, status, platform) |
| **DELETE /v1/projects** | Menghapus satu atau lebih project beserta seluruh data terkait (cascade delete via transaction) |

---

## Navigasi

| Dari | Ke |
|------|-----|
| Daftar project | `GET /v1/projects` |
| Detail project | `GET /v1/projects/:id` |
| Manage API keys | `GET/POST/DELETE /v1/projects/:projectId/keys` |
| Manage settings | `GET/POST/DELETE /v1/projects/:projectId/settings` |
| Capture events | `POST /v1/query-transaction-events/capture` |

---

## Special Cases

| Skenario | Penanganan |
|----------|------------|
| Nama project sudah digunakan (create/update) | Throw `UnprocessableEntityException` dengan pesan "Project with name '[name]' already exists" |
| `platformId` tidak ditemukan | Throw `NotFoundException` dari `platformV1Repository.findOneByIdOrFail` |
| Project tidak ditemukan saat detail | Throw `NotFoundException` dengan pesan "Data not found" |
| Project tidak ditemukan saat update | Throw `NotFoundException` dengan pesan "Data not found" |
| Project tidak ditemukan saat delete | Throw `NotFoundException` untuk ID pertama yang tidak ditemukan, proses dihentikan |
| Nama project kurang dari 2 karakter | Validasi Zod gagal, HTTP 400 |
| Nama project lebih dari 100 karakter | Validasi Zod gagal, HTTP 400 |
| Deskripsi lebih dari 500 karakter | Validasi Zod gagal, HTTP 400 |
| `gitlab.url` bukan URL valid | Validasi Zod gagal, HTTP 400 |
| Delete project yang memiliki events terkait | Hapus cascade: gitlab -> slack channels -> keys -> project (dalam transaction) |
| Transaction gagal saat create | Rollback semua operasi (project, key, gitlab, slack channel) |
| Transaction gagal saat delete | Rollback, tidak ada data yang terhapus |
| `status` tidak disertakan saat create | Default ke `active` |
| Update tidak mengubah Gitlab info | Gitlab info diabaikan pada update (komentar di code: "Note: Gitlab info is not updated for now") |
| `plainKey` pada response create | Hanya tersedia pada response create project. Tidak bisa di-retrieve kembali setelahnya |
