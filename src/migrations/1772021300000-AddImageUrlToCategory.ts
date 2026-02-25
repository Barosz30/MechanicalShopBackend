import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageUrlToCategory1772021300000 implements MigrationInterface {
    name = 'AddImageUrlToCategory1772021300000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" DROP COLUMN IF EXISTS "imageUrl"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" ADD "imageUrl" character varying`);
    }

}
