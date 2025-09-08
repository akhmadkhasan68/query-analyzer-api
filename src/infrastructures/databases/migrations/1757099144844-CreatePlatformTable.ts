import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlatformTable1757099144844 implements MigrationInterface {
    name = 'CreatePlatformTable1757099144844'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE TABLE "platforms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "framework" character varying NOT NULL, "orm_provider" character varying NOT NULL, "database_provider" character varying NOT NULL, CONSTRAINT "PK_3b879853678f7368d46e52b81c6" PRIMARY KEY ("id"))');
        await queryRunner.query('ALTER TABLE "projects" ADD "platform_id" uuid');
        await queryRunner.query('ALTER TABLE "projects" ADD CONSTRAINT "FK_7fcec57e009546d1e1e1bf2a170" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "projects" DROP CONSTRAINT "FK_7fcec57e009546d1e1e1bf2a170"');
        await queryRunner.query('ALTER TABLE "projects" DROP COLUMN "platform_id"');
        await queryRunner.query('DROP TABLE "platforms"');
    }

}
