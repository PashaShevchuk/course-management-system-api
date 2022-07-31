import { MigrationInterface, QueryRunner } from 'typeorm';

export class courseTable1655479622651 implements MigrationInterface {
  name = 'courseTable1655479622651';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "course"
                             (
                                 "id"           uuid                    NOT NULL DEFAULT uuid_generate_v4(),
                                 "title"        character varying(255)  NOT NULL,
                                 "description"  character varying(1000) NOT NULL,
                                 "is_published" boolean                 NOT NULL,
                                 "created_at"   TIMESTAMP               NOT NULL DEFAULT now(),
                                 "updated_at"   TIMESTAMP               NOT NULL DEFAULT now(),
                                 CONSTRAINT "PK_bf95180dd756fd204fb01ce4916" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_5a805c442783e6b16886ac75e3" ON "course" ("is_published") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5a805c442783e6b16886ac75e3"`,
    );
    await queryRunner.query(`DROP TABLE "course"`);
  }
}
