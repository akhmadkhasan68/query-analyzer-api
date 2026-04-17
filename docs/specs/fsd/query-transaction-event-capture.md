# FSD: Query Transaction Event Capture

**Path:** `POST /v1/query-transaction-events/capture`

---

## Deskripsi

Endpoint utama untuk menangkap (capture) event query dari SDK/agent yang terpasang di aplikasi client. Endpoint ini menerima data query yang lambat, memvalidasi API key project, menentukan severity, membuat/memperbarui query transaction, menyimpan event, dan mengirim notifikasi Slack.

---

## Konten

### Autentikasi

Menggunakan `ProjectApiKeyGuard` (menggantikan global JWT guard via `@ExcludeGlobalGuard()`).

| Header | Tipe | Wajib | Keterangan |
|--------|------|-------|------------|
| `x-project-id` | `string` | Ya | UUID project yang terdaftar. Alternatif: `X-PROJECT-ID` |
| `x-api-key` | `string` | Ya | Plain API key project. Alternatif: `X-API-KEY` atau `Authorization: Bearer <key>` |

**Urutan pengecekan API key:**
1. Header `x-api-key` / `X-API-KEY` dicek terlebih dahulu
2. Jika tidak ada, header `Authorization` dengan prefix `Bearer ` dicek
3. Jika keduanya tidak ada, guard mengembalikan `false` (HTTP 403)

Guard memvalidasi key dengan memanggil `ProjectKeyV1Service.validateKeyPlain(apiKey, projectId)` yang mencocokkan plain key dan projectId di database. Jika valid, objek `projectKey` di-attach ke request.

### Request Body

| Field | Tipe | Wajib | Validasi | Keterangan |
|-------|------|-------|----------|------------|
| `queryId` | `string` | Ya | UUID format | Identifier unik untuk query event dari client |
| `rawQuery` | `string` | Ya | Non-empty string | SQL/ORM query mentah yang dieksekusi |
| `parameters` | `Record<string, any>` | Tidak | Object/map | Parameter binding dari query |
| `executionTimeMs` | `number` | Ya | Number | Waktu eksekusi query dalam milidetik |
| `stackTrace` | `string[]` | Tidak | Array of strings | Stack trace dari lokasi query dipanggil |
| `timestamp` | `string` | Ya | ISO date string, di-transform ke `Date` | Waktu query dieksekusi di client |
| `contextType` | `string` | Ya | Non-empty string | Tipe konteks query (e.g., "SELECT", "INSERT") |
| `environment` | `string` | Ya | Non-empty string | Environment aplikasi (e.g., "production", "staging") |
| `applicationName` | `string` | Tidak | String | Nama aplikasi pengirim |
| `version` | `string` | Tidak | String | Versi aplikasi pengirim |
| `executionPlan` | `object \| null` | Tidak | Nullable object | Data execution plan dari database |

**Execution Plan Schema (jika disertakan):**

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `executionPlan.databaseProvider` | `string` | Ya | Provider database (e.g., "postgresql", "mysql") |
| `executionPlan.planFormat` | `object` | Tidak | Format plan |
| `executionPlan.planFormat.contentType` | `string` | Ya | MIME type konten plan |
| `executionPlan.planFormat.fileExtension` | `string` | Ya | Ekstensi file plan |
| `executionPlan.planFormat.description` | `string` | Ya | Deskripsi format plan |
| `executionPlan.content` | `string` | Tidak | Isi execution plan dalam format text |

**Contoh Request Body:**
```json
{
  "queryId": "550e8400-e29b-41d4-a716-446655440000",
  "rawQuery": "SELECT * FROM users WHERE email = $1",
  "parameters": { "$1": "user@example.com" },
  "executionTimeMs": 1500,
  "stackTrace": [
    "at UserRepository.findByEmail (user.repository.ts:42)",
    "at UserService.getUser (user.service.ts:18)"
  ],
  "timestamp": "2026-04-17T10:30:00.000Z",
  "contextType": "SELECT",
  "environment": "production",
  "applicationName": "my-api",
  "version": "1.2.3",
  "executionPlan": {
    "databaseProvider": "postgresql",
    "planFormat": {
      "contentType": "application/json",
      "fileExtension": "json",
      "description": "PostgreSQL EXPLAIN ANALYZE JSON output"
    },
    "content": "{\"Plan\": {\"Node Type\": \"Seq Scan\"}}"
  }
}
```

### Response

**HTTP 201 - Created**
```json
{
  "message": "Event captured successfully",
  "data": null
}
```

**HTTP 403 - Forbidden** (API key tidak valid / header tidak ada)

**HTTP 422 - Unprocessable Entity** (Project tidak ditemukan untuk project key)
```json
{
  "message": "Project not found for the provided project key."
}
```

---

## Aksi

| Aksi | Behavior |
|------|----------|
| **POST /v1/query-transaction-events/capture** | Menangkap event query dan memproses secara asynchronous melalui queue |

### Alur Proses Lengkap (Capture Flow)

#### Fase 1: Validasi & Queue (Synchronous - di Controller)
1. **Validasi API Key** - `ProjectApiKeyGuard` memvalidasi `x-project-id` + `x-api-key` header
2. **Ambil Detail Project** - Load project dengan relasi `platform`, `projectGitlab`, `projectSlackChannels`
3. **Ambil Detail Project Key** - Load project key berdasarkan ID
4. **Kirim ke Queue** - Data dikirim ke queue `QueryTransactionEvent` dengan job `SendQueryTransactionEvent`
5. **Return Response** - Mengembalikan response `201` segera (non-blocking)

#### Fase 2: Proses Queue (Asynchronous - di `queueProcessCaptureEvent`)
1. **Determine Severity** - Menentukan level severity berdasarkan `executionTimeMs` dan project settings
2. **Buat Event Data** - Menyusun objek `IQueryTransactionEvent` dengan semua field termasuk `receivedAt: new Date()`
3. **Set Execution Plan** - Jika `executionPlan` disertakan, map ke format internal
4. **Generate Signature** - Buat signature unik SHA-256 dari: `projectId | projectKeyId | environment | rawQuery [| stackTrace]`
5. **Cek Existing Transaction** - Cari `QueryTransaction` berdasarkan signature
6. **Upsert Query Transaction:**
   - **Baru**: Buat `QueryTransaction` dengan `occurrenceCount: 1`, semua execution time fields diisi dari request
   - **Existing**: Update `occurrenceCount += 1`, akumulasi `totalExecutionTime`, hitung ulang `averageExecutionTime`, update `maxExecutionTime` (Math.max), update `minExecutionTime` (Math.min)
7. **Link Event ke Transaction** - Set `eventData.transaction = queryTransaction`
8. **Simpan Event** - Persist ke MongoDB
9. **Kirim Notifikasi Slack** - Jika project memiliki `projectSlackChannels`, kirim alert ke semua channel (fire-and-forget, error di-log tapi tidak fail proses utama)

### Signature Generation

Signature di-generate menggunakan SHA-256 hash dari komponen berikut yang di-join dengan `|`:
- `project.id`
- `projectKey.id`
- `environment`
- `rawQuery`
- Stack trace (opsional): semua item di-trim dan di-join dengan `-`

```
SHA256("projectId|projectKeyId|environment|rawQuery|trace1-trace2")
```

Query dengan signature yang sama akan di-aggregate ke `QueryTransaction` yang sama.

### Severity Determination

Severity ditentukan berdasarkan `executionTimeMs` dengan threshold yang bisa dikustomisasi per project.

**Default Thresholds:**

| Severity | Threshold (ms) |
|----------|---------------|
| `critical` | >= 2000 |
| `high` | >= 1000 |
| `medium` | >= 500 |
| `low` | >= 0 (default) |

**Custom Thresholds:** Jika project memiliki setting dengan key `severity` (dari tabel `project_settings`), threshold default di-override dengan nilai dari setting tersebut. Format values:
```json
[
  { "level": "critical", "threshold": 5000 },
  { "level": "high", "threshold": 2000 },
  { "level": "medium", "threshold": 1000 },
  { "level": "low", "threshold": 0 }
]
```

Pengecekan dilakukan dari severity tertinggi ke terendah (critical -> high -> medium -> low).

---

## Navigasi

| Dari | Ke |
|------|-----|
| SDK/Agent capture | `POST /v1/query-transaction-events/capture` |
| Lihat daftar events | `GET /v1/query-transaction-events` |
| Trigger notifikasi manual | `POST /v1/query-transaction-events/notify` |
| Manage project keys | `GET/POST/DELETE /v1/projects/:projectId/keys` |
| Konfigurasi severity | `POST /v1/projects/:projectId/settings` |

---

## Special Cases

| Skenario | Penanganan |
|----------|------------|
| Header `x-project-id` atau `x-api-key` tidak ada | Guard mengembalikan `false`, HTTP 403 Forbidden |
| API key tidak cocok dengan project | Guard mengembalikan `false`, HTTP 403 Forbidden |
| `projectKey.projectId` null/undefined | Throw `UnprocessableEntityException` dengan pesan "Project not found for the provided project key." |
| Project tidak ditemukan di database | Throw `NotFoundException` (dari repository `findOneOrFailByIdWithRelations`) |
| `parameters` tidak disertakan | Default ke `{}` (empty object) |
| `stackTrace` tidak disertakan | Default ke `[]` (empty array) |
| `executionPlan` null atau tidak disertakan | Field `executionPlan` tidak di-set pada event data |
| Query dengan signature yang sama sudah ada | Update existing `QueryTransaction`: increment `occurrenceCount`, akumulasi total, recalculate average, update max/min |
| Query dengan signature baru | Buat `QueryTransaction` baru dengan `status: OPEN`, `occurrenceCount: 1` |
| Project tidak punya Slack channels | Notifikasi Slack di-skip (tidak error) |
| Slack notification gagal | Error di-log via logger, proses utama tetap lanjut (fire-and-forget) |
| Error saat queue processing | Error di-log dan di-throw ulang (queue handler yang menangani retry) |
| Project setting severity tidak ada | Gunakan default thresholds (critical: 2000, high: 1000, medium: 500, low: 0) |
| Project setting severity ada tapi kosong | Gunakan default thresholds (pengecekan `projectSettingSeverities.length > 0`) |
