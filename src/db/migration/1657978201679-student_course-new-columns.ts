import { MigrationInterface, QueryRunner } from 'typeorm';

export class studentCourseNewColumns1657978201679
  implements MigrationInterface
{
  name = 'studentCourseNewColumns1657978201679';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "student_course"
        ADD "final_mark" integer`);
    await queryRunner.query(`ALTER TABLE "student_course"
        ADD "is_course_pass" boolean`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "student_course"
        DROP COLUMN "is_course_pass"`);
    await queryRunner.query(`ALTER TABLE "student_course"
        DROP COLUMN "final_mark"`);
  }
}
