import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjectKeyTable1757098807775 implements MigrationInterface {
    name = 'CreateProjectKeyTable1757098807775';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE "project_keys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "project_id" uuid NOT NULL, "name" character varying NOT NULL, "hashed_key" character varying NOT NULL, "masked_key" character varying NOT NULL, "last_used_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d2e1e3eff85951bd6cbc3f446f8" PRIMARY KEY ("id"))',
        );
        await queryRunner.query(
            'ALTER TABLE "project_keys" ADD CONSTRAINT "FK_8350c01bda6cd054a653edd010d" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE "project_keys" DROP CONSTRAINT "FK_8350c01bda6cd054a653edd010d"',
        );
        await queryRunner.query('DROP TABLE "project_keys"');
    }
}
