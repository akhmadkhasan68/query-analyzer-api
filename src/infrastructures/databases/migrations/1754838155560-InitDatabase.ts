import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDatabase1754838155560 implements MigrationInterface {
    name = 'InitDatabase1754838155560'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE TABLE "operations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "slug" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, CONSTRAINT "UQ_449cba71a0ae7dbab186aa4c156" UNIQUE ("slug"), CONSTRAINT "PK_7b62d84d6f9912b975987165856" PRIMARY KEY ("id"))');
        await queryRunner.query('CREATE TABLE "resources" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "slug" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "description" text, CONSTRAINT "UQ_9bc050eb2c77e448471cafbc6f3" UNIQUE ("slug"), CONSTRAINT "PK_632484ab9dff41bba94f9b7c85e" PRIMARY KEY ("id"))');
        await queryRunner.query('CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "slug" character varying NOT NULL, "name" character varying NOT NULL, "description" text, "resource_id" uuid, "operation_id" uuid, CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))');
        await queryRunner.query('CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "slug" character varying NOT NULL, "name" character varying NOT NULL, "description" text, CONSTRAINT "UQ_881f72bac969d9a00a1a29e1079" UNIQUE ("slug"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))');
        await queryRunner.query('CREATE TABLE "user_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "token" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "type" character varying NOT NULL DEFAULT \'refresh-token\', "user_id" uuid, CONSTRAINT "UQ_4e993847043f5bf10656b917985" UNIQUE ("token"), CONSTRAINT "PK_63764db9d9aaa4af33e07b2f4bf" PRIMARY KEY ("id"))');
        await queryRunner.query('CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "fullname" character varying NOT NULL, "email" character varying NOT NULL, "email_verified_at" TIMESTAMP, "password" character varying NOT NULL, "phone_number" character varying NOT NULL, "phone_number_verified_at" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_17d1817f241f10a3dbafb169fd2" UNIQUE ("phone_number"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))');
        await queryRunner.query('CREATE TABLE "storage_file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(255) NOT NULL, "path" character varying(255) NOT NULL, "size" integer NOT NULL, "mimetype" character varying(50) NOT NULL, "driver" character varying(50) NOT NULL, CONSTRAINT "PK_b227a0824aac2dd9136c5052d8a" PRIMARY KEY ("id"))');
        await queryRunner.query('CREATE TABLE "role_permissions" ("permissions_id" uuid NOT NULL, "roles_id" uuid NOT NULL, CONSTRAINT "PK_3a2404462ad8373a26704fb1f1c" PRIMARY KEY ("permissions_id", "roles_id"))');
        await queryRunner.query('CREATE INDEX "IDX_bae04782e4d2b4d4c978528970" ON "role_permissions" ("permissions_id") ');
        await queryRunner.query('CREATE INDEX "IDX_ad074b0f95ff0488162868be2c" ON "role_permissions" ("roles_id") ');
        await queryRunner.query('CREATE TABLE "user_roles" ("roles_id" uuid NOT NULL, "users_id" uuid NOT NULL, CONSTRAINT "PK_65ec3daed53f391c53df7e2e8fb" PRIMARY KEY ("roles_id", "users_id"))');
        await queryRunner.query('CREATE INDEX "IDX_4a08d003e00caf075a4a212d23" ON "user_roles" ("roles_id") ');
        await queryRunner.query('CREATE INDEX "IDX_8e1215206acb19f1c38dbda909" ON "user_roles" ("users_id") ');
        await queryRunner.query('ALTER TABLE "permissions" ADD CONSTRAINT "FK_a5b7bf2f14f8df49fc610e9a8be" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
        await queryRunner.query('ALTER TABLE "permissions" ADD CONSTRAINT "FK_466e789688587a5013d6e873310" FOREIGN KEY ("operation_id") REFERENCES "operations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
        await queryRunner.query('ALTER TABLE "user_tokens" ADD CONSTRAINT "FK_9e144a67be49e5bba91195ef5de" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
        await queryRunner.query('ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_bae04782e4d2b4d4c978528970c" FOREIGN KEY ("permissions_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE');
        await queryRunner.query('ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_ad074b0f95ff0488162868be2c7" FOREIGN KEY ("roles_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE');
        await queryRunner.query('ALTER TABLE "user_roles" ADD CONSTRAINT "FK_4a08d003e00caf075a4a212d23d" FOREIGN KEY ("roles_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE');
        await queryRunner.query('ALTER TABLE "user_roles" ADD CONSTRAINT "FK_8e1215206acb19f1c38dbda9091" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "user_roles" DROP CONSTRAINT "FK_8e1215206acb19f1c38dbda9091"');
        await queryRunner.query('ALTER TABLE "user_roles" DROP CONSTRAINT "FK_4a08d003e00caf075a4a212d23d"');
        await queryRunner.query('ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_ad074b0f95ff0488162868be2c7"');
        await queryRunner.query('ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_bae04782e4d2b4d4c978528970c"');
        await queryRunner.query('ALTER TABLE "user_tokens" DROP CONSTRAINT "FK_9e144a67be49e5bba91195ef5de"');
        await queryRunner.query('ALTER TABLE "permissions" DROP CONSTRAINT "FK_466e789688587a5013d6e873310"');
        await queryRunner.query('ALTER TABLE "permissions" DROP CONSTRAINT "FK_a5b7bf2f14f8df49fc610e9a8be"');
        await queryRunner.query('DROP INDEX "public"."IDX_8e1215206acb19f1c38dbda909"');
        await queryRunner.query('DROP INDEX "public"."IDX_4a08d003e00caf075a4a212d23"');
        await queryRunner.query('DROP TABLE "user_roles"');
        await queryRunner.query('DROP INDEX "public"."IDX_ad074b0f95ff0488162868be2c"');
        await queryRunner.query('DROP INDEX "public"."IDX_bae04782e4d2b4d4c978528970"');
        await queryRunner.query('DROP TABLE "role_permissions"');
        await queryRunner.query('DROP TABLE "storage_file"');
        await queryRunner.query('DROP TABLE "users"');
        await queryRunner.query('DROP TABLE "user_tokens"');
        await queryRunner.query('DROP TABLE "roles"');
        await queryRunner.query('DROP TABLE "permissions"');
        await queryRunner.query('DROP TABLE "resources"');
        await queryRunner.query('DROP TABLE "operations"');
    }

}
