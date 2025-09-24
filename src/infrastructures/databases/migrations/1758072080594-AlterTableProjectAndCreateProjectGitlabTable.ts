import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableProjectAndCreateProjectGitlabTable1758072080594 implements MigrationInterface {
    name = 'AlterTableProjectAndCreateProjectGitlabTable1758072080594'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE TABLE "project_gitlabs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "project_id" character varying NOT NULL, "gitlab_project_id" bigint NOT NULL, "gitlab_url" character varying NOT NULL, "gitlab_group_id" bigint NOT NULL, "gitlab_group_name" character varying NOT NULL, "gitlab_namespace" character varying NOT NULL, "gitlab_default_branch" character varying NOT NULL, "gitlab_visibility" character varying NOT NULL, CONSTRAINT "PK_5d2e06886f454c4294a53a76678" PRIMARY KEY ("id"))');
        await queryRunner.query('ALTER TABLE "projects" DROP COLUMN "gitlab_project_id"');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "projects" ADD "gitlab_project_id" bigint');
        await queryRunner.query('DROP TABLE "project_gitlabs"');
    }

}
