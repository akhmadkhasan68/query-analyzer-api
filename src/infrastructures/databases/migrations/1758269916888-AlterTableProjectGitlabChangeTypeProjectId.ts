import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableProjectGitlabChangeTypeProjectId1758269916888 implements MigrationInterface {
    name = 'AlterTableProjectGitlabChangeTypeProjectId1758269916888'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "project_gitlabs" DROP COLUMN "project_id"');
        await queryRunner.query('ALTER TABLE "project_gitlabs" ADD "project_id" uuid NOT NULL');
        await queryRunner.query('ALTER TABLE "project_gitlabs" ADD CONSTRAINT "UQ_91a93ce9f4f8f7bc79cd043165d" UNIQUE ("project_id")');
        await queryRunner.query('ALTER TABLE "project_gitlabs" ADD CONSTRAINT "FK_91a93ce9f4f8f7bc79cd043165d" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "project_gitlabs" DROP CONSTRAINT "FK_91a93ce9f4f8f7bc79cd043165d"');
        await queryRunner.query('ALTER TABLE "project_gitlabs" DROP CONSTRAINT "UQ_91a93ce9f4f8f7bc79cd043165d"');
        await queryRunner.query('ALTER TABLE "project_gitlabs" DROP COLUMN "project_id"');
        await queryRunner.query('ALTER TABLE "project_gitlabs" ADD "project_id" character varying NOT NULL');
    }

}
