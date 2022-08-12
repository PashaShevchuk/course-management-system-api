import { MigrationInterface, QueryRunner } from 'typeorm';

export class foo1660307685548 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO admin(id, first_name, last_name, email, hash_password, is_active, role)
        VALUES ('bc506ec4-c6fa-40cc-93f4-cce62d4df80e', 'Pavlo', 'Shevchuk', 'shevchuk.pavlo1@gmail.com',
                '$2a$10$AMO9v6Pjvi411Zwp8R3cBe84Fls4UHBGfAbk4H5n/5kvkCbZS7qLW', true, 'admin');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE
        FROM admin
        WHERE id = 'bc506ec4-c6fa-40cc-93f4-cce62d4df80e';
    `);
  }
}
