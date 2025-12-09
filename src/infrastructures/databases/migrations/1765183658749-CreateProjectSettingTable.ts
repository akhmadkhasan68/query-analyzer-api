import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProjectSettingTable1765183658749 implements MigrationInterface {
    name = 'CreateProjectSettingTable1765183658749'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "project_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "project_id" uuid NOT NULL, "key" character varying NOT NULL, "values" jsonb NOT NULL, CONSTRAINT "REL_05cf250364d77b0603193d5542" UNIQUE ("project_id"), CONSTRAINT "PK_744b5c99a54e4ad449a194f8077" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "project_settings" ADD CONSTRAINT "FK_05cf250364d77b0603193d55422" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project_settings" DROP CONSTRAINT "FK_05cf250364d77b0603193d55422"`);
        await queryRunner.query(`DROP TABLE "project_settings"`);
    }

}
