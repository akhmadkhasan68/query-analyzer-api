import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableProjectGitlabDropColumnNamespace1758269071759 implements MigrationInterface {
    name = 'AlterTableProjectGitlabDropColumnNamespace1758269071759'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "project_gitlabs" DROP COLUMN "gitlab_namespace"');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "project_gitlabs" ADD "gitlab_namespace" character varying NOT NULL');
    }

}
