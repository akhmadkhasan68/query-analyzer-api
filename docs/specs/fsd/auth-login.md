# FSD: Authentication Login

**Path:** `POST /v1/iam/auth/login`

---

## Deskripsi

Endpoint publik untuk autentikasi pengguna menggunakan email dan password. Mengembalikan JWT access token dan refresh token jika kredensial valid.

---

## Konten

### Request

**Headers:**

| Header | Nilai | Wajib |
|--------|-------|-------|
| `Content-Type` | `application/json` | Ya |

**Body (JSON):**

| Field | Tipe | Validasi | Wajib |
|-------|------|----------|-------|
| `email` | `string` | Harus berupa string (digunakan untuk lookup email atau nomor telepon) | Ya |
| `password` | `string` | Harus berupa string | Ya |

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

### Response

**Success (200 OK):**

```json
{
  "message": "Authentication successful",
  "data": {
    "user": {
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
    },
    "token": {
      "accessToken": "string (JWT)",
      "accessTokenExpiresIn": "datetime (ISO 8601)",
      "refreshToken": "string (JWT)",
      "refreshTokenExpiresIn": "datetime (ISO 8601)"
    }
  }
}
```

**Error (401 Unauthorized):**

```json
{
  "message": "Invalid credentials"
}
```

---

## Aksi

| Aksi | Behavior |
|------|----------|
| **POST /v1/iam/auth/login** | Mencari user berdasarkan email atau nomor telepon, memverifikasi password dengan bcrypt, lalu menghasilkan JWT access token dan refresh token. Refresh token disimpan ke database (`user_tokens` dengan tipe `RefreshToken`). |

---

## Navigasi

| Dari | Ke |
|------|-----|
| Login berhasil | `GET /v1/iam/auth/me` (gunakan access token) |
| Token expired | `POST /v1/iam/auth/refresh-token` |
| Lupa password | `POST /v1/iam/forgot-password/request` |
| Login via OAuth2 | `GET /v1/iam/auth/oauth2/url` |

---

## Special Cases

| Skenario | Penanganan |
|----------|------------|
| Email/nomor telepon tidak ditemukan | Return `401 Unauthorized` dengan pesan "Invalid credentials" |
| Password salah | Return `401 Unauthorized` dengan pesan "Invalid credentials" (pesan sama agar tidak bocor informasi apakah email terdaftar) |
| Endpoint ini bersifat publik | Menggunakan decorator `@Public()` sehingga tidak memerlukan JWT token |
| Lookup user | Pencarian dilakukan via `findOneByEmailOrPhoneNumber`, sehingga field `email` di request bisa diisi email maupun nomor telepon |
| JWT payload | Access token berisi `id`, `fullname`, dan `email` |
| Refresh token | Disimpan di database dengan UUID sebagai ID dan memiliki waktu kadaluarsa sesuai konfigurasi `config.jwt.refreshTokenExpiresInSeconds` |
