import { MigrationInterface, QueryRunner } from 'typeorm';

export class instructorTable1654590477791 implements MigrationInterface {
  name = 'instructorTable1654590477791';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."instructor_role_enum" AS ENUM('admin', 'instructor', 'student')`,
    );
    await queryRunner.query(
      `CREATE TABLE "instructor"
       (
           "id"            uuid                            NOT NULL DEFAULT uuid_generate_v4(),
           "first_name"    character varying(100)          NOT NULL,
           "last_name"     character varying(100)          NOT NULL,
           "email"         character varying(255)          NOT NULL,
           "hash_password" character varying(150)          NOT NULL,
           "position"      character varying(255)          NOT NULL,
           "is_active"     boolean                         NOT NULL,
           "role"          "public"."instructor_role_enum" NOT NULL DEFAULT 'instructor',
           "created_at"    TIMESTAMP                       NOT NULL DEFAULT now(),
           "updated_at"    TIMESTAMP                       NOT NULL DEFAULT now(),
           CONSTRAINT "UQ_6222960ab4f2b68e84bc00bfeeb" UNIQUE ("email"),
           CONSTRAINT "PK_ccc0348eefb581ca002c05ef2f3" PRIMARY KEY ("id")
       )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "instructor"`);
    await queryRunner.query(`DROP TYPE "public"."instructor_role_enum"`);
  }
}
