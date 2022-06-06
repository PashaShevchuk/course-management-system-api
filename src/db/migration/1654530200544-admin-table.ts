import { MigrationInterface, QueryRunner } from 'typeorm';

export class adminTable1654530200544 implements MigrationInterface {
  name = 'adminTable1654530200544';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."admin_role_enum" AS ENUM('admin', 'instructor', 'student')`,
    );
    await queryRunner.query(`CREATE TABLE "admin"
                             (
                                 "id"            uuid                       NOT NULL DEFAULT uuid_generate_v4(),
                                 "first_name"    character varying(100)     NOT NULL,
                                 "last_name"     character varying(100)     NOT NULL,
                                 "email"         character varying(255)     NOT NULL,
                                 "hash_password" character varying(150)     NOT NULL,
                                 "is_active"     boolean                    NOT NULL,
                                 "created_at"    TIMESTAMP                  NOT NULL DEFAULT now(),
                                 "updated_at"    TIMESTAMP                  NOT NULL DEFAULT now(),
                                 "role"          "public"."admin_role_enum" NOT NULL,
                                 CONSTRAINT "UQ_de87485f6489f5d0995f5841952" UNIQUE ("email"),
                                 CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id")
                             )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "admin"`);
    await queryRunner.query(`DROP TYPE "public"."admin_role_enum"`);
  }
}
