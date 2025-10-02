import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableProjectChangeManyToOneSlackChannel1759320882797 implements MigrationInterface {
    name = 'AlterTableProjectChangeManyToOneSlackChannel1759320882797'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "project_slack_channels" DROP CONSTRAINT "FK_489b8b731b0e0233e7b00f8f10e"');
        await queryRunner.query('ALTER TABLE "project_slack_channels" DROP CONSTRAINT "REL_489b8b731b0e0233e7b00f8f10"');
        await queryRunner.query('ALTER TABLE "project_slack_channels" ADD CONSTRAINT "FK_489b8b731b0e0233e7b00f8f10e" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "project_slack_channels" DROP CONSTRAINT "FK_489b8b731b0e0233e7b00f8f10e"');
        await queryRunner.query('ALTER TABLE "project_slack_channels" ADD CONSTRAINT "REL_489b8b731b0e0233e7b00f8f10" UNIQUE ("project_id")');
        await queryRunner.query('ALTER TABLE "project_slack_channels" ADD CONSTRAINT "FK_489b8b731b0e0233e7b00f8f10e" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
    }

}
