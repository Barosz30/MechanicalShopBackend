import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrderTable1772200000000 implements MigrationInterface {
    name = 'CreateOrderTable1772200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          `CREATE TABLE "order" (
            "id" SERIAL NOT NULL,
            "quantity" integer NOT NULL DEFAULT 1,
            "totalAmount" integer NOT NULL,
            "status" character varying(20) NOT NULL DEFAULT 'PENDING',
            "stripeSessionId" character varying,
            "stripePaymentIntentId" character varying,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "userId" integer NOT NULL,
            "itemId" integer NOT NULL,
            CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id")
          )`,
        );
        await queryRunner.query(
          `ALTER TABLE "order"
            ADD CONSTRAINT "FK_order_user"
            FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
          `ALTER TABLE "order"
            ADD CONSTRAINT "FK_order_item"
            FOREIGN KEY ("itemId") REFERENCES "shop_item"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          `ALTER TABLE "order" DROP CONSTRAINT "FK_order_item"`,
        );
        await queryRunner.query(
          `ALTER TABLE "order" DROP CONSTRAINT "FK_order_user"`,
        );
        await queryRunner.query(`DROP TABLE "order"`);
    }
}

