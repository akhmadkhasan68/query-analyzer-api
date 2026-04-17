# FSD: Operation Management

**Path:** `GET /v1/operations`, `GET /v1/operations/:id`

---

## Deskripsi

Endpoint read-only untuk menampilkan daftar operation yang tersedia dalam sistem RBAC. Operation merepresentasikan jenis aksi yang dapat dilakukan pada resource (contoh: `view`, `create`, `update`, `delete`).

---

## Konten

### Request

#### GET /v1/operations (Paginate)

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
| slug | string | Tidak | - | - | Filter berdasarkan slug operation |

#### GET /v1/operations/:id (Detail)

**Headers:**

| Header | Tipe | Wajib | Keterangan |
|--------|------|-------|------------|
| Authorization | Bearer Token | Ya | Access Token JWT |

**Path Parameters:**

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| id | string | Ya | ID operation (UUID) |

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
        "slug": "string",
        "name": "string"
      }
    ]
  },
  "message": "Operation pagination retrieved successfully"
}
```

#### Detail Response

```json
{
  "data": {
    "id": "uuid",
    "slug": "string",
    "name": "string"
  },
  "message": "Operation retrieved successfully"
}
```

---

## Aksi

| Aksi | Behavior |
|------|----------|
| **GET /v1/operations** | Mengambil daftar operation dengan paginasi. Mendukung filter berdasarkan `slug` dan pencarian umum via `search`. Memerlukan permission `PERMISSION.VIEW`. |
| **GET /v1/operations/:id** | Mengambil detail satu operation berdasarkan ID. Memerlukan permission `PERMISSION.VIEW`. |

---

## Navigasi

| Dari | Ke |
|------|-----|
| Operation list | GET /v1/operations/:id (detail) |
| Permission detail | GET /v1/operations/:id (operation yang terkait) |

---

## Special Cases

| Skenario | Penanganan |
|----------|------------|
| Operation ID tidak ditemukan | Throw error dari `findOneByIdOrFail` (404 Not Found) |
| Tidak memiliki permission `PERMISSION.VIEW` | 403 Forbidden |
| Token tidak valid atau tidak ada | 401 Unauthorized |
| `perPage` kurang dari 1 | Validasi Zod gagal: "perPage must be at least 1" |
| `page` kurang dari 1 | Validasi Zod gagal: "page must be at least 1" |
| Response tidak memiliki field `description` | Berbeda dari Resource, Operation hanya memiliki `id`, `slug`, dan `name` |
