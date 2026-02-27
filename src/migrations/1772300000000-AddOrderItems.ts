import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderItems1772300000000 implements MigrationInterface {
  name = 'AddOrderItems1772300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "order_item" (
        "id" SERIAL NOT NULL,
        "quantity" integer NOT NULL,
        "unitPrice" integer NOT NULL,
        "orderId" integer NOT NULL,
        "itemId" integer NOT NULL,
        CONSTRAINT "PK_order_item_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item"
        ADD CONSTRAINT "FK_order_item_order"
        FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item"
        ADD CONSTRAINT "FK_order_item_item"
        FOREIGN KEY ("itemId") REFERENCES "shop_item"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `INSERT INTO "order_item" ("quantity", "unitPrice", "orderId", "itemId")
       SELECT o."quantity", s."price", o."id", o."itemId"
       FROM "order" o
       JOIN "shop_item" s ON s."id" = o."itemId"`,
    );

    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_order_item"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP COLUMN "itemId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP COLUMN "quantity"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" ADD COLUMN "itemId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD COLUMN "quantity" integer NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `UPDATE "order" o SET "itemId" = (
        SELECT oi."itemId" FROM "order_item" oi WHERE oi."orderId" = o."id" LIMIT 1
       ), "quantity" = (
        SELECT oi."quantity" FROM "order_item" oi WHERE oi."orderId" = o."id" LIMIT 1
       )`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_order_item"
       FOREIGN KEY ("itemId") REFERENCES "shop_item"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_order_item_item"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_order_item_order"`,
    );
    await queryRunner.query(`DROP TABLE "order_item"`);
  }
}
