# FSD: Authentication Session Management

**Path:** `GET /v1/iam/auth/me` | `POST /v1/iam/auth/refresh-token` | `DELETE /v1/iam/auth/logout`

---

## Deskripsi

Endpoint untuk manajemen sesi pengguna: mengambil informasi user yang sedang login, memperbarui access token menggunakan refresh token, dan melakukan logout dengan menghapus semua refresh token.

---

## Konten

### 1. Get Current User (Me)

#### Request

**Headers:**

| Header | Nilai | Wajib |
|--------|-------|-------|
| `Authorization` | `Bearer <access_token>` | Ya |

**Parameters:** Tidak ada.

#### Response

**Success (200 OK):**

```json
{
  "message": "User information retrieved successfully",
  "data": {
    "id": "uuid",
    "fullname": "string",
    "email": "string",
    "phoneNumber": "string",
    "roles": [
      {
        "id": "uuid",
        "name": "string",
        "slug": "string",
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

### 2. Refresh Token

#### Request

**Headers:**

| Header | Nilai | Wajib |
|--------|-------|-------|
| `Authorization` | `Bearer <refresh_token>` | Ya |

**Parameters:** Tidak ada body. Refresh token dikirim via header Authorization.

#### Response

**Success (200 OK):**

```json
{
  "message": "Refresh token successful",
  "data": {
    "user": {
      "id": "uuid",
      "fullname": "string",
      "email": "string",
      "phoneNumber": "string",
      "roles": []
    },
    "token": {
      "accessToken": "string (JWT baru)",
      "accessTokenExpiresIn": "datetime (ISO 8601)",
      "refreshToken": "string (refresh token yang sama)",
      "refreshTokenExpiresIn": "datetime (ISO 8601, waktu kadaluarsa asli)"
    }
  }
}
```

**Error (401 Unauthorized):**

```json
{
  "message": "Refresh token expired"
}
```

---

### 3. Logout

#### Request

**Headers:**

| Header | Nilai | Wajib |
|--------|-------|-------|
| `Authorization` | `Bearer <access_token>` | Ya |

**Parameters:** Tidak ada.

#### Response

**Success (200 OK):**

```json
{
  "message": "Logout successful",
  "data": null
}
```

---

## Aksi

| Aksi | Behavior |
|------|----------|
| **GET /v1/iam/auth/me** | Mengambil data user dari JWT payload (melalui `@GetUserLogged()` decorator). JWT strategy memvalidasi token lalu melakukan lookup user beserta relasi di database via `findOneByIdWithRelations`. Mengembalikan data user termasuk roles dan permissions. |
| **POST /v1/iam/auth/refresh-token** | Menggunakan `JwtRefreshAuthGuard` (bukan global JWT guard). Refresh token di-decode untuk mendapatkan UUID, lalu dicari di database (`user_tokens` dengan tipe `RefreshToken`). Jika valid dan belum expired, menghasilkan access token baru. Refresh token **tidak** dirotasi -- token yang sama dikembalikan dengan waktu kadaluarsa aslinya. |
| **DELETE /v1/iam/auth/logout** | Mencari semua refresh token milik user yang sedang login, lalu melakukan soft delete semua token tersebut. Jika tidak ada refresh token yang ditemukan, operasi tetap berhasil tanpa error. |

---

## Navigasi

| Dari | Ke |
|------|-----|
| Login berhasil | `GET /v1/iam/auth/me` |
| Access token expired | `POST /v1/iam/auth/refresh-token` |
| Refresh token expired | `POST /v1/iam/auth/login` (login ulang) |
| Selesai sesi | `DELETE /v1/iam/auth/logout` |

---

## Special Cases

| Skenario | Penanganan |
|----------|------------|
| **Me** - Token tidak valid / expired | `401 Unauthorized` dengan pesan "Unauthorized" (dari JwtStrategy) |
| **Me** - User dihapus setelah token dibuat | `401 Unauthorized` dengan pesan "Unauthorized" (user tidak ditemukan di database) |
| **Refresh Token** - Menggunakan guard berbeda | Endpoint ini menggunakan `@ExcludeGlobalGuard()` dan `@UseGuards(JwtRefreshAuthGuard)` secara eksplisit, sehingga tidak menggunakan JWT access token guard global |
| **Refresh Token** - Token expired di database | Cek ganda: pertama di `JwtRefreshStrategy.validate()`, kemudian lagi di `IamAuthV1Service.refreshToken()`. Keduanya memeriksa `expiresAt < new Date()` |
| **Refresh Token** - User terkait tidak ada | `401 Unauthorized` dengan pesan "User not found" |
| **Refresh Token** - Token tidak dirotasi | Access token baru dihasilkan, tetapi refresh token yang dikembalikan tetap sama (tidak diganti) |
| **Logout** - Tidak ada refresh token | Operasi tetap berhasil, return `data: null` tanpa error |
| **Logout** - Soft delete | Refresh token dihapus secara soft delete (`softDelete`), bukan hard delete |
| **JWT Access Token Payload** | Berisi `id`, `fullname`, `email` |
| **JWT Refresh Token Payload** | Berisi `id` (UUID dari record token di database) |
| **Token extraction** | Kedua strategy (access dan refresh) mengekstrak token dari `Authorization: Bearer <token>` header |
