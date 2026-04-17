# FSD: User Import & Export

**Path:** `GET/POST /v1/users/import/*` | `GET /v1/users/export/*`

---

## Deskripsi

Fitur import dan export data user dalam format Excel (XLSX/XLS), CSV, dan PDF. Import mendukung single sheet dan multi-sheet Excel serta CSV. Export mendukung Excel, multi-sheet Excel, CSV, dan PDF. Semua endpoint memerlukan autentikasi JWT dan permission `EXPORT`.

---

## Konten

### Import Endpoints

#### 1. Download Excel Import Template

**`GET /v1/users/import/excel-template`**

**Permission:** `RESOURCE.USER` + `OPERATION.EXPORT`

**Response:** File download (`UserImportTemplate.xlsx`)

| Header Response | Nilai |
|-----------------|-------|
| `Content-Type` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| `Content-Disposition` | `attachment; filename=UserImportTemplate.xlsx` |

---

#### 2. Import Users from Excel

**`POST /v1/users/import/excel`**

**Permission:** `RESOURCE.USER` + `OPERATION.EXPORT`

**Content-Type:** `multipart/form-data`

| Field | Tipe | Validasi | Wajib |
|-------|------|----------|-------|
| `file` | `File` | MIME type harus `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` atau `application/vnd.ms-excel` | Ya |
| `sheetName` | `string` | Minimal 1 karakter jika diberikan | Tidak |

**Response (200 OK):**

```json
{
  "message": "Import users from Excel success",
  "data": [
    {
      "id": "uuid",
      "fullname": "string",
      "email": "string",
      "phoneNumber": "string",
      "roles": []
    }
  ]
}
```

---

#### 3. Import Users from Excel Multi-Sheet

**`POST /v1/users/import/excel-multi-sheet`**

**Permission:** `RESOURCE.USER` + `OPERATION.EXPORT`

**Content-Type:** `multipart/form-data`

| Field | Tipe | Validasi | Wajib |
|-------|------|----------|-------|
| `file` | `File` | MIME type harus XLSX atau XLS | Ya |

**Response (200 OK):**

```json
{
  "message": "Import users from Excel success",
  "data": [
    {
      "id": "uuid",
      "fullname": "string",
      "email": "string",
      "phoneNumber": "string",
      "roles": []
    }
  ]
}
```

---

#### 4. Download CSV Import Template

**`GET /v1/users/import/csv-template`**

**Permission:** `RESOURCE.USER` + `OPERATION.EXPORT`

**Response:** File download (`UserImportTemplate.csv`)

| Header Response | Nilai |
|-----------------|-------|
| `Content-Type` | `text/csv` |
| `Content-Disposition` | `attachment; filename=UserImportTemplate.csv` |

---

#### 5. Import Users from CSV

**`POST /v1/users/import/csv`**

**Permission:** `RESOURCE.USER` + `OPERATION.EXPORT`

**Content-Type:** `multipart/form-data`

| Field | Tipe | Validasi | Wajib |
|-------|------|----------|-------|
| `file` | `File` | MIME type harus `text/csv` atau `application/vnd.ms-excel` | Ya |
| `delimiter` | `string` | Harus tepat 1 karakter. Default: `;` | Tidak |

**Response (200 OK):**

```json
{
  "message": "Import users from Csv success",
  "data": [
    {
      "id": "uuid",
      "fullname": "string",
      "email": "string",
      "phoneNumber": "string",
      "roles": []
    }
  ]
}
```

---

### Export Endpoints

#### 6. Export Users to Excel

**`GET /v1/users/export/excel`**

**Permission:** `RESOURCE.USER` + `OPERATION.EXPORT`

**Query Parameters:** Sama dengan pagination user (`page`, `perPage`, `sort`, `order`, `search`, `emailVerfied`, `phoneNumberVerified`)

**Response:** File download (`users_export.xlsx`)

| Header Response | Nilai |
|-----------------|-------|
| `Content-Type` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| `Content-Disposition` | `attachment; filename=users_export.xlsx` |

**Kolom Excel:** ID, Username, Email, Full Name, Roles, Permissions

---

#### 7. Export Users to Excel Multi-Sheet

**`GET /v1/users/export/excel-multi-sheet`**

**Permission:** `RESOURCE.USER` + `OPERATION.EXPORT`

**Query Parameters:** Sama dengan pagination user.

**Response:** File download (`users_export_multi.xlsx`)

| Header Response | Nilai |
|-----------------|-------|
| `Content-Type` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| `Content-Disposition` | `attachment; filename=users_export_multi.xlsx` |

**Sheet:** "Users Data 1" dan "Users Data 2" (keduanya berisi data yang sama).

---

#### 8. Export Users to CSV

**`GET /v1/users/export/csv`**

**Permission:** `RESOURCE.USER` + `OPERATION.EXPORT`

**Query Parameters:** Sama dengan pagination user, plus:

| Parameter | Tipe | Default | Keterangan |
|-----------|------|---------|------------|
| `delimiter` | `string` | `;` | Karakter pemisah CSV |

**Response:** File download (`users_export.csv`)

| Header Response | Nilai |
|-----------------|-------|
| `Content-Type` | `text/csv` |
| `Content-Disposition` | `attachment; filename=users_export.csv` |

**Kolom CSV:** ID, Full Name, Email, Roles, Permissions

---

#### 9. Export Users to PDF

**`GET /v1/users/export/pdf`**

**Permission:** `RESOURCE.USER` + `OPERATION.EXPORT`

**Query Parameters:** Sama dengan pagination user.

**Response:** File download (`users_export.pdf`)

| Header Response | Nilai |
|-----------------|-------|
| `Content-Type` | `application/pdf` |
| `Content-Disposition` | `attachment; filename=users_export.pdf` |

**Format:** Tabel, A4 Portrait, margin 10mm.

---

## Aksi

| Aksi | Behavior |
|------|----------|
| **GET .../import/excel-template** | Mengirim file template Excel dari `src/modules/user/templates/excel/User.xlsx` |
| **POST .../import/excel** | Membaca header dari template, mapping kolom ke camelCase, parse file Excel, validasi duplikasi email/phone terhadap database, validasi role names, lalu bulk create user dalam transaction |
| **POST .../import/excel-multi-sheet** | Sama seperti import excel tapi membaca semua sheet dari file yang diupload |
| **GET .../import/csv-template** | Mengirim file template CSV dari `src/modules/user/templates/csv/User.csv` |
| **POST .../import/csv** | Membaca header dari template CSV, mapping kolom ke camelCase, parse file CSV, validasi dan bulk create user dalam transaction |
| **GET .../export/excel** | Melakukan paginasi user, format data (roles dan permissions di-join menjadi string), lalu generate file Excel |
| **GET .../export/excel-multi-sheet** | Sama seperti export excel tapi menghasilkan 2 sheet ("Users Data 1" dan "Users Data 2") |
| **GET .../export/csv** | Melakukan paginasi user, format data, lalu generate file CSV dengan delimiter yang bisa dikustomisasi |
| **GET .../export/pdf** | Melakukan paginasi user, format data, lalu generate file PDF dengan template tabel |

---

## Navigasi

| Dari | Ke |
|------|-----|
| Download template | `GET /v1/users/import/excel-template` atau `GET /v1/users/import/csv-template` |
| Upload file import | `POST /v1/users/import/excel` atau `POST /v1/users/import/csv` |
| Export data user | `GET /v1/users/export/excel`, `csv`, atau `pdf` |
| Daftar user | `GET /v1/users` |

---

## Special Cases

| Skenario | Penanganan |
|----------|------------|
| File tidak diupload | `400 BadRequest` -- "No file uploaded. Please provide a file." / `FileUpload` error |
| MIME type tidak valid (Excel import) | `400 BadRequest` -- hanya menerima `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` dan `application/vnd.ms-excel` |
| MIME type tidak valid (CSV import) | `400 BadRequest` -- hanya menerima `text/csv` dan `application/vnd.ms-excel` |
| File Excel kosong (tidak ada data) | `400 BadRequest` -- "The Excel file contains no data to import." |
| File CSV kosong (tidak ada data) | `400 BadRequest` -- error message dari `CsvImportError` constant |
| Field wajib missing di file import | `400 BadRequest` -- "Missing required data for a user in Excel. Ensure 'fullname', 'email', 'phoneNumber', and 'password' columns are present and mapped." |
| Role tidak ditemukan di database (import) | `400 BadRequest` -- "One or more roles not found: {roleNames}" |
| Duplikat email dalam database (import) | `400 BadRequest` -- "Duplicate emails: {emails}" |
| Duplikat phone number dalam database (import) | `400 BadRequest` -- "Duplicate phone numbers: {phones}" |
| Duplikat data dalam file (import) | Data duplikat di-skip secara silent (berdasarkan email atau phoneNumber) |
| Import menggunakan transaction | Semua user dibuat dalam satu transaction. Jika ada error, seluruh operasi di-rollback |
| Error tak terduga saat import | `500 InternalServerError` -- "Failed to import users from Excel: {error.message}" |
| Role mapping di file import | Kolom `roles` di file berisi nama role dipisah koma. Nama role dicocokkan ke database. |
| Template validation | Header file yang diupload divalidasi terhadap template bawaan |
| CSV delimiter default | Default delimiter adalah `;` (bukan `,`) |
| Export menggunakan pagination | Data export diambil berdasarkan query parameter pagination, sehingga jumlah data terbatas sesuai `perPage` |
