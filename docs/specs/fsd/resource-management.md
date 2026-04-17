# FSD: Resource Management

**Path:** `GET /v1/resources`, `GET /v1/resources/:id`

---

## Deskripsi

Endpoint read-only untuk menampilkan daftar resource yang tersedia dalam sistem RBAC. Resource merepresentasikan entitas atau modul yang dapat diakses (contoh: `project`, `role`, `permission`).

---

## Konten

### Request

#### GET /v1/resources (Paginate)

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
| slug | string | Tidak | - | - | Filter berdasarkan slug resource |

#### GET /v1/resources/:id (Detail)

**Headers:**

| Header | Tipe | Wajib | Keterangan |
|--------|------|-------|------------|
| Authorization | Bearer Token | Ya | Access Token JWT |

**Path Parameters:**

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| id | string | Ya | ID resource (UUID) |

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
        "name": "string",
        "description": "string | undefined"
      }
    ]
  },
  "message": "Resource pagination retrieved successfully"
}
```

#### Detail Response

```json
{
  "data": {
    "id": "uuid",
    "slug": "string",
    "name": "string",
    "description": "string | undefined"
  },
  "message": "Resource retrieved successfully"
}
```

---

## Aksi

| Aksi | Behavior |
|------|----------|
| **GET /v1/resources** | Mengambil daftar resource dengan paginasi. Mendukung filter berdasarkan `slug` dan pencarian umum via `search`. Memerlukan permission `PERMISSION.VIEW`. |
| **GET /v1/resources/:id** | Mengambil detail satu resource berdasarkan ID. Memerlukan permission `PERMISSION.VIEW`. |

---

## Navigasi

| Dari | Ke |
|------|-----|
| Resource list | GET /v1/resources/:id (detail) |
| Permission detail | GET /v1/resources/:id (resource yang terkait) |

---

## Special Cases

| Skenario | Penanganan |
|----------|------------|
| Resource ID tidak ditemukan | Throw error dari `findOneByIdOrFail` (404 Not Found) |
| Tidak memiliki permission `PERMISSION.VIEW` | 403 Forbidden |
| Token tidak valid atau tidak ada | 401 Unauthorized |
| `perPage` kurang dari 1 | Validasi Zod gagal: "perPage must be at least 1" |
| `page` kurang dari 1 | Validasi Zod gagal: "page must be at least 1" |
| Field `description` kosong | Dikembalikan sebagai `undefined` dalam response |
