# FSD: Project Setting Management

**Path:** `GET/POST/DELETE /v1/projects/:projectId/settings`

---

## Deskripsi

Endpoint untuk mengelola konfigurasi (settings) per project. Saat ini digunakan utamanya untuk mengatur threshold severity kustom pada setiap project, yang memengaruhi bagaimana query transaction events dikategorikan berdasarkan waktu eksekusi.

---

## Konten

### Autentikasi

Semua endpoint menggunakan JWT Bearer Token (global guard) dan permission-based access control.

### 1. Paginate Project Settings

**Path:** `GET /v1/projects/:projectId/settings`
**Permission:** `RESOURCE.PROJECT_SETTING` + `OPERATION.VIEW`

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
| `key` | `string` | Tidak | - | Enum: `severity` | Filter berdasarkan setting key |

#### Response

**HTTP 200 - OK**
```json
{
  "message": "Project setting pagination retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "project": {
          "id": "uuid",
          "name": "My Project",
          "description": "...",
          "status": "active"
        },
        "key": "severity",
        "values": [
          { "level": "critical", "threshold": 5000 },
          { "level": "high", "threshold": 2000 },
          { "level": "medium", "threshold": 1000 },
          { "level": "low", "threshold": 0 }
        ]
      }
    ],
    "meta": {
      "page": 1,
      "perPage": 10,
      "total": 1,
      "totalPage": 1
    }
  }
}
```

**Catatan:** Field `values` disimpan sebagai JSON string di database, tetapi di-parse ke object/array pada response (`JSON.parse(entity.values)`).

---

### 2. Create or Update Project Setting

**Path:** `POST /v1/projects/:projectId/settings`
**Permission:** `RESOURCE.PROJECT_SLACK_CHANNEL` + `OPERATION.CREATE` (catatan: permission menggunakan resource SLACK_CHANNEL, kemungkinan oversight di code)

#### Path Parameters

| Parameter | Tipe | Wajib | Validasi | Keterangan |
|-----------|------|-------|----------|------------|
| `projectId` | `string` | Ya | UUID (via `ParseUUIDPipe`) | UUID project |

#### Request Body

| Field | Tipe | Wajib | Validasi | Keterangan |
|-------|------|-------|----------|------------|
| `key` | `string` | Ya | Enum: `severity` | Key setting yang akan diatur |
| `values` | `any` | Ya | Tidak ada validasi tipe spesifik | Nilai setting (di-serialize ke JSON string saat disimpan) |

**Contoh Request Body untuk Severity Setting:**
```json
{
  "key": "severity",
  "values": [
    { "level": "critical", "threshold": 5000 },
    { "level": "high", "threshold": 2000 },
    { "level": "medium", "threshold": 1000 },
    { "level": "low", "threshold": 0 }
  ]
}
```

**Schema `IProjectSettingKeySeverity` (untuk key `severity`):**

| Field | Tipe | Keterangan |
|-------|------|------------|
| `level` | `string` | Enum: `low`, `medium`, `high`, `critical` (dari `QueryTransactionSeverityEnum`) |
| `threshold` | `number` | Threshold waktu eksekusi dalam milidetik |

#### Response

**HTTP 201 - Created**
```json
{
  "message": "Project setting created successfully",
  "data": {
    "id": "uuid",
    "project": {
      "id": "uuid",
      "name": "My Project",
      "description": "...",
      "status": "active"
    },
    "key": "severity",
    "values": [
      { "level": "critical", "threshold": 5000 },
      { "level": "high", "threshold": 2000 },
      { "level": "medium", "threshold": 1000 },
      { "level": "low", "threshold": 0 }
    ]
  }
}
```

#### Business Logic (Create or Update / Upsert)
1. Cek apakah setting dengan `key` yang sama sudah ada untuk `projectId` ini
2. **Jika sudah ada:** Update field `values` dengan `JSON.stringify(payload.values)`, simpan entity yang sudah ada
3. **Jika belum ada:** Buat record baru dengan `projectId`, `key`, dan `values` (di-stringify)
4. Return entity yang disimpan

**Catatan:** Operasi ini bersifat **upsert** - satu project hanya bisa memiliki satu setting per key. POST kedua dengan key yang sama akan meng-update, bukan membuat duplikat.

---

### 3. Delete Project Settings

**Path:** `DELETE /v1/projects/:projectId/settings`
**Permission:** `RESOURCE.PROJECT_SETTING` + `OPERATION.DELETE`

#### Path Parameters

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| `projectId` | `string` | Ya | UUID project |

#### Request Body

| Field | Tipe | Wajib | Validasi | Keterangan |
|-------|------|-------|----------|------------|
| `ids` | `string[]` | Ya | Array of UUID | Daftar ID setting yang akan dihapus |

**Contoh Request Body:**
```json
{
  "ids": ["550e8400-e29b-41d4-a716-446655440000"]
}
```

#### Response

**HTTP 200 - OK**
```json
{
  "message": "Project key deleted successfully"
}
```

**Catatan:** Pesan response masih menyebut "Project key" (bukan "Project setting") - kemungkinan copy-paste oversight di code.

#### Business Logic
1. Validasi bahwa semua `ids` ditemukan di database. Jika jumlah yang ditemukan tidak sama, throw `NotFoundException`
2. Eksekusi **hard delete** pada semua setting records (menggunakan TypeORM `delete`, bukan `softDelete`)

---

## Aksi

| Aksi | Behavior |
|------|----------|
| **GET /v1/projects/:projectId/settings** | Mengambil daftar settings project dengan pagination dan filter key |
| **POST /v1/projects/:projectId/settings** | Membuat atau memperbarui setting project (upsert berdasarkan key) |
| **DELETE /v1/projects/:projectId/settings** | Hard delete satu atau lebih setting berdasarkan ID |

---

## Navigasi

| Dari | Ke |
|------|-----|
| Detail project | `GET /v1/projects/:id` |
| Manage settings | `GET/POST/DELETE /v1/projects/:projectId/settings` |
| Dampak ke severity determination | `POST /v1/query-transaction-events/capture` (severity lookup) |
| Manage project | `GET/POST/PUT/DELETE /v1/projects` |

---

## Setting Keys yang Tersedia

### `severity`

Mengatur threshold kustom untuk penentuan severity pada query transaction events.

**Default thresholds (jika setting tidak ada):**

| Severity | Default Threshold (ms) |
|----------|----------------------|
| `critical` | >= 2000 |
| `high` | >= 1000 |
| `medium` | >= 500 |
| `low` | >= 0 |

**Cara kerja:**
- Saat event di-capture (`POST /v1/query-transaction-events/capture`), service mengambil setting `severity` untuk project terkait
- Jika ditemukan, threshold default di-override dengan nilai dari setting
- Pengecekan dilakukan dari severity tertinggi ke terendah
- Jika tidak ditemukan atau values kosong, menggunakan default thresholds

---

## Special Cases

| Skenario | Penanganan |
|----------|------------|
| `key` bukan enum value yang valid | Validasi Zod gagal (harus `severity`), HTTP 400 |
| `values` dengan format tidak sesuai | Tidak ada validasi tipe pada level Zod (`z.any()`). Values di-stringify apa adanya. Potensi error terjadi saat values di-parse kembali di `determineSeverity` |
| POST dengan key yang sudah ada untuk project | Update existing record (upsert behavior), bukan duplikasi |
| `projectId` bukan UUID valid pada create | `ParseUUIDPipe` menolak, HTTP 400 |
| `ids` berisi UUID yang tidak ditemukan | Throw `NotFoundException` dengan pesan "Data not found" |
| Delete setting severity yang sedang digunakan | Setting langsung terhapus (hard delete). Capture event berikutnya akan menggunakan default thresholds |
| `values` null atau undefined | Di-stringify menjadi `"null"` atau `"undefined"`, berpotensi error saat di-parse |
| Pagination tanpa filter key | Mengembalikan semua settings untuk project tersebut |
| Permission pada POST menggunakan `PROJECT_SLACK_CHANNEL` resource | Kemungkinan oversight di code - user dengan permission `PROJECT_SLACK_CHANNEL.CREATE` bisa membuat setting |
| Response pesan delete masih menyebut "Project key" | Oversight di code - tidak mempengaruhi fungsionalitas |
