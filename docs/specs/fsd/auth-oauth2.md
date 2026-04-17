# FSD: Authentication OAuth2 (SSO)

**Path:** `GET /v1/iam/auth/oauth2/url` | `POST /v1/iam/auth/oauth2`

---

## Deskripsi

Endpoint publik untuk autentikasi melalui OAuth2/SSO provider (Google, Auth0). Terdiri dari dua tahap: mendapatkan authorization URL dan menukar authorization code dengan JWT token.

---

## Konten

### 1. Get OAuth2 Authorization URL

#### Request

**Headers:**

| Header | Nilai | Wajib |
|--------|-------|-------|
| - | Tidak memerlukan header khusus | - |

**Parameters:** Tidak ada.

#### Response

**Success (200 OK):**

```json
{
  "message": "OAuth2 authorization URL generated successfully.",
  "data": {
    "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&scope=..."
  }
}
```

---

### 2. OAuth2 Login (Code Exchange)

#### Request

**Headers:**

| Header | Nilai | Wajib |
|--------|-------|-------|
| `Content-Type` | `application/json` | Ya |

**Body (JSON):**

| Field | Tipe | Validasi | Wajib |
|-------|------|----------|-------|
| `code` | `string` | Harus berupa string (authorization code dari provider) | Ya |

```json
{
  "code": "4/0AY0e-g7..."
}
```

#### Response

**Success (200 OK):**

```json
{
  "message": "Login via OAuth2 successful.",
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
          "permissions": []
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
| **GET /v1/iam/auth/oauth2/url** | Mengambil provider OAuth2 yang dikonfigurasi (dari `config.sso.oauth2.provider`), lalu men-generate authorization URL yang harus dikunjungi user di browser. |
| **POST /v1/iam/auth/oauth2** | Menerima authorization code, menukarnya dengan access token via OAuth2 provider, mengambil user info (email), lalu mencari user di database berdasarkan email. Jika user ditemukan, menghasilkan JWT access token dan refresh token. |

---

## Navigasi

| Dari | Ke |
|------|-----|
| Frontend | `GET /v1/iam/auth/oauth2/url` (redirect user ke URL provider) |
| Callback dari provider | `POST /v1/iam/auth/oauth2` (kirim authorization code) |
| Login berhasil | `GET /v1/iam/auth/me` (gunakan access token) |
| Alternatif login | `POST /v1/iam/auth/login` (email + password) |

---

## Special Cases

| Skenario | Penanganan |
|----------|------------|
| Seluruh controller bersifat publik | Menggunakan decorator `@Public()` di level class |
| Provider yang didukung | `auth0` dan `google` (aktif). `gitlab` dan `microsoft` belum diimplementasi dan akan throw `BadRequestException`. |
| Provider tidak dikonfigurasi | Throw `BadRequestException` dengan pesan bahwa provider belum dikonfigurasi dengan benar |
| User tidak terdaftar di database | Return `401 Unauthorized` dengan pesan "Invalid credentials". OAuth2 login **tidak** membuat user baru secara otomatis; user harus sudah ada di sistem. |
| OAuth2 result | Provider mengembalikan `IOauth2Result` berisi `userInfo` (email, fullname, picture, emailVerified) dan `provider` name |
| Provider selection | Provider ditentukan oleh environment config `config.sso.oauth2.provider`, bukan oleh request parameter |
