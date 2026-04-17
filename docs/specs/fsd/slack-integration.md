# FSD: Slack Integration

**Path:** `POST /v1/slack/command/:slashCommand`, `POST /v1/slack/interaction`

---

## Deskripsi

Endpoint untuk menerima dan memproses Slack slash command serta interactive payload (tombol, menu, dsb). Endpoint ini diakses langsung oleh Slack (bukan oleh user), sehingga tidak memerlukan autentikasi JWT (ExcludeGlobalGuard).

---

## Konten

### Request

#### POST /v1/slack/command/:slashCommand (Slash Command)

**Path Parameters:**

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| slashCommand | string | Ya | Nama slash command yang dipanggil (contoh: `test`) |

**Request Body (form-urlencoded dari Slack):**

| Field | Tipe | Wajib | Validasi | Keterangan |
|-------|------|-------|----------|------------|
| token | string | Ya | - | Verification token dari Slack |
| teamId | string | Ya | - | ID Slack workspace/team |
| teamDomain | string | Ya | - | Domain workspace Slack |
| channelId | string | Ya | - | ID channel tempat command dijalankan |
| channelName | string | Ya | - | Nama channel |
| userId | string | Ya | - | ID user Slack yang menjalankan command |
| userName | string | Ya | - | Username Slack |
| command | string | Ya | - | Command yang dijalankan (contoh: `/analyze`) |
| text | string | Tidak | - | Teks tambahan setelah command |
| apiAppId | string | Ya | - | ID Slack App |
| isEnterpriseInstall | string | Tidak | - | Apakah instalasi enterprise |
| responseUrl | string | Ya | URL valid | URL untuk mengirim response delayed |
| triggerId | string | Ya | - | Trigger ID untuk modal/dialog |

#### POST /v1/slack/interaction (Interactive Payload)

**Request Body (form-urlencoded dari Slack):**

| Field | Tipe | Wajib | Validasi | Keterangan |
|-------|------|-------|----------|------------|
| payload | string | Ya | - | JSON string berisi interactive payload dari Slack |

**Struktur Payload (setelah di-parse dari JSON string):**

| Field | Tipe | Keterangan |
|-------|------|------------|
| type | string | Tipe interaksi |
| team | object | `{ id: string, domain: string }` |
| user | object | `{ id: string, username: string, teamId: string }` |
| apiAppId | string | ID Slack App |
| token | string | Verification token |
| container | object | Info container message (lihat detail di bawah) |
| triggerID | string | Trigger ID |
| channel | object | `{ id: string, name: string }` |
| message | object | `{ botId: string, type: string, text: string, user: string, ts: string }` |
| responseURL | string | URL untuk delayed response |
| actions | array | Array of action objects |

**Struktur Container:**

| Field | Tipe | Keterangan |
|-------|------|------------|
| type | string | Tipe container |
| messageTs | string | Timestamp message |
| attachmentId | number | ID attachment |
| channelId | string | ID channel |
| isEphemeral | boolean | Apakah message ephemeral |
| threadTs | string (optional) | Timestamp thread (jika dalam thread) |
| isAppUnfurl | boolean | Apakah app unfurl |

**Struktur Action:**

| Field | Tipe | Keterangan |
|-------|------|------------|
| actionId | string | ID aksi (contoh: `btn-ai-analyze-query-event`) |
| blockId | string | ID block Slack |
| text | object | `{ type: string, text: string, emoji: boolean }` |
| value | string | Nilai yang dikirim bersama aksi |
| type | string | Tipe komponen (contoh: `button`) |
| actionTs | string | Timestamp aksi |

### Response

#### Slash Command Response

```
"You invoked the /test command with text: {text}"
```

Response berupa plain text string, bukan JSON.

#### Interactive Response

```
"OK"
```

Response berupa plain text string "OK" jika berhasil, atau "Invalid payload" jika JSON parsing gagal.

---

## Aksi

| Aksi | Behavior |
|------|----------|
| **POST /v1/slack/command/:slashCommand** | Menerima slash command dari Slack. Validasi apakah command terdaftar dalam `SlackCommandEnum`. Saat ini hanya command `test` yang didukung. Mengembalikan plain text. |
| **POST /v1/slack/interaction** | Menerima interactive payload dari Slack (tombol, menu, dsb). Payload di-parse dari JSON string. Memproses setiap action berdasarkan `actionId`. |

### Supported Slash Commands

| Command | Enum Value | Behavior |
|---------|------------|----------|
| `test` | `SlackCommandEnum.Test` | Mengembalikan echo text: "You invoked the /test command with text: {text}" |

### Supported Interactive Actions

| Action ID | Enum Value | Behavior |
|-----------|------------|----------|
| `btn-ai-analyze-query-event` | `SlackInteractiveActionIdEnum.BtnAiAnalyzeQueryEvent` | Mencari query transaction event berdasarkan `action.value` (query ID), memverifikasi project memiliki Slack channel terkonfigurasi, lalu memicu AI analysis via `queryTransactionEventService.AIAnalyze()`. Mengirim parameter `slackUserId`, `slackChannelId`, `slackMessageTs` untuk pushback notification. |

---

## Navigasi

| Dari | Ke |
|------|-----|
| Slack workspace (slash command) | POST /v1/slack/command/:slashCommand |
| Slack message button | POST /v1/slack/interaction |
| AI Analyze action | Internal: QueryTransactionEventV1Service.AIAnalyze() |
| AI Analyze callback | POST /v1/n8n/callback/ai-analyze-query-transaction-event |

---

## Special Cases

| Skenario | Penanganan |
|----------|------------|
| Slash command tidak terdaftar di `SlackCommandEnum` | Mengembalikan: "Invalid command: {slashCommand}" |
| Slash command terdaftar tapi tidak ada handler | Mengembalikan: "Unknown command: {slashCommand}" |
| Payload interaction tidak bisa di-parse sebagai JSON | Mengembalikan: "Invalid payload" |
| Payload interaction tidak memiliki actions atau actions kosong | Throw Error: "No actions found in the payload" |
| `actionId` tidak dikenal | Log warning: "Unhandled action ID: {actionId}" dan dilewati |
| Query transaction event tidak ditemukan (pada AI analyze) | Error dari `findOneByQueryId` |
| Project tidak memiliki Slack channel terkonfigurasi | Log warning dan return tanpa melakukan apa-apa |
| Endpoint tidak memerlukan autentikasi | Menggunakan `@ExcludeGlobalGuard()` - diakses langsung oleh Slack |
| `responseUrl` harus URL valid | Validasi Zod: `.url()` |
| Slack message service menggunakan queue | Pengiriman pesan ke Slack channel dilakukan melalui queue (`QueueName.Slack`) untuk menghindari rate limiting |
