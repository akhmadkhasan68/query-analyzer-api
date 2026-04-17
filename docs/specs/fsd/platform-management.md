# FSD: Platform Management

**Path:** `GET /v1/platforms`, `GET /v1/platforms/:id`, `POST /v1/platforms`, `PUT /v1/platforms/:id`, `DELETE /v1/platforms`

---

## Deskripsi

Endpoint CRUD untuk mengelola definisi platform. Setiap platform merupakan kombinasi unik dari framework, ORM provider, dan database provider (contoh: NestJS + TypeORM + PostgreSQL).

---

## Konten

### Request

#### GET /v1/platforms (Paginate)

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
| framework | string | Tidak | - | - | Filter berdasarkan nama framework |
| ormProvider | string | Tidak | - | - | Filter berdasarkan nama ORM provider |
| databaseProvider | string | Tidak | - | - | Filter berdasarkan nama database provider |

#### GET /v1/platforms/:id (Detail)

**Headers:**

| Header | Tipe | Wajib | Keterangan |
|--------|------|-------|------------|
| Authorization | Bearer Token | Ya | Access Token JWT |

**Path Parameters:**

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| id | string | Ya | ID platform (UUID) |

#### POST /v1/platforms (Create)

**Headers:**

| Header | Tipe | Wajib | Keterangan |
|--------|------|-------|------------|
| Authorization | Bearer Token | Ya | Access Token JWT |

**Request Body:**

| Field | Tipe | Wajib | Validasi | Keterangan |
|-------|------|-------|----------|------------|
| framework | string | Ya | min: 2, max: 100 | Nama framework (contoh: "NestJS", "Laravel") |
| ormProvider | string | Ya | min: 2, max: 100 | Nama ORM provider (contoh: "TypeORM", "Prisma") |
| databaseProvider | string | Ya | min: 2, max: 100 | Nama database provider (contoh: "PostgreSQL", "MySQL") |

```json
{
  "framework": "NestJS",
  "ormProvider": "TypeORM",
  "databaseProvider": "PostgreSQL"
}
```

#### PUT /v1/platforms/:id (Update)

**Headers:**

| Header | Tipe | Wajib | Keterangan |
|--------|------|-------|------------|
| Authorization | Bearer Token | Ya | Access Token JWT |

**Path Parameters:**

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| id | string | Ya | ID platform (UUID) |

**Request Body:** Sama dengan Create (semua field wajib).

| Field | Tipe | Wajib | Validasi | Keterangan |
|-------|------|-------|----------|------------|
| framework | string | Ya | min: 2, max: 100 | Nama framework |
| ormProvider | string | Ya | min: 2, max: 100 | Nama ORM provider |
| databaseProvider | string | Ya | min: 2, max: 100 | Nama database provider |

#### DELETE /v1/platforms (Bulk Delete)

**Headers:**

| Header | Tipe | Wajib | Keterangan |
|--------|------|-------|------------|
| Authorization | Bearer Token | Ya | Access Token JWT |

**Request Body:**

| Field | Tipe | Wajib | Validasi | Keterangan |
|-------|------|-------|----------|------------|
| ids | string[] | Ya | Array of string | Daftar ID platform yang akan dihapus |

```json
{
  "ids": ["uuid-1", "uuid-2"]
}
```

### Response

#### Paginate Response

```json
{
  "data": {
    "meta": {
      "page": 1,
      "perPage": 10,
      "total": 50,
      "totalPage": 5
    },
    "items": [
      {
        "id": "uuid",
        "framework": "string",
        "ormProvider": "string",
        "databaseProvider": "string"
      }
    ]
  },
  "message": "Platform pagination retrieved successfully"
}
```

#### Detail Response

```json
{
  "data": {
    "id": "uuid",
    "framework": "string",
    "ormProvider": "string",
    "databaseProvider": "string"
  },
  "message": "Platform detail retrieved successfully"
}
```

#### Create Response

```json
{
  "data": {
    "id": "uuid",
    "framework": "NestJS",
    "ormProvider": "TypeORM",
    "databaseProvider": "PostgreSQL"
  },
  "message": "Platform created successfully"
}
```

#### Update Response

```json
{
  "message": "Platform updated successfully"
}
```

#### Delete Response

```json
{
  "message": "Platforms deleted successfully"
}
```

---

## Aksi

| Aksi | Behavior |
|------|----------|
| **GET /v1/platforms** | Mengambil daftar platform dengan paginasi. Mendukung filter berdasarkan `framework`, `ormProvider`, `databaseProvider`. Memerlukan permission `PROJECT.VIEW`. |
| **GET /v1/platforms/:id** | Mengambil detail satu platform berdasarkan ID. Memerlukan permission `PROJECT.VIEW`. |
| **POST /v1/platforms** | Membuat platform baru. Validasi duplikasi berdasarkan kombinasi framework + ormProvider + databaseProvider. Operasi menggunakan database transaction. Memerlukan permission `PROJECT.CREATE`. |
| **PUT /v1/platforms/:id** | Mengubah data platform. Validasi duplikasi dilakukan terlebih dahulu, lalu cek keberadaan platform by ID. Memerlukan permission `PROJECT.UPDATE`. |
| **DELETE /v1/platforms** | Menghapus satu atau lebih platform berdasarkan array ID. Setiap ID divalidasi keberadaannya. Operasi menggunakan database transaction. Memerlukan permission `PROJECT.DELETE`. |

---

## Navigasi

| Dari | Ke |
|------|-----|
| Platform list | GET /v1/platforms/:id (detail) |
| Platform list | POST /v1/platforms (buat baru) |
| Platform detail | PUT /v1/platforms/:id (update) |
| Platform list | DELETE /v1/platforms (hapus) |
| Project setting | GET /v1/platforms (pilih platform untuk project) |

---

## Special Cases

| Skenario | Penanganan |
|----------|------------|
| Platform ID tidak ditemukan (detail/update) | Throw 404 Not Found |
| Kombinasi framework + ormProvider + databaseProvider sudah ada (create/update) | Throw 422 Unprocessable Entity: "Platform with framework X, orm provider Y and database provider Z already exists" |
| Salah satu ID pada bulk delete tidak ditemukan | Throw 404 Not Found: "Platform with id {id} not found" dan proses dihentikan |
| Field kurang dari 2 karakter | Validasi Zod gagal |
| Field lebih dari 100 karakter | Validasi Zod gagal |
| Create menggunakan transaction | Jika terjadi error, perubahan di-rollback |
| Delete menggunakan transaction | Jika terjadi error pada salah satu ID, semua operasi delete di-rollback |
| Update response tidak mengembalikan data | Response hanya berisi `message`, tanpa field `data` |
| Entity disimpan di tabel `platforms` | Kolom: `framework`, `ormProvider`, `databaseProvider` + kolom dari BaseEntity |
