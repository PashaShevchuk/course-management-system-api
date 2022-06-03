import { MigrationInterface, QueryRunner } from 'typeorm';

export class admin1654287771481 implements MigrationInterface {
  name = 'admin1654287771481';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "admin"
       (
           "id"            uuid                   NOT NULL DEFAULT uuid_generate_v4(),
           "first_name"    character varying(100) NOT NULL,
           "last_name"     character varying(100) NOT NULL,
           "email"         character varying(255) NOT NULL,
           "hash_password" character varying(150) NOT NULL,
           "is_active"     boolean                NOT NULL,
           "created_at"    TIMESTAMP              NOT NULL DEFAULT now(),
           "updated_at"    TIMESTAMP              NOT NULL DEFAULT now(),
           "role"          character varying(255),
           CONSTRAINT "UQ_de87485f6489f5d0995f5841952" UNIQUE ("email"),
           CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin"
          ADD CONSTRAINT "FK_1b1a1d4bfda020e24e54b1da7e3" FOREIGN KEY ("role") REFERENCES "user_role" ("role") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "admin"
          DROP CONSTRAINT "FK_1b1a1d4bfda020e24e54b1da7e3"`,
    );
    await queryRunner.query(`DROP TABLE "admin"`);
  }
}
