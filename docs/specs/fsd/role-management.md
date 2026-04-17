# FSD: Role Management

**Path:** `GET /v1/roles` | `POST /v1/roles` | `GET /v1/roles/:roleId` | `PATCH /v1/roles/:roleId` | `DELETE /v1/roles/:roleId` | `GET /v1/roles/:roleId/permissions`

---

## Deskripsi

CRUD lengkap untuk manajemen role termasuk pagination, pembuatan role dengan permission assignment, update role, soft delete, dan listing permission per role. Semua endpoint memerlukan autentikasi JWT dan permission yang sesuai.

---

## Konten

### 1. Paginate Roles

#### Request

**Headers:**

| Header | Nilai | Wajib |
|--------|-------|-------|
| `Authorization` | `Bearer <access_token>` | Ya |

**Query Parameters:**

| Parameter | Tipe | Default | Validasi | Wajib |
|-----------|------|---------|----------|-------|
| `page` | `number` | `1` | Minimal 1 | Tidak |
| `perPage` | `number` | `10` | Minimal 1 | Tidak |
| `sort` | `string` | `updated_at` | Nama kolom untuk sorting | Tidak |
| `order` | `string` | `DESC` | Enum: `ASC` atau `DESC` | Tidak |
| `search` | `string` | - | Pencarian teks | Tidak |
| `slug` | `string` | - | Filter berdasarkan slug role | Tidak |

**Permission:** `RESOURCE.ROLE` + `OPERATION.VIEW`

#### Response

**Success (200 OK):**

```json
{
  "message": "Role pagination retrieved successfully",
  "data": {
    "meta": {
      "page": 1,
      "perPage": 10,
      "total": 50,
      "totalPages": 5
    },
    "items": [
      {
        "id": "uuid",
        "name": "Admin",
        "slug": "admin",
        "permissions": [
          {
            "id": "uuid",
            "name": "string",
            "slug": "string",
            "description": "string",
            "resource": {},
            "operation": {}
          }
        ]
      }
    ]
  }
}
```

---

### 2. Get Role by ID

#### Request

**Headers:**

| Header | Nilai | Wajib |
|--------|-------|-------|
| `Authorization` | `Bearer <access_token>` | Ya |

**Path Parameters:**

| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `roleId` | `string` | UUID role |

**Permission:** `RESOURCE.ROLE` + `OPERATION.VIEW`

#### Response

**Success (200 OK):**

```json
{
  "message": "Role retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Admin",
    "slug": "admin",
    "permissions": [
      {
        "id": "uuid",
        "name": "string",
        "slug": "string",
        "description": "string",
        "resource": {},
        "operation": {}
      }
    ]
  }
}
```

---

### 3. Create Role

#### Request

**Headers:**

| Header | Nilai | Wajib |
|--------|-------|-------|
| `Authorization` | `Bearer <access_token>` | Ya |
| `Content-Type` | `application/json` | Ya |

**Body (JSON):**

| Field | Tipe | Validasi | Wajib |
|-------|------|----------|-------|
| `name` | `string` | Minimal 1 karakter (tidak boleh kosong) | Ya |
| `permissionIds` | `string[]` | Array UUID, minimal 1 item. Setiap ID harus berupa UUID valid. | Ya |

```json
{
  "name": "Editor",
  "permissionIds": ["uuid-perm-1", "uuid-perm-2"]
}
```

**Permission:** `RESOURCE.ROLE` + `OPERATION.CREATE`

#### Response

**Success (201 Created):**

```json
{
  "message": "Role created successfully",
  "data": {
    "id": "uuid",
    "name": "Editor",
    "slug": "editor",
    "permissions": [
      {
        "id": "uuid-perm-1",
        "name": "string",
        "slug": "string"
      }
    ]
  }
}
```

---

### 4. Update Role

#### Request

**Headers:**

| Header | Nilai | Wajib |
|--------|-------|-------|
| `Authorization` | `Bearer <access_token>` | Ya |
| `Content-Type` | `application/json` | Ya |

**Path Parameters:**

| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `roleId` | `string` | UUID role |

**Body (JSON):**

| Field | Tipe | Validasi | Wajib |
|-------|------|----------|-------|
| `name` | `string` | Minimal 1 karakter jika diberikan | Tidak |
| `permissionIds` | `string[]` | Array UUID, minimal 1 item jika diberikan | Tidak |

```json
{
  "name": "Senior Editor",
  "permissionIds": ["uuid-perm-1", "uuid-perm-3"]
}
```

**Permission:** `RESOURCE.ROLE` + `OPERATION.UPDATE`

#### Response

**Success (200 OK):**

```json
{
  "message": "Role updated successfully",
  "data": {
    "id": "uuid",
    "name": "Senior Editor",
    "slug": "senior-editor",
    "permissions": []
  }
}
```

---

### 5. Delete Role

#### Request

**Headers:**

| Header | Nilai | Wajib |
|--------|-------|-------|
| `Authorization` | `Bearer <access_token>` | Ya |

**Path Parameters:**

| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `roleId` | `string` | UUID role |

**Permission:** `RESOURCE.ROLE` + `OPERATION.DELETE`

#### Response

**Success (200 OK):**

```json
{
  "message": "Role deleted successfully",
  "data": null
}
```

---

### 6. Get Role Permissions (Paginated)

#### Request

**Headers:**

| Header | Nilai | Wajib |
|--------|-------|-------|
| `Authorization` | `Bearer <access_token>` | Ya |

**Path Parameters:**

| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `roleId` | `string` | UUID role |

**Query Parameters:**

| Parameter | Tipe | Default | Validasi | Wajib |
|-----------|------|---------|----------|-------|
| `page` | `number` | `1` | Minimal 1 | Tidak |
| `perPage` | `number` | `10` | Minimal 1 | Tidak |
| `sort` | `string` | `updated_at` | Nama kolom untuk sorting | Tidak |
| `order` | `string` | `DESC` | Enum: `ASC` atau `DESC` | Tidak |
| `search` | `string` | - | Pencarian teks | Tidak |
| `slug` | `string` | - | Filter berdasarkan slug permission | Tidak |

**Permission:** `RESOURCE.ROLE` + `OPERATION.VIEW`

#### Response

**Success (200 OK):**

```json
{
  "message": "Role pagination retrieved successfully",
  "data": {
    "meta": {
      "page": 1,
      "perPage": 10,
      "total": 20,
      "totalPages": 2
    },
    "items": [
      {
        "id": "uuid",
        "name": "user:view",
        "slug": "user-view",
        "description": "View user data",
        "resource": {
          "id": "uuid",
          "name": "user"
        },
        "operation": {
          "id": "uuid",
          "name": "view"
        }
      }
    ]
  }
}
```

---

## Aksi

| Aksi | Behavior |
|------|----------|
| **GET /v1/roles** | Paginasi role dengan filter `slug` opsional dan sorting. |
| **GET /v1/roles/:roleId** | Mengambil detail role beserta relasi `permissions`. |
| **POST /v1/roles** | Membuat role baru. Slug di-generate otomatis dari `name` menggunakan `StringUtil.convertToSlugCase()`. Memvalidasi semua `permissionIds` ada di database. Jika slug sudah ada (dari record yang di-soft-delete), slug lama diubah dengan prefix `deletedRecordPrefix` untuk menghindari konflik unique constraint. Menggunakan database transaction. |
| **PATCH /v1/roles/:roleId** | Mengupdate role. Jika `permissionIds` diberikan, memvalidasi dan mengupdate relasi permissions. Menggunakan database transaction. |
| **DELETE /v1/roles/:roleId** | Soft delete role. Jika tidak ada row yang terpengaruh, throw `QueryFailedError`. |
| **GET /v1/roles/:roleId/permissions** | Mengambil daftar permission yang dimiliki role secara paginated. Memastikan role exists terlebih dahulu. |

---

## Navigasi

| Dari | Ke |
|------|-----|
| Daftar role | `GET /v1/roles` |
| Detail role | `GET /v1/roles/:roleId` |
| Buat role baru | `POST /v1/roles` |
| Edit role | `PATCH /v1/roles/:roleId` |
| Hapus role | `DELETE /v1/roles/:roleId` |
| Lihat permission role | `GET /v1/roles/:roleId/permissions` |
| Assign role ke user | `POST /v1/users` atau `PATCH /v1/users/:userId` (via `roleIds`) |

---

## Special Cases

| Skenario | Penanganan |
|----------|------------|
| Permission ID tidak ditemukan (create/update) | Throw `ZodValidationException` dengan pesan "Permission Id not found: {ids}" pada path `permissionIds` |
| Slug duplikat dengan soft-deleted record | Slug record yang di-soft-delete diubah menjadi `{slug}-{deletedRecordPrefix}` sebelum menyimpan role baru, menghindari konflik unique constraint |
| Slug auto-generated | Slug dihasilkan dari `name` menggunakan `StringUtil.convertToSlugCase()` (contoh: "Senior Editor" menjadi "senior-editor") |
| Role tidak ditemukan (get/update/delete) | Throw `EntityNotFoundError` / `NotFoundException` |
| Delete gagal (0 affected rows) | Throw `QueryFailedError` -- "Error, Data not deleted" |
| Semua endpoint dilindungi permission | Menggunakan decorator `@Permission(RESOURCE.ROLE, [OPERATION])` |
| Transaction | Create dan Update menggunakan `QueryRunner` dengan transaction manual |
| Permission response structure | Setiap permission memiliki `id`, `name`, `slug`, `description`, serta relasi opsional `resource` dan `operation` |
| Role response | Berisi `id`, `name`, `slug`, dan array `permissions` |
| Export PDF | Tersedia di `RoleExportV1Controller` (endpoint terpisah, tidak tercakup dalam FSD ini) |
