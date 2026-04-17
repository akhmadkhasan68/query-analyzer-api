# FSD: Forgot Password

**Path:** `POST /v1/iam/forgot-password/request` | `POST /v1/iam/forgot-password/verify` | `POST /v1/iam/forgot-password/reset`

---

## Deskripsi

Alur pemulihan password melalui tiga tahap: request reset (kirim email), verifikasi token, dan reset password. Semua endpoint bersifat publik.

---

## Konten

### 1. Request Forgot Password

#### Request

**Headers:**

| Header | Nilai | Wajib |
|--------|-------|-------|
| `Content-Type` | `application/json` | Ya |

**Body (JSON):**

| Field | Tipe | Validasi | Wajib |
|-------|------|----------|-------|
| `email` | `string` | Harus berupa email valid (`z.string().email()`) | Ya |
| `redirectUrl` | `string` | Harus berupa URL valid (`z.string().url()`). Digunakan sebagai base URL untuk link reset password. | Tidak |

```json
{
  "email": "user@example.com",
  "redirectUrl": "https://app.example.com/reset-password"
}
```

#### Response

**Success (200 OK):**

```json
{
  "message": "Request for password reset was successful",
  "data": null
}
```

**Error (401 Unauthorized):**

```json
{
  "message": "User with this email or phone number does not exist"
}
```

---

### 2. Verify Token

#### Request

**Headers:**

| Header | Nilai | Wajib |
|--------|-------|-------|
| `Content-Type` | `application/json` | Ya |

**Body (JSON):**

| Field | Tipe | Validasi | Wajib |
|-------|------|----------|-------|
| `token` | `string` | Harus berupa string (JWT token dari email) | Ya |

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response

**Success (200 OK):**

```json
{
  "message": "Token verification was successful",
  "data": null
}
```

**Error (401 Unauthorized):**

```json
{
  "message": "Invalid or expired token"
}
```

---

### 3. Reset Password

#### Request

**Headers:**

| Header | Nilai | Wajib |
|--------|-------|-------|
| `Content-Type` | `application/json` | Ya |

**Body (JSON):**

| Field | Tipe | Validasi | Wajib |
|-------|------|----------|-------|
| `token` | `string` | Harus berupa string (JWT token dari email) | Ya |
| `password` | `string` | Minimal 8 karakter, harus memenuhi regex `REGEX.PASSWORD` (huruf besar, huruf kecil, angka, karakter spesial) | Ya |
| `confirmPassword` | `string` | Harus sama persis dengan field `password` | Ya |

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "password": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!"
}
```

#### Response

**Success (200 OK):**

```json
{
  "message": "Password reset was successful",
  "data": null
}
```

**Error (401 Unauthorized):**

```json
{
  "message": "Invalid or expired token"
}
```

---

## Aksi

| Aksi | Behavior |
|------|----------|
| **POST /v1/iam/forgot-password/request** | Mencari user berdasarkan email. Jika ditemukan, menghasilkan JWT reset token (secret: `config.jwt.forgotPasswordSecret`, expiry: `config.jwt.forgotPasswordExpiresInSeconds`), menyimpannya di `user_tokens` (tipe `ForgotPasswordToken`), lalu mengirim email berisi link reset `{redirectUrl}?token={resetToken}` melalui queue mail. |
| **POST /v1/iam/forgot-password/verify** | Memverifikasi token JWT menggunakan `forgotPasswordSecret`, lalu memeriksa keberadaan token di database (`user_tokens` tipe `ForgotPasswordToken`) dan memeriksa apakah token sudah expired. |
| **POST /v1/iam/forgot-password/reset** | Memverifikasi token JWT, mencari record token di database, mengambil user terkait, mengupdate password via `userV1Repository.updatePassword()`, lalu menghapus (hard delete) token dari database. |

---

## Navigasi

| Dari | Ke |
|------|-----|
| Halaman lupa password | `POST /v1/iam/forgot-password/request` |
| Klik link di email | `POST /v1/iam/forgot-password/verify` (validasi token sebelum tampilkan form) |
| Submit password baru | `POST /v1/iam/forgot-password/reset` |
| Setelah reset berhasil | `POST /v1/iam/auth/login` (login dengan password baru) |

---

## Special Cases

| Skenario | Penanganan |
|----------|------------|
| Semua endpoint bersifat publik | Menggunakan decorator `@Public()` pada setiap method |
| HTTP status code | Semua endpoint menggunakan `@HttpCode(HttpStatus.OK)` (200), bukan 201 default POST |
| Email tidak ditemukan (request) | Throw `401 Unauthorized` -- "User with this email or phone number does not exist" |
| Token JWT tidak valid (verify/reset) | Throw `401 Unauthorized` -- "Invalid or expired token" |
| Token tidak ada di database (verify/reset) | Throw `401 Unauthorized` -- "Invalid or expired token" |
| Token expired di database (verify) | Throw `401 Unauthorized` -- "Token expired" |
| User terkait token tidak ada (verify/reset) | Throw `401 Unauthorized` -- "User not found" |
| Password tidak memenuhi regex | Validasi Zod gagal dengan pesan `PasswordTooWeak` |
| Password kurang dari 8 karakter | Validasi Zod gagal dengan pesan `PasswordTooShort(8)` |
| `confirmPassword` tidak cocok | Validasi Zod gagal dengan pesan `PasswordNotMatch` pada path `confirmPassword` |
| Reset token payload | JWT berisi `id`, `fullname`, `email` (IJwtPayload) |
| Email dikirim via queue | Email dikirim menggunakan queue (`QueueName.Mail`, job `SendMail`), template `ForgotPassword`, dengan context `name` dan `resetLink` |
| Token dihapus setelah reset | Token dihapus secara hard delete setelah password berhasil direset |
| `redirectUrl` opsional | Jika tidak diberikan, link reset menjadi `undefined?token=...` -- frontend sebaiknya selalu mengirim field ini |
