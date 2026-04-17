# FSD: Project Slack Channel

**Path:** `GET /v1/projects/:projectId/slack-channels`, `POST /v1/projects/:projectId/slack-channels`, `DELETE /v1/projects/:projectId/slack-channels`

---

## Deskripsi

Endpoint untuk mengelola asosiasi Slack channel dengan project. Slack channel yang terdaftar digunakan untuk mengirim notifikasi terkait query analysis event pada project tersebut.

---

## Konten

### Request

#### GET /v1/projects/:projectId/slack-channels (Paginate)

**Path Parameters:**

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| projectId | string | Ya | ID project (UUID) |

**Query Parameters:**

| Parameter | Tipe | Wajib | Default | Validasi | Keterangan |
|-----------|------|-------|---------|----------|------------|
| sort | string | Tidak | `updated_at` | - | Kolom untuk sorting |
| order | string | Tidak | `DESC` | `ASC` \| `DESC` | Arah sorting |
| perPage | number | Tidak | `10` | min: 1 | Jumlah item per halaman |
| page | number | Tidak | `1` | min: 1 | Nomor halaman |
| search | string | Tidak | - | - | Kata kunci pencarian |

#### POST /v1/projects/:projectId/slack-channels (Create)

**Path Parameters:**

| Parameter | Tipe | Wajib | Validasi | Keterangan |
|-----------|------|-------|----------|------------|
| projectId | string (UUID) | Ya | ParseUUIDPipe | ID project, harus format UUID valid |

**Request Body:**

| Field | Tipe | Wajib | Validasi | Keterangan |
|-------|------|-------|----------|------------|
| slackChannelId | string | Ya | min: 2, max: 100 | ID Slack channel yang akan diasosiasikan |

```json
{
  "slackChannelId": "C01ABCDEF23"
}
```

#### DELETE /v1/projects/:projectId/slack-channels (Bulk Delete)

**Path Parameters:**

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| projectId | string | Ya | ID project |

**Request Body:**

| Field | Tipe | Wajib | Validasi | Keterangan |
|-------|------|-------|----------|------------|
| ids | string[] | Ya | Array of UUID strings | Daftar ID project slack channel yang akan dihapus |

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
      "total": 5,
      "totalPage": 1
    },
    "items": [
      {
        "id": "uuid",
        "project": {
          "id": "uuid",
          "name": "string",
          "..."
        },
        "slackChannelId": "string"
      }
    ]
  },
  "message": "Project slack channel pagination retrieved successfully"
}
```

#### Create Response

```json
{
  "data": {
    "id": "uuid",
    "project": {
      "id": "uuid",
      "name": "string",
      "..."
    },
    "slackChannelId": "C01ABCDEF23"
  },
  "message": "Project slack channel created successfully"
}
```

#### Delete Response

```json
{
  "message": "Project key deleted successfully"
}
```

---

## Aksi

| Aksi | Behavior |
|------|----------|
| **GET /v1/projects/:projectId/slack-channels** | Mengambil daftar Slack channel yang terdaftar pada project tertentu dengan paginasi. Memerlukan permission `PROJECT_SLACK_CHANNEL.VIEW`. |
| **POST /v1/projects/:projectId/slack-channels** | Mendaftarkan Slack channel baru ke project. Validasi: projectId harus UUID valid, project harus ada, slackChannelId harus unik dalam project. Memerlukan permission `PROJECT_SLACK_CHANNEL.CREATE`. |
| **DELETE /v1/projects/:projectId/slack-channels** | Menghapus satu atau lebih asosiasi Slack channel dari project (soft delete). Semua ID harus ada di database. Memerlukan permission `PROJECT_SLACK_CHANNEL.DELETE`. |

---

## Navigasi

| Dari | Ke |
|------|-----|
| Project detail | GET /v1/projects/:projectId/slack-channels |
| Slack channel list | POST /v1/projects/:projectId/slack-channels (tambah channel) |
| Slack channel list | DELETE /v1/projects/:projectId/slack-channels (hapus channel) |

---

## Special Cases

| Skenario | Penanganan |
|----------|------------|
| Project ID tidak ditemukan (pada create) | `findOneByIdOrFail` throw 404 Not Found |
| `projectId` bukan UUID valid (pada create) | `ParseUUIDPipe` throw 400 Bad Request |
| `slackChannelId` sudah terdaftar pada project yang sama | Throw 422 Unprocessable Entity: "Slack Channel ID already exists" (via `FieldDuplicate`) |
| `slackChannelId` kurang dari 2 karakter | Validasi Zod gagal |
| `slackChannelId` lebih dari 100 karakter | Validasi Zod gagal |
| Salah satu ID pada delete tidak ditemukan | Throw 404 Not Found jika jumlah data ditemukan tidak sesuai jumlah ID yang diminta |
| `ids` berisi string non-UUID | Validasi Zod gagal: array harus berisi UUID string |
| Operasi delete bersifat soft delete | Data tidak dihapus permanen, menggunakan `softDelete` |
