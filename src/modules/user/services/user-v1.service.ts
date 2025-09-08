import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import * as exceljs from 'exceljs';
import { ZodValidationException } from 'nestjs-zod';
import * as fs from 'node:fs';
import { join } from 'path';
import { IRole } from 'src/infrastructures/databases/entities/interfaces/role.interface';
import { IUser } from 'src/infrastructures/databases/entities/interfaces/user.interface';
import { Role } from 'src/infrastructures/databases/entities/role.entity';
import { User } from 'src/infrastructures/databases/entities/user.entity';
import { EXPORT_DATA_STRATEGY } from 'src/infrastructures/modules/export-data/constants/export-data-strategy.constant';
import { ExportDataFactoryService } from 'src/infrastructures/modules/export-data/services/export-data-factory.service';
import { IMPORT_DATA_STRATEGY } from 'src/infrastructures/modules/import-data/constants/import-data-strategy.constant';
import { ImportDataFactoryService } from 'src/infrastructures/modules/import-data/services/import-data-factory.service';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { StringUtil } from 'src/shared/utils/string.util';
import { DataSource, In, QueryFailedError } from 'typeorm';
import { ZodError, ZodIssueCode } from 'zod';
import { ERROR_MESSAGE_CONSTANT } from '../../../shared/constants/error-message.constant';
import { RoleV1Repository } from '../../role/repositories/role-v1.repository';
import { UserCreateV1Request } from '../dtos/requests/user-create-v1.request';
import { UserImportCsvV1Request } from '../dtos/requests/user-import-csv-v1.request';
import { UserImportExcelV1Request } from '../dtos/requests/user-import-excel-v1.request';
import { UserPaginateV1Request } from '../dtos/requests/user-paginate-v1.request';
import { UserUpdatePasswordV1Request } from '../dtos/requests/user-update-password-v1.request';
import { UserUpdateV1Request } from '../dtos/requests/user-update-v1.request';
import { UserV1Response } from '../dtos/responses/user-v1.response';
import { UserV1Repository } from '../repositories/user-v1.repository';

@Injectable()
export class UserV1Service {
    constructor(
        private readonly userV1Repository: UserV1Repository,
        private readonly roleV1Repository: RoleV1Repository,
        private readonly dataSource: DataSource,
        private readonly exportDataFactoryService: ExportDataFactoryService,
        private readonly importDataFactoryService: ImportDataFactoryService,
    ) {}

    /**
     * Creates a new user in the system
     *
     * @param dataCreate - The user creation data containing login credentials and profile information
     * @returns Promise resolving to the newly created user object
     *
     * @throws {Error} If user creation fails
     *
     * @remarks
     * The password is automatically hashed before storing in the database.
     * Role assignment is currently pending implementation.
     */
    async create(dataCreate: UserCreateV1Request): Promise<IUser> {
        const newUser = this.userV1Repository.create(dataCreate);

        const roles = await this.validateAndGetRoles(
            dataCreate.roleIds,
            'roleIds',
        );

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const manager = queryRunner.manager;
            const userRepository = manager.getRepository(User);
            newUser.roles = roles;

            await userRepository.save(newUser);
            await queryRunner.commitTransaction();

            return this.findOneById(newUser.id);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    private async validateAndGetRoles(
        ids: string[],
        path: string,
    ): Promise<IRole[]> {
        const roles = await this.roleV1Repository.findBy({
            id: In(ids),
        });

        const foundIds = roles.map((p) => p.id);
        const notFoundIds = ids.filter((id) => !foundIds.includes(id));

        if (notFoundIds.length > 0) {
            throw new ZodValidationException(
                new ZodError([
                    {
                        code: ZodIssueCode.custom,
                        message: `Role Id not found: ${Array.from(
                            notFoundIds,
                        ).join(' | ')}`,
                        path: [path],
                    },
                ]),
            );
        }

        return roles;
    }

    /**
     * Retrieves a paginated list of users based on the provided pagination parameters.
     *
     * @param paginationDto - The pagination parameters for fetching users
     * @returns A promise that resolves to paginated data containing user information
     *          with metadata about the pagination and an array of user items
     *
     * @example
     * const paginationDto = {
     *   page: 1,
     *   limit: 10
     * };
     * const result = await iamUserService.paginate(paginationDto);
     * // Returns: { meta: { ... }, items: [ ... ] }
     */
    async paginate(
        paginationDto: UserPaginateV1Request,
    ): Promise<IPaginateData<IUser>> {
        return this.userV1Repository.paginate(paginationDto);
    }

    /**
     * Finds and retrieves a user by their unique identifier
     * @param id - The unique identifier of the user to find
     * @returns Promise resolving to the user object
     * @throws EntityNotFoundError if user with given id does not exist
     */
    async findOneById(id: string): Promise<IUser> {
        return await this.userV1Repository.findOneByIdOrFailWithRelations(id, [
            'roles',
            'roles.permissions',
        ]);
    }

    /**
     * Updates a user by their ID with the provided data
     * @param userId - The unique identifier of the user to update
     * @param dataUpdate - The data to update the user with
     * @returns Promise resolving to the updated user object
     * @throws {NotFoundException} If user with given ID is not found
     */
    async updateById(
        userId: string,
        dataUpdate: UserUpdateV1Request,
    ): Promise<IUser> {
        const user = await this.findOneById(userId);
        Object.assign(user, dataUpdate);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const manager = queryRunner.manager;
            const userRepository = manager.getRepository(User);

            if (dataUpdate.roleIds && dataUpdate.roleIds.length > 0) {
                const roles = await this.validateAndGetRoles(
                    dataUpdate.roleIds,
                    'roleIds',
                );

                user.roles = roles;
            }

            await userRepository.save(user);
            await queryRunner.commitTransaction();

            return this.findOneById(userId);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Updates the password for a user by their ID
     * @param userId - The unique identifier of the user
     * @param dataUpdate - Object containing the new password information
     * @returns Promise resolving to the updated user object
     * @throws {NotFoundException} If the user is not found
     */
    async updatePasswordById(
        userId: string,
        dataUpdate: UserUpdatePasswordV1Request,
    ): Promise<IUser> {
        const user = await this.findOneById(userId);
        user.password = dataUpdate.newPassword;
        await this.userV1Repository.save(user);

        return this.findOneById(userId);
    }

    /**
     * Performs a soft delete operation on a user record by ID.
     *
     * @param id - The unique identifier of the user to be soft deleted
     * @returns A promise that resolves to true if the deletion was successful
     * @throws QueryFailedError - If no records were affected by the delete operation
     */
    async softDeleteById(id: string): Promise<boolean> {
        const status = await this.userV1Repository.softDelete({ id });
        if (status.affected && status.affected < 1) {
            throw new QueryFailedError(
                'Error, Data not deleted',
                undefined,
                new Error(),
            );
        }

        return true;
    }

    async generateExcel(datas: UserV1Response[]): Promise<Buffer> {
        const formattedDatas = this.formatUserDataForExcel(datas);
        const sheetHeaders = [
            'ID',
            'Username',
            'Email',
            'Full Name',
            'Roles',
            'Permissions',
        ];

        return await this.exportDataFactoryService
            .exportStrategy(EXPORT_DATA_STRATEGY.EXCEL)
            .export(formattedDatas, {
                worksheetName: 'Users Data',
                autoWidth: true,
                headers: sheetHeaders,
            });
    }

    async generateExcelMultiSheet(datas: UserV1Response[]): Promise<Buffer> {
        const formattedDatas = this.formatUserDataForExcel(datas);
        const sheetHeaders = [
            'ID',
            'Username',
            'Email',
            'Full Name',
            'Roles',
            'Permissions',
        ];

        return await this.exportDataFactoryService
            .exportStrategy(EXPORT_DATA_STRATEGY.EXCEL)
            .exportMultiSheet([
                {
                    name: 'Users Data 1',
                    data: formattedDatas,
                    options: {
                        autoWidth: true,
                        headers: sheetHeaders,
                    },
                },
                {
                    name: 'Users Data 2',
                    data: formattedDatas,
                    options: {
                        autoWidth: true,
                        headers: sheetHeaders,
                    },
                },
            ]);
    }

    private formatUserDataForExcel(datas: UserV1Response[]): any[] {
        return datas.map((user) => ({
            ...user,
            roles: user.roles
                ? user.roles.map((role) => role.name).join(', ')
                : '-',
            permissions: user.roles
                ? user.roles
                      .flatMap((role) => role.permissions || [])
                      .map((permission) => permission.name)
                      .join(', ')
                : '-',
        }));
    }

    async generateCsv(
        datas: UserV1Response[],
        delimiter?: string,
    ): Promise<Buffer> {
        const formattedDatas = this.formatUserDataForExcel(datas);
        const sheetHeaders = [
            'ID',
            'Full Name',
            'Email',
            'Roles',
            'Permissions',
        ];
        return await this.exportDataFactoryService
            .exportStrategy(EXPORT_DATA_STRATEGY.CSV)
            .export(formattedDatas, {
                headers: sheetHeaders,
                delimiter,
            });
    }

    async generatePdf(datas: UserV1Response[]): Promise<Buffer> {
        const formattedDatas = this.formatUserDataForExcel(datas);

        return await this.exportDataFactoryService
            .exportStrategy(EXPORT_DATA_STRATEGY.PDF)
            .export(formattedDatas, {
                isCustomTemplate: false,
                template: 'table',
                options: {
                    pageSize: 'A4',
                    orientation: 'Portrait',
                    marginTop: '10mm',
                    marginBottom: '10mm',
                    marginLeft: '10mm',
                    marginRight: '10mm',
                },
            });
    }

    async importExcel(
        fileBuffer: Buffer,
        importExcelDto: UserImportExcelV1Request,
    ): Promise<IUser[]> {
        const headerRowIndex = 1;
        const templatePath = join(__dirname, '../templates/excel/User.xlsx');

        const templateWorkbook = new exceljs.Workbook();
        await templateWorkbook.xlsx.readFile(templatePath);
        const templateWorksheet = templateWorkbook.worksheets[0];
        const headerRow = templateWorksheet.getRow(headerRowIndex);
        const headerTemplate: string[] = Array.isArray(headerRow.values)
            ? headerRow.values
                  .slice(1)
                  .map((v) => (typeof v === 'string' ? v.trim() : ''))
            : [];
        const headerMapped = headerTemplate.reduce(
            (acc, header) => {
                acc[header] = header;
                return acc;
            },
            {} as Record<string, string>,
        );
        const columnMapping = StringUtil.camelCaseKey(headerMapped);

        const rawImportedData = await this.importDataFactoryService
            .importStrategy(IMPORT_DATA_STRATEGY.EXCEL)
            .import(fileBuffer, {
                sheetName: importExcelDto.sheetName,
                headerRow: headerRowIndex,
                columnMapping,
                validateTemplate: templatePath,
            });

        if (rawImportedData.length === 0) {
            throw new BadRequestException(
                'The Excel file contains no data to import.',
            );
        }
        return await this.importUsers(rawImportedData as IUser[]);
    }

    async importExcelMultiSheet(fileBuffer: Buffer): Promise<IUser[]> {
        const headerRowIndex = 1;
        const templatePath = join(__dirname, '../templates/excel/User.xlsx');

        const templateWorkbook = new exceljs.Workbook();
        await templateWorkbook.xlsx.readFile(templatePath);
        const templateWorksheet = templateWorkbook.worksheets[0];
        const headerRow = templateWorksheet.getRow(headerRowIndex);
        const headerTemplate: string[] = Array.isArray(headerRow.values)
            ? headerRow.values
                  .slice(1)
                  .map((v) => (typeof v === 'string' ? v.trim() : ''))
            : [];
        const headerMapped = headerTemplate.reduce(
            (acc, header) => {
                acc[header] = header;
                return acc;
            },
            {} as Record<string, string>,
        );
        const columnMapping = StringUtil.camelCaseKey(headerMapped);

        const rawImportedData = await this.importDataFactoryService
            .importStrategy(IMPORT_DATA_STRATEGY.EXCEL)
            .importMultiSheet(fileBuffer, {
                headerRow: headerRowIndex,
                columnMapping,
                validateTemplate: templatePath,
            });

        if (rawImportedData.length === 0) {
            throw new BadRequestException(
                'The Excel file contains no data to import.',
            );
        }

        return await this.importUsers(rawImportedData as IUser[]);
    }

    private async importUsers(rawImportedData: IUser[]): Promise<IUser[]> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const userRepository = queryRunner.manager.getRepository(User);
        const usersToCreate: User[] = [];
        try {
            //Role unique from file
            const allRoleNames = Array.from(
                new Set(
                    rawImportedData.flatMap((item) =>
                        item.roles
                            ? String(item.roles)
                                  .split(',')
                                  .map((name) => name.trim())
                                  .filter((name) => name !== '')
                            : [],
                    ),
                ),
            );

            // Query role and mapping entity
            let roleMap = new Map<string, Role>();
            if (allRoleNames.length > 0) {
                const allRoles = await queryRunner.manager
                    .getRepository(Role)
                    .find({ where: { name: In(allRoleNames) } });
                if (allRoles.length !== allRoleNames.length) {
                    const notFoundRoles = allRoleNames.filter(
                        (name) => !allRoles.some((r) => r.name === name),
                    );
                    throw new BadRequestException(
                        `One or more roles not found: ${notFoundRoles.join(', ')}`,
                    );
                }
                roleMap = new Map(allRoles.map((role) => [role.name, role]));
            }

            // Validate duplicate email/phone
            const emails = rawImportedData.map((item) =>
                String(item.email).trim(),
            );
            const phones = rawImportedData.map((item) =>
                String(item.phoneNumber).trim(),
            );
            const existingUsers = await userRepository.find({
                where: [{ email: In(emails) }, { phoneNumber: In(phones) }],
            });
            const existingEmails = new Set(existingUsers.map((u) => u.email));
            const existingPhones = new Set(
                existingUsers.map((u) => u.phoneNumber),
            );
            const messages = [
                existingEmails.size
                    ? `Duplicate emails: ${emails.filter((email) => existingEmails.has(email)).join(', ')}`
                    : null,
                existingPhones.size
                    ? `Duplicate phone numbers: ${phones.filter((phone) => existingPhones.has(phone)).join(', ')}`
                    : null,
            ].filter(Boolean);

            if (messages.length) {
                throw new BadRequestException(messages.join(' | '));
            }

            // Transform Data
            for (const item of rawImportedData) {
                if (
                    !item.fullname ||
                    !item.email ||
                    !item.password ||
                    !item.phoneNumber
                ) {
                    throw new BadRequestException(
                        'Missing required data for a user in Excel. Ensure "fullname", "email", "phoneNumber", and "password" columns are present and mapped.',
                    );
                }

                // Check duplicate data
                const isDuplicate = usersToCreate.some(
                    (u) =>
                        u.email === item.email ||
                        u.phoneNumber === item.phoneNumber,
                );
                if (isDuplicate) {
                    continue; // skip duplicate data in file
                }

                let userRoles: Role[] = [];
                if (item.roles) {
                    const roleNames = String(item.roles)
                        .split(',')
                        .map((name) => name.trim())
                        .filter((name) => name !== '');
                    userRoles = roleNames.map((name) => {
                        const role = roleMap.get(name);
                        if (!role)
                            throw new BadRequestException(
                                `Role not found: ${name}`,
                            );
                        return role;
                    });
                }

                const newUser = userRepository.create({
                    email: String(item.email),
                    fullname: String(item.fullname),
                    phoneNumber: String(item.phoneNumber),
                    password: String(item.password),
                    roles: userRoles,
                });
                usersToCreate.push(newUser);
            }
            const createdUsers = await queryRunner.manager
                .getRepository(User)
                .save(usersToCreate);
            await queryRunner.commitTransaction();

            const createdUserIds = createdUsers.map((u) => u.id);
            const savedUsersWithRelations = await this.userV1Repository.find({
                where: { id: In(createdUserIds) },
            });

            return savedUsersWithRelations;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Failed to import users from Excel: ${error.message || 'Unknown error'}`,
            );
        } finally {
            await queryRunner.release();
        }
    }

    async importCsv(
        fileBuffer: Buffer,
        importCsvDto: UserImportCsvV1Request,
    ): Promise<IUser[]> {
        const headerRowIndex = 0;
        const templatePath = join(__dirname, '../templates/csv/User.csv');
        // Read template file and extract headers
        let templateFileContent: string;
        try {
            templateFileContent = fs.readFileSync(templatePath, 'utf8');
        } catch {
            throw new BadRequestException(ERROR_MESSAGE_CONSTANT.FileNotFound);
        }

        // Handle UTF-8 BOM if present
        if (templateFileContent.startsWith('\ufeff')) {
            templateFileContent = templateFileContent.slice(1);
        }
        // Split into lines and get headers
        const headerLines = templateFileContent
            .split('\n')
            .filter((row) => row.trim() !== '');
        const delimiter = importCsvDto.delimiter || ';';
        const templateHeaders: string[] = headerLines[0]
            .split(delimiter)
            .map((header) => header.trim().replace(/"/g, ''));

        const headerMappingObj = templateHeaders.reduce(
            (acc, header) => {
                acc[header] = header;
                return acc;
            },
            {} as Record<string, string>,
        );
        const columnMapping = StringUtil.camelCaseKey(headerMappingObj);

        const rawImportedData = (await this.importDataFactoryService
            .importStrategy(EXPORT_DATA_STRATEGY.CSV)
            .import(fileBuffer, {
                delimiter: importCsvDto.delimiter,
                headerRow: headerRowIndex,
                columnMapping,
                validateTemplate: templatePath,
            })) as IUser[];

        if (rawImportedData.length === 0) {
            throw new BadRequestException(
                ERROR_MESSAGE_CONSTANT.CsvImportError,
            );
        }
        return await this.importUsers(rawImportedData as IUser[]);
    }
}
