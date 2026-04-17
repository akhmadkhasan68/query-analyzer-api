# FSD: N8N Integration

**Path:** `POST /v1/n8n/callback/ai-analyze-query-transaction-event`

---

## Deskripsi

Endpoint webhook callback untuk menerima hasil analisis AI dari N8N workflow. Setelah N8N menyelesaikan analisis query transaction event, hasil dikirim kembali ke endpoint ini untuk disimpan dan diteruskan sebagai notifikasi Slack ke user yang meminta analisis.

---

## Konten

### Request

#### POST /v1/n8n/callback/ai-analyze-query-transaction-event

**Headers:** Tidak memerlukan Authorization (menggunakan `@ExcludeGlobalGuard()`).

**Request Body:**

| Field | Tipe | Wajib | Validasi | Keterangan |
|-------|------|-------|----------|------------|
| id | string | Ya | - | ID query transaction event yang dianalisis |
| fileStorageId | string | Ya | min: 1, "File storage ID is required" | ID file storage yang berisi laporan hasil analisis AI |
| slackUserId | string | Ya | min: 1, "Slack User ID is required" | ID user Slack yang meminta analisis (untuk pushback notification) |
| slackChannelId | string | Ya | min: 1, "Slack Channel ID is required" | ID Slack channel untuk mengirim notifikasi hasil |
| slackMessageTs | string | Tidak | - | Timestamp message Slack original (untuk reply dalam thread) |

```json
{
  "id": "event-uuid",
  "fileStorageId": "file-storage-uuid",
  "slackUserId": "U01ABCDEF",
  "slackChannelId": "C01ABCDEF23",
  "slackMessageTs": "1234567890.123456"
}
```

### Response

```json
{
  "message": "Callback received",
  "data": null
}
```

---

## Aksi

| Aksi | Behavior |
|------|----------|
| **POST /v1/n8n/callback/ai-analyze-query-transaction-event** | Menerima callback dari N8N workflow. Proses dilakukan secara fire-and-forget (controller tidak `await` service). Service menyimpan laporan AI analysis via `saveAIAnalyzeReport(id, fileStorageId)`, lalu mengirim notifikasi hasil ke Slack user yang meminta via `sendAIAnalyzeReportToRequester()`. |

---

## Navigasi

| Dari | Ke |
|------|-----|
| Slack interactive (AI Analyze button) | Trigger N8N webhook |
| N8N workflow selesai | POST /v1/n8n/callback/ai-analyze-query-transaction-event |
| Callback diterima | Internal: saveAIAnalyzeReport() + sendAIAnalyzeReportToRequester() |
| File hasil analisis | GET /v1/storage-file/:id |

---

## Special Cases

| Skenario | Penanganan |
|----------|------------|
| Proses callback bersifat fire-and-forget | Controller langsung mengembalikan response "Callback received" tanpa menunggu service selesai memproses (tidak ada `await` pada service call) |
| `fileStorageId` kosong | Validasi Zod gagal: "File storage ID is required" |
| `slackUserId` kosong | Validasi Zod gagal: "Slack User ID is required" |
| `slackChannelId` kosong | Validasi Zod gagal: "Slack Channel ID is required" |
| `slackMessageTs` tidak diberikan | Opsional - notifikasi mungkin tidak dikirim sebagai thread reply |
| Endpoint tidak memerlukan autentikasi | Menggunakan `@ExcludeGlobalGuard()` - diakses oleh N8N workflow |
| N8N webhook ID untuk trigger | UUID: `ac954675-1d6c-40a6-9582-85bdf6e9d75b` (digunakan saat mentrigger N8N, bukan pada callback) |
| Error saat memproses callback | Error terjadi di background karena fire-and-forget; response tetap 200 |
