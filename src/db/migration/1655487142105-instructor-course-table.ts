import { MigrationInterface, QueryRunner } from 'typeorm';

export class instructorCourseTable1655487142105 implements MigrationInterface {
  name = 'instructorCourseTable1655487142105';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "instructor_course"
                             (
                                 "id"           uuid      NOT NULL DEFAULT uuid_generate_v4(),
                                 "created_at"   TIMESTAMP NOT NULL DEFAULT now(),
                                 "updated_at"   TIMESTAMP NOT NULL DEFAULT now(),
                                 "courseId"     uuid,
                                 "instructorId" uuid,
                                 CONSTRAINT "PK_a649163dd0b8f66a6fe5705bd04" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_cc15b404818e067559f67377c8" ON "instructor_course" ("courseId", "instructorId") `,
    );
    await queryRunner.query(`ALTER TABLE "instructor_course"
        ADD CONSTRAINT "FK_84280cb1bc07ed891b6d9f92a43" FOREIGN KEY ("courseId") REFERENCES "course" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "instructor_course"
        ADD CONSTRAINT "FK_d1e8076b80c9043faa4619205a9" FOREIGN KEY ("instructorId") REFERENCES "instructor" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "instructor_course"
        DROP CONSTRAINT "FK_d1e8076b80c9043faa4619205a9"`);
    await queryRunner.query(`ALTER TABLE "instructor_course"
        DROP CONSTRAINT "FK_84280cb1bc07ed891b6d9f92a43"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cc15b404818e067559f67377c8"`,
    );
    await queryRunner.query(`DROP TABLE "instructor_course"`);
  }
}
