# FSD: Health Check

**Path:** `GET /v1/health`

---

## Deskripsi

Endpoint untuk memeriksa status kesehatan (liveness) aplikasi. Melakukan ping check ke NestJS docs dan database connection check via TypeORM. Endpoint ini bersifat public (tidak memerlukan autentikasi).

---

## Konten

### Request

#### GET /v1/health

**Headers:** Tidak memerlukan Authorization (menggunakan `@Public()` decorator).

**Parameters:** Tidak ada.

### Response

#### Health Check Passed

```json
{
  "message": "Health check passed",
  "data": {
    "nest-js": {
      "status": "up"
    },
    "database": {
      "status": "up"
    }
  }
}
```

#### Health Check Failed

```json
{
  "message": "Health check failed",
  "errors": {
    "nest-js": {
      "status": "down"
    },
    "database": {
      "status": "down"
    }
  }
}
```

---

## Aksi

| Aksi | Behavior |
|------|----------|
| **GET /v1/health** | Menjalankan dua health check secara bersamaan: (1) HTTP ping check ke `https://docs.nestjs.com` dengan label `nest-js`, (2) TypeORM database ping check dengan label `database` menggunakan timeout dari `config.db.connectTimeoutMS`. Jika semua check berhasil, mengembalikan detail status. Jika ada yang gagal, mengembalikan error details. |

---

## Navigasi

| Dari | Ke |
|------|-----|
| Load balancer / monitoring | GET /v1/health |
| CI/CD pipeline | GET /v1/health |

---

## Special Cases

| Skenario | Penanganan |
|----------|------------|
| Semua check berhasil | Response 200 dengan `message: "Health check passed"` dan `data` berisi detail status tiap check |
| Salah satu atau semua check gagal | Response 200 (tidak throw error) dengan `message: "Health check failed"` dan `errors` berisi detail kegagalan dari `error.response.details` |
| Database tidak bisa dijangkau | Check `database` melaporkan `status: "down"` setelah timeout (`config.db.connectTimeoutMS`) |
| NestJS docs tidak bisa dijangkau | Check `nest-js` melaporkan `status: "down"` |
| Endpoint bersifat public | Menggunakan `@Public()` decorator - tidak memerlukan JWT token |
| Menggunakan `@HealthCheck()` decorator | Terintegrasi dengan NestJS Terminus module untuk standardisasi health check |
| Response selalu HTTP 200 | Error ditangkap dalam try-catch, sehingga response selalu 200 meskipun health check gagal |
