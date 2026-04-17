# FSD: Project Key Management

**Path:** `GET/POST/DELETE /v1/projects/:projectId/keys`

---

## Deskripsi

Endpoint untuk mengelola API key milik project. API key digunakan oleh SDK/agent untuk autentikasi saat mengirim event query ke endpoint capture. Setiap project otomatis mendapatkan satu default key saat dibuat, dan dapat menambahkan key tambahan melalui endpoint ini.

---

## Konten

### Autentikasi

Semua endpoint menggunakan JWT Bearer Token (`AccessToken`) dan permission-based access control.

### 1. Paginate Project Keys

**Path:** `GET /v1/projects/:projectId/keys`
**Permission:** `RESOURCE.PROJECT` + `OPERATION.VIEW`

#### Path Parameters

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| `projectId` | `string` | Ya | UUID project |

#### Query Parameters

| Parameter | Tipe | Wajib | Default | Validasi | Keterangan |
|-----------|------|-------|---------|----------|------------|
| `page` | `number` | Tidak | `1` | Min 1 | Halaman saat ini |
| `perPage` | `number` | Tidak | `10` | Min 1 | Jumlah item per halaman |
| `sort` | `string` | Tidak | `updated_at` | String | Field untuk sorting |
| `order` | `string` | Tidak | `DESC` | Enum: `ASC`, `DESC` | Urutan sorting |
| `search` | `string` | Tidak | - | String | Kata kunci pencarian |

#### Response

**HTTP 200 - OK**
```json
{
  "message": "Project key pagination retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Default Key",
        "maskedKey": "qm_l****abcd",
        "lastUsedAt": "2026-04-17T10:30:00.000Z"
      },
      {
        "id": "uuid",
        "name": "CI/CD Key",
        "maskedKey": "qm_l****efgh",
        "lastUsedAt": null
      }
    ],
    "meta": {
      "page": 1,
      "perPage": 10,
      "total": 2,
      "totalPage": 1
    }
  }
}
```

**Catatan:** `plainKey` tidak pernah ditampilkan pada response paginate. Hanya `maskedKey` yang tersedia.

---

### 2. Create Project Key

**Path:** `POST /v1/projects/:projectId/keys`
**Permission:** `RESOURCE.PROJECT_KEY` + `OPERATION.CREATE`

#### Path Parameters

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| `projectId` | `string` | Ya | UUID project (di-set dari path parameter, menimpa field body jika ada) |

#### Request Body

| Field | Tipe | Wajib | Validasi | Keterangan |
|-------|------|-------|----------|------------|
| `name` | `string` | Ya | Min 2, Max 100 chars | Nama deskriptif untuk key |

**Catatan:** Field `projectId` pada schema body bersifat opsional karena akan di-override oleh path parameter di controller (`createDto.projectId = projectId`).

**Contoh Request Body:**
```json
{
  "name": "Production Monitoring Key"
}
```

#### Response

**HTTP 201 - Created**
```json
{
  "message": "Project key created successfully",
  "data": {
    "id": "uuid",
    "name": "Production Monitoring Key",
    "maskedKey": "qm_l****wxyz",
    "plainKey": "qm_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
  }
}
```

**PENTING:** Field `plainKey` hanya ditampilkan sekali pada response ini. Plain key tidak disimpan di database (hanya bcrypt hash). Jika hilang, harus membuat key baru.

#### Business Logic - Key Generation
1. **Generate plain key:** Prefix `qm_live_` + 24 random bytes (hex) = total 56 karakter
   - Format: `qm_live_[48 hex chars]`
   - Contoh: `qm_live_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6`
2. **Generate hashed key:** Bcrypt hash dari plain key (disimpan di database)
3. **Generate masked key:** 4 karakter pertama + `****` + 4 karakter terakhir
   - Contoh: `qm_l****e5f6`
4. Validasi bahwa project dengan `projectId` ada di database
5. Simpan key record dengan `name`, `hashedKey`, `maskedKey`, dan relasi ke `project`

---

### 3. Delete Project Keys

**Path:** `DELETE /v1/projects/:projectId/keys`
**Permission:** `RESOURCE.PROJECT_KEY` + `OPERATION.DELETE`

#### Path Parameters

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| `projectId` | `string` | Ya | UUID project |

#### Request Body

| Field | Tipe | Wajib | Validasi | Keterangan |
|-------|------|-------|----------|------------|
| `ids` | `string[]` | Ya | Array of UUID | Daftar ID key yang akan dihapus |

**Contoh Request Body:**
```json
{
  "ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "660e8400-e29b-41d4-a716-446655440001"
  ]
}
```

#### Response

**HTTP 200 - OK**
```json
{
  "message": "Project key deleted successfully"
}
```

#### Business Logic
1. Validasi bahwa semua `ids` ditemukan di database. Jika jumlah yang ditemukan tidak sama dengan jumlah yang diminta, throw `NotFoundException`
2. Eksekusi soft delete pada semua key (menggunakan TypeORM `softDelete`)

**Catatan:** Operasi ini adalah **soft delete**, bukan hard delete. Record masih ada di database tetapi ditandai sebagai dihapus.

---

## Aksi

| Aksi | Behavior |
|------|----------|
| **GET /v1/projects/:projectId/keys** | Mengambil daftar API key project dengan pagination |
| **POST /v1/projects/:projectId/keys** | Membuat API key baru untuk project, mengembalikan plain key sekali saja |
| **DELETE /v1/projects/:projectId/keys** | Soft delete satu atau lebih API key berdasarkan ID |

---

## Navigasi

| Dari | Ke |
|------|-----|
| Detail project | `GET /v1/projects/:id` |
| Manage keys | `GET/POST/DELETE /v1/projects/:projectId/keys` |
| Capture events (menggunakan key) | `POST /v1/query-transaction-events/capture` |
| Manage project | `GET/POST/PUT/DELETE /v1/projects` |

---

## Special Cases

| Skenario | Penanganan |
|----------|------------|
| Project tidak ditemukan saat create key | Throw error dari `findOneByOrFail` (project harus ada) |
| Nama key kurang dari 2 karakter | Validasi Zod gagal, HTTP 400 |
| Nama key lebih dari 100 karakter | Validasi Zod gagal, HTTP 400 |
| `ids` berisi UUID yang tidak ditemukan | Throw `NotFoundException` dengan pesan "Data not found" |
| `ids` array kosong pada delete | Validasi Zod menolak (array harus memiliki items) |
| Menghapus default key | Diperbolehkan (tidak ada proteksi khusus untuk default key) |
| Key yang sudah di-soft-delete | Tidak bisa ditemukan lagi pada paginate maupun validasi capture |
| Plain key hilang setelah create | Tidak bisa di-retrieve. Harus membuat key baru |
| Key digunakan untuk capture setelah soft-delete | `validateKeyPlain` tidak akan menemukan key tersebut, autentikasi gagal |
| Masking key yang pendek (kurang dari 8 karakter) | Key dikembalikan tanpa masking (as-is). Namun, karena prefix `qm_live_` sudah 8 karakter + 48 hex, skenario ini tidak terjadi secara normal |
