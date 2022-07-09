import { MigrationInterface, QueryRunner } from 'typeorm';

export class studentMarkTable1657384111228 implements MigrationInterface {
  name = 'studentMarkTable1657384111228';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "student_mark"
                             (
                                 "id"         uuid      NOT NULL DEFAULT uuid_generate_v4(),
                                 "mark"       integer   NOT NULL,
                                 "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                                 "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                                 "studentId"  uuid,
                                 "lessonId"   uuid,
                                 CONSTRAINT "PK_bd4538b1b76ccdb9f68c32f6f4e" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_90bc06644024219bb58c29f7dc" ON "student_mark" ("studentId", "lessonId") `,
    );
    await queryRunner.query(`ALTER TABLE "student_mark"
        ADD CONSTRAINT "FK_5bd39fa3913703e43e36f1a7239" FOREIGN KEY ("studentId") REFERENCES "student" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "student_mark"
        ADD CONSTRAINT "FK_bc23c9590b9d4d1ec53fad63b83" FOREIGN KEY ("lessonId") REFERENCES "lesson" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "student_mark"
        DROP CONSTRAINT "FK_bc23c9590b9d4d1ec53fad63b83"`);
    await queryRunner.query(`ALTER TABLE "student_mark"
        DROP CONSTRAINT "FK_5bd39fa3913703e43e36f1a7239"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_90bc06644024219bb58c29f7dc"`,
    );
    await queryRunner.query(`DROP TABLE "student_mark"`);
  }
}
