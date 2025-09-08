import { IBaseEntity } from './base-entity.interface';

export interface IPlatform extends IBaseEntity {
    framework: string; // e.g., NestJS, Express, .NET, etc.
    ormProvider: string; // e.g., TypeORM, EF Core, Sequelize, etc.
    databaseProvider: string; // e.g., PostgreSQL, MySQL, SQL Server, etc.
}
