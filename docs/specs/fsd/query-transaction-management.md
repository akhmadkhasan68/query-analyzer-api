# FSD: Query Transaction Management

**Path:** `POST /v1/query-transactions`, `GET /v1/query-transaction-events`, `POST /v1/query-transaction-events/notify`

---

## Deskripsi

Kumpulan endpoint untuk mengelola query transactions dan query transaction events. Mencakup pembuatan transaction manual, pagination/listing events, dan trigger notifikasi Slack secara manual untuk event tertentu.

---

## Konten

### 1. Create Query Transaction

**Path:** `POST /v1/query-transactions`
**Auth:** JWT Bearer Token (`AccessToken`)

#### Request Body

| Field | Tipe | Wajib | Validasi | Keterangan |
|-------|------|-------|----------|------------|
| `projectId` | `string` | Ya | UUID format | ID project yang terkait |
| `rawQuery` | `string` | Ya | Non-empty string | SQL/ORM query mentah |
| `parameters` | `Record<string, any>` | Ya | Object/map | Parameter binding dari query |
| `signature` | `string` | Ya | Min 1, Max 2048 chars | Signature unik untuk de-duplikasi |
| `totalExecutionTime` | `number` | Ya | Min 0 | Total waktu eksekusi kumulatif (ms) |
| `averageExecutionTime` | `number` | Ya | Min 0 | Rata-rata waktu eksekusi (ms) |
| `maxExecutionTime` | `number` | Ya | Min 0 | Waktu eksekusi maksimum (ms) |
| `minExecutionTime` | `number` | Ya | Min 0 | Waktu eksekusi minimum (ms) |
| `environment` | `string` | Ya | Min 1, Max 100 chars | Environment aplikasi |

**Contoh Request Body:**
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "rawQuery": "SELECT * FROM orders WHERE user_id = $1",
  "parameters": { "$1": 123 },
  "signature": "a1b2c3d4e5f6...",
  "totalExecutionTime": 1500,
  "averageExecutionTime": 1500,
  "maxExecutionTime": 1500,
  "minExecutionTime": 1500,
  "environment": "production"
}
```

#### Response

**HTTP 201 - Created**
```json
{
  "message": "Successfully created query transaction",
  "data": {
    "id": "uuid",
    "signature": "a1b2c3d4e5f6...",
    "description": null,
    "status": "open",
    "firstOccurrence": "2026-04-17T10:30:00.000Z",
    "occurrenceCount": 1,
    "totalExecutionTime": 1500,
    "averageExecutionTime": 1500,
    "maxExecutionTime": 1500,
    "minExecutionTime": 1500,
    "environment": "production",
    "severity": "high",
    "assignedTo": null,
    "assignedAt": null,
    "assignedBy": null,
    "tags": null,
    "notes": null
  }
}
```

#### Business Logic
1. Validasi project existence dengan relasi `platform`
2. Set `firstOccurrence` ke `new Date()` (waktu server)
3. Set `occurrenceCount` ke `1`
4. Set `status` ke `OPEN`
5. Simpan ke database

---

### 2. Paginate Query Transaction Events

**Path:** `GET /v1/query-transaction-events`
**Auth:** JWT Bearer Token (`AccessToken`) - menggunakan global guard

#### Query Parameters

| Parameter | Tipe | Wajib | Default | Validasi | Keterangan |
|-----------|------|-------|---------|----------|------------|
| `page` | `number` | Tidak | `1` | Min 1 | Halaman saat ini |
| `perPage` | `number` | Tidak | `10` | Min 1 | Jumlah item per halaman |
| `sort` | `string` | Tidak | `updated_at` | String | Field untuk sorting |
| `order` | `string` | Tidak | `DESC` | Enum: `ASC`, `DESC` | Urutan sorting |
| `search` | `string` | Tidak | - | String | Kata kunci pencarian |
| `severity` | `string` | Tidak | - | Enum: `low`, `medium`, `high`, `critical` | Filter berdasarkan severity |

#### Response

**HTTP 200 - OK**
```json
{
  "message": "Events retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "project": {
          "id": "uuid",
          "name": "My Project",
          "description": "...",
          "status": "active",
          "platform": { ... },
          "keys": [ ... ],
          "projectGitlab": { ... }
        },
        "queryId": "uuid",
        "rawQuery": "SELECT * FROM users WHERE ...",
        "executionTimeMs": 1500,
        "timestamp": "2026-04-17T10:30:00.000Z",
        "receivedAt": "2026-04-17T10:30:01.000Z",
        "environment": "production",
        "severity": "high",
        "createdAt": "2026-04-17T10:30:01.000Z",
        "updatedAt": "2026-04-17T10:30:01.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "perPage": 10,
      "total": 50,
      "totalPage": 5
    }
  }
}
```

---

### 3. Notify Events (Trigger Slack Notification)

**Path:** `POST /v1/query-transaction-events/notify`
**Auth:** Tidak ada (endpoint public via `@ExcludeGlobalGuard()`, tanpa guard tambahan)

#### Request Body

| Field | Tipe | Wajib | Validasi | Keterangan |
|-------|------|-------|----------|------------|
| `queryIds` | `string[]` | Ya | Array of UUID, min 1 item | Daftar query ID event yang akan di-notifikasi |

**Contoh Request Body:**
```json
{
  "queryIds": [
    "550e8400-e29b-41d4-a716-446655440000",
    "660e8400-e29b-41d4-a716-446655440001"
  ]
}
```

#### Response

**HTTP 201 - Created**
```json
{
  "message": "Notification process triggered",
  "data": null
}
```

**HTTP 404 - Not Found** (jika ada queryId yang tidak ditemukan)
```json
{
  "message": "Data with ids [uuid1, uuid2] not found"
}
```

#### Business Logic
1. Cari semua events berdasarkan `queryIds` (field `queryId` pada event)
2. Jika jumlah events yang ditemukan tidak sama dengan jumlah `queryIds`, throw `NotFoundException` dengan daftar ID yang tidak ditemukan
3. Kumpulkan unique `projectIds` dari semua events
4. Ambil semua Slack channels yang terkait dengan project-project tersebut
5. Untuk setiap event:
   - Filter Slack channels yang sesuai dengan project event
   - Kirim Slack message ke semua channel menggunakan template `queryTransactionEventAlert`
   - Jika gagal, error di-log tapi tidak menghentikan proses event lainnya

---

## Aksi

| Aksi | Behavior |
|------|----------|
| **POST /v1/query-transactions** | Membuat query transaction baru secara manual (JWT auth) |
| **GET /v1/query-transaction-events** | Mengambil daftar event dengan pagination dan filter severity (JWT auth) |
| **POST /v1/query-transaction-events/notify** | Mengirim notifikasi Slack untuk event tertentu berdasarkan queryId (public, untuk testing) |

---

## Navigasi

| Dari | Ke |
|------|-----|
| Capture event otomatis | `POST /v1/query-transaction-events/capture` |
| Buat transaction manual | `POST /v1/query-transactions` |
| Lihat daftar events | `GET /v1/query-transaction-events` |
| Trigger notifikasi | `POST /v1/query-transaction-events/notify` |
| Manage project | `GET/POST/PUT/DELETE /v1/projects` |

---

## Special Cases

| Skenario | Penanganan |
|----------|------------|
| `projectId` tidak ditemukan saat create transaction | Throw `NotFoundException` dari repository `findOneOrFailByIdWithRelations` |
| `signature` melebihi 2048 karakter | Validasi Zod gagal, HTTP 400 Bad Request |
| Execution time bernilai negatif | Validasi Zod gagal (`min(0)`), HTTP 400 Bad Request |
| `environment` kosong atau melebihi 100 karakter | Validasi Zod gagal, HTTP 400 Bad Request |
| `queryIds` array kosong pada notify | Validasi Zod gagal (`min(1)`), HTTP 400 Bad Request |
| Sebagian `queryIds` tidak ditemukan pada notify | Throw `NotFoundException` dengan daftar ID yang tidak ditemukan, proses dibatalkan |
| Project tidak memiliki Slack channel saat notify | Event di-skip (channel array kosong), tidak error |
| Slack notification gagal untuk satu event | Error di-log, proses lanjut ke event berikutnya |
| Pagination tanpa parameter | Default: `page=1`, `perPage=10`, `sort=updated_at`, `order=DESC` |
| Filter severity dengan nilai invalid | Validasi Zod gagal (bukan enum value), HTTP 400 Bad Request |
| POST /v1/query-transaction-events/notify tanpa auth | Endpoint bersifat public (`@ExcludeGlobalGuard()`), tidak memerlukan autentikasi. Ditujukan untuk keperluan testing |
