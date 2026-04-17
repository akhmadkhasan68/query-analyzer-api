# Test Scenarios: User Import & Export

## Preconditions

- An authenticated user exists with `RESOURCE.USER` + `OPERATION.EXPORT` permission
- Roles exist in the database with known names for import role matching
- Import template files exist at `src/modules/user/templates/excel/User.xlsx` and `src/modules/user/templates/csv/User.csv`
- Test user data is seeded in the database for export scenarios
- Valid Excel and CSV test files are prepared with correct headers and data

## Scenarios

### Scenario 1: Download Excel Import Template

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/users/import/excel-template` with a valid access token | API returns a file download |
| 2 | Verify response headers | `Content-Disposition: attachment; filename=UserImportTemplate.xlsx` and content type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| 3 | Verify file origin | File originates from `src/modules/user/templates/excel/User.xlsx` |

### Scenario 2: Download Excel Template Without Permission

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Authenticate as a user without `RESOURCE.USER` + `OPERATION.EXPORT` permission | Access token obtained |
| 2 | Send `GET /v1/users/import/excel-template` | API returns `403 Forbidden` |

### Scenario 3: Download CSV Import Template

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/users/import/csv-template` with a valid access token | API returns a file download |
| 2 | Verify response headers | `Content-Disposition: attachment; filename=UserImportTemplate.csv` and content type `text/csv` |
| 3 | Verify file origin | File originates from `src/modules/user/templates/csv/User.csv` |

### Scenario 4: Download CSV Template Without Permission

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Authenticate as a user without `RESOURCE.USER` + `OPERATION.EXPORT` permission | Access token obtained |
| 2 | Send `GET /v1/users/import/csv-template` | API returns `403 Forbidden` |

### Scenario 5: Import Users from Excel Successfully

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Prepare a valid Excel file (XLSX) with columns `fullname`, `email`, `phoneNumber`, `password`, and `roles` (comma-separated role names) | File is ready |
| 2 | Send `POST /v1/users/import/excel` as `multipart/form-data` with the file attached | API returns `200 OK` with message "Import users from Excel success" and an array of created user objects |
| 3 | Verify roles are matched against existing roles in the database | Users are assigned the correct roles |
| 4 | Verify all users are created within a single database transaction | Transaction is committed (all-or-nothing) |

### Scenario 6: Import Excel with Specific Sheet Name

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Prepare a multi-sheet Excel file | File has multiple sheets |
| 2 | Send `POST /v1/users/import/excel` with `sheetName` parameter specifying a sheet | API reads only the specified sheet and returns imported users |

### Scenario 7: Import Excel Without Sheet Name

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/users/import/excel` without a `sheetName` parameter | API reads the default/first sheet |

### Scenario 8: Import Excel Without File

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/users/import/excel` without attaching a file | API returns `400 Bad Request` with message "No file uploaded. Please provide a file." |

### Scenario 9: Import Excel with Invalid MIME Type

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/users/import/excel` with a non-Excel file (e.g., a `.txt` file) | API returns `400 Bad Request` |

### Scenario 10: Import Excel with Empty Data

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Prepare an Excel file with headers only and no data rows | File has no data |
| 2 | Send `POST /v1/users/import/excel` with this file | API returns `400 Bad Request` with message "The Excel file contains no data to import." |

### Scenario 11: Import Excel with Missing Required Columns

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Prepare an Excel file missing the `email` column | File is incomplete |
| 2 | Send `POST /v1/users/import/excel` with this file | API returns `400 Bad Request` with message "Missing required data for a user in Excel. Ensure 'fullname', 'email', 'phoneNumber', and 'password' columns are present and mapped." |

### Scenario 12: Import Excel with Non-Existent Role Names

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Prepare an Excel file with role names that do not exist in the database | Roles are invalid |
| 2 | Send `POST /v1/users/import/excel` with this file | API returns `400 Bad Request` with message "One or more roles not found: {roleNames}" |

### Scenario 13: Import Excel with Duplicate Emails (Database Conflict)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Prepare an Excel file with email addresses that already exist in the database | Emails conflict with existing records |
| 2 | Send `POST /v1/users/import/excel` with this file | API returns `400 Bad Request` with message "Duplicate emails: {emails}" |

### Scenario 14: Import Excel with Duplicate Phone Numbers (Database Conflict)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Prepare an Excel file with phone numbers that already exist in the database | Phone numbers conflict |
| 2 | Send `POST /v1/users/import/excel` with this file | API returns `400 Bad Request` with message "Duplicate phone numbers: {phones}" |

### Scenario 15: Import Excel with Duplicate Rows Within File

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Prepare an Excel file with duplicate rows (same email or phone number) | File has internal duplicates |
| 2 | Send `POST /v1/users/import/excel` with this file | Duplicate entries within the file are silently skipped; unique rows are imported |

### Scenario 16: Import Excel Transaction Rollback on Failure

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Prepare an Excel file that causes an unexpected error during import | Error condition is present |
| 2 | Send `POST /v1/users/import/excel` with this file | API returns `500 Internal Server Error` with message "Failed to import users from Excel: {error.message}" and the entire operation is rolled back |

### Scenario 17: Import Users from Multi-Sheet Excel

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Prepare a valid multi-sheet Excel file with user data on multiple sheets | File is ready |
| 2 | Send `POST /v1/users/import/excel-multi-sheet` as `multipart/form-data` | API returns `200 OK` with message "Import users from Excel success" and users from all sheets |

### Scenario 18: Import Multi-Sheet Excel Without File

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/users/import/excel-multi-sheet` without attaching a file | API returns `400 Bad Request` |

### Scenario 19: Import Multi-Sheet Excel with Invalid MIME Type

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/users/import/excel-multi-sheet` with a non-Excel file | API returns `400 Bad Request` |

### Scenario 20: Import Users from CSV Successfully

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Prepare a valid CSV file with correct headers and data | File is ready |
| 2 | Send `POST /v1/users/import/csv` as `multipart/form-data` | API returns `200 OK` with message "Import users from Csv success" and an array of created user objects |

### Scenario 21: Import CSV with Custom Delimiter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Prepare a CSV file using `,` as delimiter | File uses comma delimiter |
| 2 | Send `POST /v1/users/import/csv` with `delimiter=","` | API parses file using `,` delimiter and imports successfully |

### Scenario 22: Import CSV with Default Delimiter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Prepare a CSV file using `;` as delimiter | File uses semicolon delimiter |
| 2 | Send `POST /v1/users/import/csv` without a `delimiter` parameter | API uses default delimiter `;` and imports successfully |

### Scenario 23: Import CSV Without File

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/users/import/csv` without attaching a file | API returns `400 Bad Request` |

### Scenario 24: Import CSV with Invalid MIME Type

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/users/import/csv` with a non-CSV file (e.g., `.xlsx`) | API returns `400 Bad Request` |

### Scenario 25: Import CSV with Empty File

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Prepare an empty CSV file (no data rows) | File is empty |
| 2 | Send `POST /v1/users/import/csv` with this file | API returns `400 Bad Request` with a `CsvImportError` message |

### Scenario 26: Import CSV with Invalid Delimiter Length

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `POST /v1/users/import/csv` with `delimiter="::"` (more than 1 character) | API returns a Zod validation error |

### Scenario 27: Export Users to Excel

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/users/export/excel` with a valid access token | API returns a file download |
| 2 | Verify response headers | Filename is `users_export.xlsx` with content type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| 3 | Open the exported file | Contains columns: ID, Username, Email, Full Name, Roles, Permissions |

### Scenario 28: Export Users to Excel with Pagination

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/users/export/excel?page=1&perPage=5` | API returns an Excel file with data reflecting the filtered/paginated result set |

### Scenario 29: Export Users to Excel Without Permission

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Authenticate as a user without export permission | Access token obtained |
| 2 | Send `GET /v1/users/export/excel` | API returns `403 Forbidden` |

### Scenario 30: Export Users to Multi-Sheet Excel

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/users/export/excel-multi-sheet` with a valid access token | API returns a file download with filename `users_export_multi.xlsx` |
| 2 | Open the exported file | Contains two sheets named "Users Data 1" and "Users Data 2", both containing the same data |

### Scenario 31: Export Users to CSV

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/users/export/csv` with a valid access token | API returns a file download with filename `users_export.csv` and content type `text/csv` |
| 2 | Open the exported file | Contains columns: ID, Full Name, Email, Roles, Permissions |

### Scenario 32: Export Users to CSV with Custom Delimiter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/users/export/csv?delimiter=,` | API returns a CSV file using `,` as the delimiter |

### Scenario 33: Export Users to CSV with Default Delimiter

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/users/export/csv` without a `delimiter` parameter | API returns a CSV file using default delimiter `;` |

### Scenario 34: Export Users to PDF

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send `GET /v1/users/export/pdf` with a valid access token | API returns a file download with filename `users_export.pdf` and content type `application/pdf` |
| 2 | Open the exported PDF | Contains a table format, A4 portrait orientation, with 10mm margins |

### Scenario 35: Export Data Limited by Pagination

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send any export endpoint with `perPage=5` | Exported data is limited by the `perPage` parameter (export uses the same pagination as listing) |
