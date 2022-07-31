import { MigrationInterface, QueryRunner } from 'typeorm';

export class studentTable1654590604511 implements MigrationInterface {
  name = 'studentTable1654590604511';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."student_role_enum" AS ENUM('admin', 'instructor', 'student')`,
    );
    await queryRunner.query(`CREATE TABLE "student"
                             (
                                 "id"            uuid                         NOT NULL DEFAULT uuid_generate_v4(),
                                 "first_name"    character varying(100)       NOT NULL,
                                 "last_name"     character varying(100)       NOT NULL,
                                 "email"         character varying(255)       NOT NULL,
                                 "hash_password" character varying(150)       NOT NULL,
                                 "birth_date"    date,
                                 "is_active"     boolean                      NOT NULL,
                                 "role"          "public"."student_role_enum" NOT NULL DEFAULT 'student',
                                 "created_at"    TIMESTAMP                    NOT NULL DEFAULT now(),
                                 "updated_at"    TIMESTAMP                    NOT NULL DEFAULT now(),
                                 CONSTRAINT "UQ_a56c051c91dbe1068ad683f536e" UNIQUE ("email"),
                                 CONSTRAINT "PK_3d8016e1cb58429474a3c041904" PRIMARY KEY ("id")
                             )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "student"`);
    await queryRunner.query(`DROP TYPE "public"."student_role_enum"`);
  }
}
