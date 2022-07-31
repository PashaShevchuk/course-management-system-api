import { MigrationInterface, QueryRunner } from 'typeorm';

export class courseFeedbackTable1656856200601 implements MigrationInterface {
  name = 'courseFeedbackTable1656856200601';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "course_feedback"
                             (
                                 "id"           uuid                    NOT NULL DEFAULT uuid_generate_v4(),
                                 "text"         character varying(2000) NOT NULL,
                                 "created_at"   TIMESTAMP               NOT NULL DEFAULT now(),
                                 "updated_at"   TIMESTAMP               NOT NULL DEFAULT now(),
                                 "courseId"     uuid,
                                 "instructorId" uuid,
                                 "studentId"    uuid,
                                 CONSTRAINT "PK_26692f02c1ac95aced42824143f" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_f78957d177f49070c1fa3cbe47" ON "course_feedback" ("courseId", "instructorId", "studentId") `,
    );
    await queryRunner.query(`ALTER TABLE "course_feedback"
        ADD CONSTRAINT "FK_14ae42e572a5d52b8a10cdba83d" FOREIGN KEY ("courseId") REFERENCES "course" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "course_feedback"
        ADD CONSTRAINT "FK_700c850f241aba001e03ba064b9" FOREIGN KEY ("instructorId") REFERENCES "instructor" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "course_feedback"
        ADD CONSTRAINT "FK_beee322f912883ed477d8752ab3" FOREIGN KEY ("studentId") REFERENCES "student" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course_feedback"
        DROP CONSTRAINT "FK_beee322f912883ed477d8752ab3"`);
    await queryRunner.query(`ALTER TABLE "course_feedback"
        DROP CONSTRAINT "FK_700c850f241aba001e03ba064b9"`);
    await queryRunner.query(`ALTER TABLE "course_feedback"
        DROP CONSTRAINT "FK_14ae42e572a5d52b8a10cdba83d"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f78957d177f49070c1fa3cbe47"`,
    );
    await queryRunner.query(`DROP TABLE "course_feedback"`);
  }
}
