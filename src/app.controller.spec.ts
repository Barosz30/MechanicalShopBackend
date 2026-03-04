import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return HTML page with GraphQL and Swagger links', () => {
      const html = appController.getHello();
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('graphql');
      expect(html).toContain('api');
      expect(html).toContain('Swagger');
    });
  });
});
