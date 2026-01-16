import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategory1765711864330 implements MigrationInterface {
    name = 'AddCategory1765711864330'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "category" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "shop_item" ADD "categoryId" integer`);
        await queryRunner.query(`ALTER TABLE "shop_item" ADD CONSTRAINT "FK_beefb0fb9155e03fad89d5aaf40" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shop_item" DROP CONSTRAINT "FK_beefb0fb9155e03fad89d5aaf40"`);
        await queryRunner.query(`ALTER TABLE "shop_item" DROP COLUMN "categoryId"`);
        await queryRunner.query(`DROP TABLE "category"`);
    }

}
