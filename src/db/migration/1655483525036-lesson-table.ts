import { MigrationInterface, QueryRunner } from 'typeorm';

export class lessonTable1655483525036 implements MigrationInterface {
  name = 'lessonTable1655483525036';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "lesson"
                             (
                                 "id"           uuid                    NOT NULL DEFAULT uuid_generate_v4(),
                                 "title"        character varying(255)  NOT NULL,
                                 "description"  character varying(1000) NOT NULL,
                                 "highest_mark" integer                 NOT NULL,
                                 "created_at"   TIMESTAMP               NOT NULL DEFAULT now(),
                                 "updated_at"   TIMESTAMP               NOT NULL DEFAULT now(),
                                 "courseId"     uuid,
                                 CONSTRAINT "PK_0ef25918f0237e68696dee455bd" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`ALTER TABLE "lesson"
        ADD CONSTRAINT "FK_3801ccf9533a8627c1dcb1e33bf" FOREIGN KEY ("courseId") REFERENCES "course" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "lesson"
        DROP CONSTRAINT "FK_3801ccf9533a8627c1dcb1e33bf"`);
    await queryRunner.query(`DROP TABLE "lesson"`);
  }
}
