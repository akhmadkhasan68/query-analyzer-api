# AC: User Import & Export

## Context

Import and export functionality for user data in Excel (XLSX/XLS), CSV, and PDF formats. Import supports single-sheet and multi-sheet Excel as well as CSV. Export supports Excel, multi-sheet Excel, CSV, and PDF. All endpoints require JWT authentication and `RESOURCE.USER` + `OPERATION.EXPORT` permission.

## Acceptance Criteria

### Download Excel Import Template (`GET /v1/users/import/excel-template`)

#### Happy Path

- [ ] Given an authenticated user with export permission, when calling `GET /v1/users/import/excel-template`, then the API returns a file download with filename `UserImportTemplate.xlsx`, content type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, and `Content-Disposition: attachment; filename=UserImportTemplate.xlsx`.
- [ ] Given the template download, when the file is received, then it originates from `src/modules/user/templates/excel/User.xlsx`.

#### Authorization Failures

- [ ] Given a user without `RESOURCE.USER` + `OPERATION.EXPORT` permission, when calling `GET /v1/users/import/excel-template`, then the API returns `403 Forbidden`.

---

### Download CSV Import Template (`GET /v1/users/import/csv-template`)

#### Happy Path

- [ ] Given an authenticated user with export permission, when calling `GET /v1/users/import/csv-template`, then the API returns a file download with filename `UserImportTemplate.csv`, content type `text/csv`, and `Content-Disposition: attachment; filename=UserImportTemplate.csv`.
- [ ] Given the template download, when the file is received, then it originates from `src/modules/user/templates/csv/User.csv`.

#### Authorization Failures

- [ ] Given a user without `RESOURCE.USER` + `OPERATION.EXPORT` permission, when calling `GET /v1/users/import/csv-template`, then the API returns `403 Forbidden`.

---

### Import Users from Excel (`POST /v1/users/import/excel`)

#### Happy Path

- [ ] Given a valid Excel file (XLSX or XLS) with correct headers and data, when calling `POST /v1/users/import/excel` as `multipart/form-data`, then the API returns `200 OK` with message "Import users from Excel success" and an array of created user objects.
- [ ] Given a valid Excel file with a `sheetName` parameter, when importing, then only the specified sheet is read.
- [ ] Given a valid Excel file without a `sheetName` parameter, when importing, then the default/first sheet is read.
- [ ] Given an Excel file with role names in the `roles` column (comma-separated), when importing, then role names are matched against existing roles in the database and assigned to the created users.
- [ ] Given a valid import, when the operation runs, then all users are created within a single database transaction (all-or-nothing).

#### Validation Errors

- [ ] Given no file attached to the request, when calling `POST /v1/users/import/excel`, then the API returns `400 Bad Request` with message "No file uploaded. Please provide a file." or a `FileUpload` error.
- [ ] Given a file with an invalid MIME type (not `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` or `application/vnd.ms-excel`), when calling `POST /v1/users/import/excel`, then the API returns `400 Bad Request`.
- [ ] Given an Excel file with no data rows (empty), when importing, then the API returns `400 Bad Request` with message "The Excel file contains no data to import."
- [ ] Given an Excel file missing required columns (`fullname`, `email`, `phoneNumber`, `password`), when importing, then the API returns `400 Bad Request` with message "Missing required data for a user in Excel. Ensure 'fullname', 'email', 'phoneNumber', and 'password' columns are present and mapped."
- [ ] Given an Excel file with role names that do not exist in the database, when importing, then the API returns `400 Bad Request` with message "One or more roles not found: {roleNames}".
- [ ] Given an Excel file with email addresses that already exist in the database, when importing, then the API returns `400 Bad Request` with message "Duplicate emails: {emails}".
- [ ] Given an Excel file with phone numbers that already exist in the database, when importing, then the API returns `400 Bad Request` with message "Duplicate phone numbers: {phones}".

#### Edge Cases

- [ ] Given an Excel file with duplicate rows (same email or phone number within the file), when importing, then duplicate entries within the file are silently skipped.
- [ ] Given an unexpected error during import, when the transaction fails, then the entire operation is rolled back and the API returns `500 Internal Server Error` with message "Failed to import users from Excel: {error.message}".
- [ ] Given the import process, when reading headers, then column headers from the uploaded file are validated against the built-in template headers and mapped to camelCase field names.

---

### Import Users from Excel Multi-Sheet (`POST /v1/users/import/excel-multi-sheet`)

#### Happy Path

- [ ] Given a valid multi-sheet Excel file, when calling `POST /v1/users/import/excel-multi-sheet`, then the API reads all sheets and returns `200 OK` with message "Import users from Excel success" and an array of created users from all sheets.

#### Validation Errors

- [ ] Given no file attached, when calling `POST /v1/users/import/excel-multi-sheet`, then the API returns `400 Bad Request`.
- [ ] Given a file with an invalid MIME type, when calling `POST /v1/users/import/excel-multi-sheet`, then the API returns `400 Bad Request`.

---

### Import Users from CSV (`POST /v1/users/import/csv`)

#### Happy Path

- [ ] Given a valid CSV file with correct headers and data, when calling `POST /v1/users/import/csv` as `multipart/form-data`, then the API returns `200 OK` with message "Import users from Csv success" and an array of created user objects.
- [ ] Given a custom `delimiter` parameter (e.g., `,`), when importing CSV, then the file is parsed using the specified delimiter.
- [ ] Given no `delimiter` parameter, when importing CSV, then the default delimiter `;` is used.

#### Validation Errors

- [ ] Given no file attached, when calling `POST /v1/users/import/csv`, then the API returns `400 Bad Request`.
- [ ] Given a file with an invalid MIME type (not `text/csv` or `application/vnd.ms-excel`), when calling `POST /v1/users/import/csv`, then the API returns `400 Bad Request`.
- [ ] Given an empty CSV file (no data rows), when importing, then the API returns `400 Bad Request` with a `CsvImportError` message.
- [ ] Given a `delimiter` that is not exactly 1 character, when calling `POST /v1/users/import/csv`, then the API returns a Zod validation error.

---

### Export Users to Excel (`GET /v1/users/export/excel`)

#### Happy Path

- [ ] Given an authenticated user with export permission, when calling `GET /v1/users/export/excel`, then the API returns a file download with filename `users_export.xlsx`, content type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.
- [ ] Given pagination query parameters, when exporting, then the exported data reflects the filtered/paginated result set.
- [ ] Given the export file, when opened, then it contains columns: ID, Username, Email, Full Name, Roles, Permissions.

#### Authorization Failures

- [ ] Given a user without export permission, when calling `GET /v1/users/export/excel`, then the API returns `403 Forbidden`.

---

### Export Users to Excel Multi-Sheet (`GET /v1/users/export/excel-multi-sheet`)

#### Happy Path

- [ ] Given an authenticated user with export permission, when calling `GET /v1/users/export/excel-multi-sheet`, then the API returns a file download with filename `users_export_multi.xlsx`.
- [ ] Given the exported file, when opened, then it contains two sheets named "Users Data 1" and "Users Data 2", both containing the same data.

---

### Export Users to CSV (`GET /v1/users/export/csv`)

#### Happy Path

- [ ] Given an authenticated user with export permission, when calling `GET /v1/users/export/csv`, then the API returns a file download with filename `users_export.csv` and content type `text/csv`.
- [ ] Given a custom `delimiter` query parameter, when exporting CSV, then the file uses the specified delimiter.
- [ ] Given no `delimiter` parameter, when exporting CSV, then the default delimiter `;` is used.
- [ ] Given the exported file, when opened, then it contains columns: ID, Full Name, Email, Roles, Permissions.

---

### Export Users to PDF (`GET /v1/users/export/pdf`)

#### Happy Path

- [ ] Given an authenticated user with export permission, when calling `GET /v1/users/export/pdf`, then the API returns a file download with filename `users_export.pdf` and content type `application/pdf`.
- [ ] Given the exported PDF, when opened, then it contains a table format, A4 portrait orientation, with 10mm margins.

#### Edge Cases

- [ ] Given export endpoints with pagination parameters, when exporting, then the amount of exported data is limited by the `perPage` parameter (export uses the same pagination as listing).
