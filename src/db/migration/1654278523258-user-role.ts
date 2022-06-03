import { MigrationInterface, QueryRunner } from 'typeorm';

export class userRole1654278523258 implements MigrationInterface {
  name = 'userRole1654278523258';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_role"
       (
           "role"       character varying(255) NOT NULL,
           "created_at" TIMESTAMP              NOT NULL DEFAULT now(),
           "updated_at" TIMESTAMP              NOT NULL DEFAULT now(),
           CONSTRAINT "PK_30ddd91a212a9d03669bc1dee74" PRIMARY KEY ("role")
       )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_role"`);
  }
}
