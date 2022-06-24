import { MigrationInterface, QueryRunner } from 'typeorm';

export class studentCourseTable1655836945564 implements MigrationInterface {
  name = 'studentCourseTable1655836945564';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "student_course"
                             (
                                 "id"         uuid      NOT NULL DEFAULT uuid_generate_v4(),
                                 "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                                 "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                                 "courseId"   uuid,
                                 "studentId"  uuid,
                                 CONSTRAINT "PK_140d2607308f60eda2ae0d72a4f" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_54aa9e67a79cb3305256b841c9" ON "student_course" ("courseId", "studentId") `,
    );
    await queryRunner.query(`ALTER TABLE "student_course"
        ADD CONSTRAINT "FK_01b917cdbb6a420e3857788da1b" FOREIGN KEY ("courseId") REFERENCES "course" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "student_course"
        ADD CONSTRAINT "FK_fe1f74de2fd433ac16a7260d268" FOREIGN KEY ("studentId") REFERENCES "student" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "student_course"
        DROP CONSTRAINT "FK_fe1f74de2fd433ac16a7260d268"`);
    await queryRunner.query(`ALTER TABLE "student_course"
        DROP CONSTRAINT "FK_01b917cdbb6a420e3857788da1b"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_54aa9e67a79cb3305256b841c9"`,
    );
    await queryRunner.query(`DROP TABLE "student_course"`);
  }
}
