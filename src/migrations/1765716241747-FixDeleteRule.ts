import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixDeleteRule1765716241747 implements MigrationInterface {
  name = 'FixDeleteRule1765716241747';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shop_item" DROP CONSTRAINT "FK_beefb0fb9155e03fad89d5aaf40"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_item" ADD CONSTRAINT "FK_beefb0fb9155e03fad89d5aaf40" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shop_item" DROP CONSTRAINT "FK_beefb0fb9155e03fad89d5aaf40"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_item" ADD CONSTRAINT "FK_beefb0fb9155e03fad89d5aaf40" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
