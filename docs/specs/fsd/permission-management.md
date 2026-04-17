# FSD: Permission Management

**Path:** `GET /v1/permissions`, `GET /v1/permissions/:permissionId`

---

## Deskripsi

Endpoint read-only untuk menampilkan daftar permission yang tersedia dalam sistem RBAC. Setiap permission merupakan kombinasi dari Resource dan Operation (contoh: `project.view`, `role.create`).

---

## Konten

### Request

#### GET /v1/permissions (Paginate)

**Headers:**

| Header | Tipe | Wajib | Keterangan |
|--------|------|-------|------------|
| Authorization | Bearer Token | Ya | Access Token JWT |

**Query Parameters:**

| Parameter | Tipe | Wajib | Default | Validasi | Keterangan |
|-----------|------|-------|---------|----------|------------|
| sort | string | Tidak | `updated_at` | - | Kolom untuk sorting |
| order | string | Tidak | `DESC` | `ASC` \| `DESC` | Arah sorting |
| perPage | number | Tidak | `10` | min: 1 | Jumlah item per halaman |
| page | number | Tidak | `1` | min: 1 | Nomor halaman |
| search | string | Tidak | - | - | Kata kunci pencarian |
| slug | string | Tidak | - | - | Filter berdasarkan slug permission |

#### GET /v1/permissions/:permissionId (Detail)

**Headers:**

| Header | Tipe | Wajib | Keterangan |
|--------|------|-------|------------|
| Authorization | Bearer Token | Ya | Access Token JWT |

**Path Parameters:**

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| permissionId | string | Ya | ID permission (UUID) |

### Response

#### Paginate Response

```json
{
  "data": {
    "meta": {
      "page": 1,
      "perPage": 10,
      "total": 100,
      "totalPage": 10
    },
    "items": [
      {
        "id": "uuid",
        "name": "string",
        "slug": "string",
        "description": "string | undefined",
        "resource": {
          "id": "uuid",
          "slug": "string",
          "name": "string",
          "description": "string | undefined"
        },
        "operation": {
          "id": "uuid",
          "slug": "string",
          "name": "string"
        }
      }
    ]
  },
  "message": "Permission pagination retrieved successfully"
}
```

#### Detail Response

```json
{
  "data": {
    "id": "uuid",
    "name": "string",
    "slug": "string",
    "description": "string | undefined",
    "resource": {
      "id": "uuid",
      "slug": "string",
      "name": "string",
      "description": "string | undefined"
    },
    "operation": {
      "id": "uuid",
      "slug": "string",
      "name": "string"
    }
  },
  "message": "Permission retrieved successfully"
}
```

---

## Aksi

| Aksi | Behavior |
|------|----------|
| **GET /v1/permissions** | Mengambil daftar permission dengan paginasi. Mendukung filter berdasarkan `slug` dan pencarian umum via `search`. Memerlukan permission `PERMISSION.VIEW`. |
| **GET /v1/permissions/:permissionId** | Mengambil detail satu permission berdasarkan ID, termasuk relasi Resource dan Operation. Memerlukan permission `PERMISSION.VIEW`. |

---

## Navigasi

| Dari | Ke |
|------|-----|
| Permission list | GET /v1/permissions/:permissionId (detail) |
| Permission detail - resource | GET /v1/resources/:id |
| Permission detail - operation | GET /v1/operations/:id |

---

## Special Cases

| Skenario | Penanganan |
|----------|------------|
| Permission ID tidak ditemukan | Throw error dari `findOrFailByIdWithRelations` (404 Not Found) |
| Tidak memiliki permission `PERMISSION.VIEW` | 403 Forbidden |
| Token tidak valid atau tidak ada | 401 Unauthorized |
| `perPage` kurang dari 1 | Validasi Zod gagal: "perPage must be at least 1" |
| `page` kurang dari 1 | Validasi Zod gagal: "page must be at least 1" |
| Relasi resource/operation null | Field `resource` dan `operation` tidak disertakan dalam response jika null |
