import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvailability1765379209139 implements MigrationInterface {
  name = 'AddAvailability1765379209139';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shop_item" ADD "isAvailable" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shop_item" DROP COLUMN "isAvailable"`,
    );
  }
}
