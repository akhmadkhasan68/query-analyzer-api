import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreaetProjectSlackChannelTable1759309026117 implements MigrationInterface {
    name = 'CreaetProjectSlackChannelTable1759309026117'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE TABLE "project_slack_channels" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "project_id" uuid NOT NULL, "slack_channel_id" character varying NOT NULL, CONSTRAINT "REL_489b8b731b0e0233e7b00f8f10" UNIQUE ("project_id"), CONSTRAINT "PK_3e44020dfe56cc8c54048dea6a9" PRIMARY KEY ("id"))');
        await queryRunner.query('ALTER TABLE "project_slack_channels" ADD CONSTRAINT "FK_489b8b731b0e0233e7b00f8f10e" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "project_slack_channels" DROP CONSTRAINT "FK_489b8b731b0e0233e7b00f8f10e"');
        await queryRunner.query('DROP TABLE "project_slack_channels"');
    }

}
