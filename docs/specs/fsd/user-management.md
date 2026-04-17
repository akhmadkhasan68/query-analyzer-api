# FSD: User Management

**Path:** `GET /v1/users` | `POST /v1/users` | `GET /v1/users/:userId` | `PATCH /v1/users/:userId` | `PATCH /v1/users/:userId/password` | `DELETE /v1/users/:userId`

---

## Deskripsi

CRUD lengkap untuk manajemen user termasuk pagination, pembuatan user dengan role assignment, update profil, update password, dan soft delete. Semua endpoint memerlukan autentikasi JWT dan permission yang sesuai.

---

## Konten

### 1. Paginate Users

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
| `emailVerfied` | `boolean` | - | Filter berdasarkan status verifikasi email | Tidak |
| `phoneNumberVerified` | `boolean` | - | Filter berdasarkan status verifikasi nomor telepon | Tidak |

**Permission:** `RESOURCE.USER` + `OPERATION.VIEW`

#### Response

**Success (200 OK):**

```json
{
  "message": "User pagination retrieved successfully",
  "data": {
    "meta": {
      "page": 1,
      "perPage": 10,
      "total": 100,
      "totalPages": 10
    },
    "items": [
      {
        "id": "uuid",
        "fullname": "string",
        "email": "string",
        "phoneNumber": "string",
        "roles": [
          {
            "id": "uuid",
            "name": "string",
            "slug": "string",
            "permissions": []
          }
        ]
      }
    ]
  }
}
```

---

### 2. Create User

#### Request

**Headers:**

| Header | Nilai | Wajib |
|--------|-------|-------|
| `Authorization` | `Bearer <access_token>` | Ya |
| `Content-Type` | `application/json` | Ya |

**Body (JSON):**

| Field | Tipe | Validasi | Wajib |
|-------|------|----------|-------|
| `fullname` | `string` | Minimal 1 karakter (tidak boleh kosong) | Ya |
| `email` | `string` | Harus berupa email valid (`z.string().email()`) | Ya |
| `password` | `string` | Minimal 8 karakter, harus memenuhi `REGEX.PASSWORD` (huruf besar, huruf kecil, angka, karakter spesial) | Ya |
| `phoneNumber` | `string` | Harus memenuhi `REGEX.PHONE_NUMBER_ID` (format nomor telepon Indonesia), harus numerik | Ya |
| `roleIds` | `string[]` | Array UUID, minimal 1 item. Setiap ID harus berupa UUID valid. | Ya |

```json
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "phoneNumber": "081234567890",
  "roleIds": ["uuid-role-1", "uuid-role-2"]
}
```

**Permission:** `RESOURCE.USER` + `OPERATION.CREATE`

#### Response

**Success (201 Created):**

```json
{
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "fullname": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "081234567890",
    "roles": [
      {
        "id": "uuid-role-1",
        "name": "Admin",
        "slug": "admin",
        "permissions": []
      }
    ]
  }
}
```

---

### 3. Get User by ID

#### Request

**Headers:**

| Header | Nilai | Wajib |
|--------|-------|-------|
| `Authorization` | `Bearer <access_token>` | Ya |

**Path Parameters:**

| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `userId` | `string` | UUID user |

**Permission:** `RESOURCE.USER` + `OPERATION.VIEW`

#### Response

**Success (200 OK):**

```json
{
  "message": "User retrieved successfully",
  "data": {
    "id": "uuid",
    "fullname": "string",
    "email": "string",
    "phoneNumber": "string",
    "roles": []
  }
}
```

---

### 4. Update User

#### Request

**Headers:**

| Header | Nilai | Wajib |
|--------|-------|-------|
| `Authorization` | `Bearer <access_token>` | Ya |
| `Content-Type` | `application/json` | Ya |

**Path Parameters:**

| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `userId` | `string` | UUID user |

**Body (JSON):**

| Field | Tipe | Validasi | Wajib |
|-------|------|----------|-------|
| `fullname` | `string` | Minimal 1 karakter | Ya |
| `email` | `string` | Harus berupa email valid | Ya |
| `phoneNumber` | `string` | Harus memenuhi `REGEX.PHONE_NUMBER_ID`, harus numerik | Ya |
| `roleIds` | `string[]` | Array UUID, minimal 1 item jika diberikan | Tidak |

```json
{
  "fullname": "John Doe Updated",
  "email": "john.updated@example.com",
  "phoneNumber": "081234567891",
  "roleIds": ["uuid-role-1"]
}
```

**Permission:** `RESOURCE.USER` + `OPERATION.UPDATE`

#### Response

**Success (200 OK):**

```json
{
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "fullname": "John Doe Updated",
    "email": "john.updated@example.com",
    "phoneNumber": "081234567891",
    "roles": []
  }
}
```

---

### 5. Update User Password

#### Request

**Headers:**

| Header | Nilai | Wajib |
|--------|-------|-------|
| `Authorization` | `Bearer <access_token>` | Ya |
| `Content-Type` | `application/json` | Ya |

**Path Parameters:**

| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `userId` | `string` | UUID user |

**Body (JSON):**

| Field | Tipe | Validasi | Wajib |
|-------|------|----------|-------|
| `newPassword` | `string` | Minimal 8 karakter, harus memenuhi `REGEX.PASSWORD` | Ya |

```json
{
  "newPassword": "NewSecurePassword123!"
}
```

**Permission:** `RESOURCE.USER` + `OPERATION.UPDATE`

#### Response

**Success (200 OK):**

```json
{
  "message": "User update password Successfully",
  "data": {
    "id": "uuid",
    "fullname": "string",
    "email": "string",
    "phoneNumber": "string",
    "roles": []
  }
}
```

---

### 6. Delete User

#### Request

**Headers:**

| Header | Nilai | Wajib |
|--------|-------|-------|
| `Authorization` | `Bearer <access_token>` | Ya |

**Path Parameters:**

| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `userId` | `string` | UUID user |

**Permission:** `RESOURCE.USER` + `OPERATION.DELETE`

#### Response

**Success (200 OK):**

```json
{
  "message": "User deleted successfully",
  "data": null
}
```

---

## Aksi

| Aksi | Behavior |
|------|----------|
| **GET /v1/users** | Paginasi user dengan filter dan sorting. Menggunakan repository `paginate()`. |
| **POST /v1/users** | Membuat user baru dengan role assignment. Menggunakan database transaction. Memvalidasi semua `roleIds` ada di database (throw `ZodValidationException` jika ada ID yang tidak ditemukan). Password di-hash otomatis. |
| **GET /v1/users/:userId** | Mengambil detail user beserta relasi `roles` dan `roles.permissions`. |
| **PATCH /v1/users/:userId** | Mengupdate data user. Jika `roleIds` diberikan, memvalidasi dan mengupdate relasi roles. Menggunakan database transaction. |
| **PATCH /v1/users/:userId/password** | Mengupdate password user. Mengambil user terlebih dahulu, lalu set `password` ke `newPassword` dan save. |
| **DELETE /v1/users/:userId** | Soft delete user. Jika tidak ada row yang terpengaruh, throw `QueryFailedError`. |

---

## Navigasi

| Dari | Ke |
|------|-----|
| Daftar user | `GET /v1/users` |
| Detail user | `GET /v1/users/:userId` |
| Buat user baru | `POST /v1/users` |
| Edit user | `PATCH /v1/users/:userId` |
| Ganti password user | `PATCH /v1/users/:userId/password` |
| Hapus user | `DELETE /v1/users/:userId` |
| Import user | `POST /v1/users/import/excel` |
| Export user | `GET /v1/users/export/excel` |
| Manajemen role | `GET /v1/roles` |

---

## Special Cases

| Skenario | Penanganan |
|----------|------------|
| Role ID tidak ditemukan (create/update) | Throw `ZodValidationException` dengan pesan "Role Id not found: {ids}" pada path `roleIds` |
| Email atau phoneNumber duplikat (create) | Database constraint error (dihandle oleh TypeORM) |
| User tidak ditemukan (get/update/delete) | Throw `EntityNotFoundError` / `NotFoundException` |
| Delete gagal (0 affected rows) | Throw `QueryFailedError` -- "Error, Data not deleted" |
| Semua endpoint dilindungi permission | Menggunakan decorator `@Permission(RESOURCE, [OPERATION])` yang memeriksa role dan permission user |
| Password hashing | Password di-hash otomatis saat entity disimpan (melalui entity hook/subscriber) |
| Transaction | Create dan Update menggunakan `QueryRunner` dengan transaction manual (connect, start, commit/rollback, release) |
| Update password | Tidak memerlukan password lama; hanya membutuhkan `newPassword` (untuk admin reset password) |
| Pagination response | Response berisi `meta` (page, perPage, total, totalPages) dan `items` array |
