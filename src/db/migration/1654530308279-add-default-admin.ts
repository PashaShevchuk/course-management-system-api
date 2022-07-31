import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDefaultAdmin1654530308279 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO admin(id, first_name, last_name, email, hash_password, is_active, role)
        VALUES ('ad474c13-da54-489a-92d1-db11bbb79f72', 'Pavlo', 'Shevchuk', 'email@gmail.com',
                '$2a$10$AMO9v6Pjvi411Zwp8R3cBe84Fls4UHBGfAbk4H5n/5kvkCbZS7qLW', true, 'admin');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE
        FROM admin
        WHERE id = 'ad474c13-da54-489a-92d1-db11bbb79f72';
    `);
  }
}
