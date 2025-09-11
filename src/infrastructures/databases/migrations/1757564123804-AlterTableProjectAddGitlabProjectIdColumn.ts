import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableProjectAddGitlabProjectIdColumn1757564123804 implements MigrationInterface {
    name = 'AlterTableProjectAddGitlabProjectIdColumn1757564123804'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "projects" ADD "gitlab_project_id" bigint');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "projects" DROP COLUMN "gitlab_project_id"');
    }

}
