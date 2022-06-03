import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUserRole1654278596237 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO user_role(role)
        VALUES ('admin');
    `);
    await queryRunner.query(`
        INSERT INTO user_role(role)
        VALUES ('instructor');
    `);
    await queryRunner.query(`
        INSERT INTO user_role(role)
        VALUES ('student');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE
        FROM user_role
        WHERE role = 'admin';
    `);
    await queryRunner.query(`
        DELETE
        FROM user_role
        WHERE role = 'instructor';
    `);
    await queryRunner.query(`
        DELETE
        FROM user_role
        WHERE role = 'student';
    `);
  }
}
