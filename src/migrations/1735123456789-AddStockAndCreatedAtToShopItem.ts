import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStockAndCreatedAtToShopItem1735123456789
  implements MigrationInterface
{
  name = 'AddStockAndCreatedAtToShopItem1735123456789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shop_item" ADD "stock" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_item" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "shop_item" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "shop_item" DROP COLUMN "stock"`);
  }
}
