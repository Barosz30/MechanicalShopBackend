import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageUrlToShopItem1770988723864 implements MigrationInterface {
    name = 'AddImageUrlToShopItem1770988723864'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shop_item" ADD "imageUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shop_item" DROP COLUMN "imageUrl"`);
    }

}
