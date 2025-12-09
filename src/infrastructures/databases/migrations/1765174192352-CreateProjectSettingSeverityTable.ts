import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProjectSettingSeverityTable1765174192352 implements MigrationInterface {
    name = 'CreateProjectSettingSeverityTable1765174192352'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "project_setting_severities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "project_id" uuid NOT NULL, "severity" character varying NOT NULL, "threshold" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_dd450233b99f8e10205e5b3fffc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "project_setting_severities" ADD CONSTRAINT "FK_b1b0e50d70c10c620d5e1698015" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project_setting_severities" DROP CONSTRAINT "FK_b1b0e50d70c10c620d5e1698015"`);
        await queryRunner.query(`DROP TABLE "project_setting_severities"`);
    }

}
