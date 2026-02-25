import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveTypeFromShopItem1735123456790 implements MigrationInterface {
  name = 'RemoveTypeFromShopItem1735123456790';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "shop_item" DROP COLUMN "type"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shop_item" ADD "type" "public"."shop_item_type_enum" NOT NULL DEFAULT 'BIKE'`,
    );
  }
}
