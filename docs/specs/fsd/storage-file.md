# FSD: Storage File

**Path:** `POST /v1/storage-file/upload`, `GET /v1/storage-file/:id`, `DELETE /v1/storage-file/:id`

---

## Deskripsi

Endpoint untuk mengelola file upload, retrieval, dan deletion. Mendukung multiple storage driver (Local, MinIO, Google Cloud Storage) melalui factory pattern. Metadata file disimpan di database pada tabel `storage_file`.

---

## Konten

### Request

#### POST /v1/storage-file/upload (Upload)

**Headers:** Tidak memerlukan Authorization (menggunakan `@ExcludeGlobalGuard()`).

**Request Body (multipart/form-data):**

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| file | File (binary) | Ya | File yang akan diupload |

#### GET /v1/storage-file/:id (Get File)

**Headers:** Tidak memerlukan Authorization (menggunakan `@ExcludeGlobalGuard()`).

**Path Parameters:**

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| id | string | Ya | ID storage file (UUID) |

#### DELETE /v1/storage-file/:id (Delete File)

**Headers:** Tidak memerlukan Authorization (menggunakan `@ExcludeGlobalGuard()`).

**Path Parameters:**

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| id | string | Ya | ID storage file (UUID) |

### Response

#### Upload Response

```json
{
  "message": "File uploaded successfully",
  "data": {
    "id": "uuid",
    "name": "filename.pdf",
    "path": "uploads/2024/01/filename.pdf",
    "size": "1.5 MB",
    "mimetype": "application/pdf",
    "fileUrl": "https://storage.example.com/uploads/filename.pdf",
    "driver": "minio"
  }
}
```

#### Get File Response

```json
{
  "message": "File retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "filename.pdf",
    "path": "uploads/2024/01/filename.pdf",
    "size": "1.5 MB",
    "mimetype": "application/pdf",
    "fileUrl": "https://storage.example.com/uploads/filename.pdf",
    "driver": "minio"
  }
}
```

#### Upload tanpa File Response

```json
{
  "message": "No file uploaded",
  "data": null
}
```

#### Delete Response

```json
{
  "message": "File deleted successfully",
  "data": null
}
```

---

## Aksi

| Aksi | Behavior |
|------|----------|
| **POST /v1/storage-file/upload** | Upload file via multipart/form-data (field name: `file`). Validasi tipe file (mimetype) dan ukuran file (max dari `config.storage.fileMaxSizeInBytes`). File diupload ke storage driver yang aktif, lalu metadata disimpan ke database. Response menyertakan URL file yang dihasilkan. |
| **GET /v1/storage-file/:id** | Mengambil metadata file berdasarkan ID. URL file digenerate ulang dari storage driver sesuai `driver` yang tercatat pada record. |
| **DELETE /v1/storage-file/:id** | Menghapus file dari storage driver dan (implisit) dari database. Validasi keberadaan file terlebih dahulu. |

---

## Navigasi

| Dari | Ke |
|------|-----|
| N8N callback (fileStorageId) | GET /v1/storage-file/:id |
| AI Analysis report | POST /v1/storage-file/upload |
| File management | DELETE /v1/storage-file/:id |

---

## Special Cases

| Skenario | Penanganan |
|----------|------------|
| Tidak ada file yang diupload | Response 200 dengan message "No file uploaded" dan `data: null` |
| Tipe file tidak valid (mimetype) | Throw Error: `InvalidFileMimeType` (validasi via `FileUtil.isValidFileType`) |
| Ukuran file melebihi batas | Throw Error: `FileTooLarge` (batas dari `config.storage.fileMaxSizeInBytes`) |
| Upload gagal ke storage | Throw Error: `FileUpload` - error di-log via logger |
| File ID tidak ditemukan (get/delete) | Throw error dari `findOneOrFail` (404 Not Found) |
| Delete gagal | Throw Error: `FileDelete` |
| Endpoint tidak memerlukan autentikasi | Semua endpoint menggunakan `@ExcludeGlobalGuard()` |
| Field `size` di response berupa string terformat | Menggunakan `FileUtil.formatFileSizeBytes()` (contoh: "1.5 MB") |
| Field `driver` di response berupa string | Nilai dari enum `StorageDriverEnum`: `local`, `minio`, `gcs` |
| Storage driver ditentukan oleh konfigurasi | Upload menggunakan driver default, get/delete menggunakan driver yang tercatat di record file |
| Database entity `storage_file` | Kolom: `name` (varchar 255), `path` (varchar 255), `size` (int, bytes), `mimetype` (varchar 50), `driver` (varchar 50) + kolom BaseEntity |

### Supported Storage Drivers

| Driver | Enum Value | Keterangan |
|--------|------------|------------|
| Local | `local` | Local file system storage |
| MinIO | `minio` | Open-source object storage (S3-compatible) |
| GCS | `gcs` | Google Cloud Storage |
