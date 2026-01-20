/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Validation and Error Handling (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Player Validation', () => {
    it('should return 400 for invalid player id format', async () => {
      const response = await request(app.getHttpServer())
        .post('/player')
        .send({ id: 'inv@lid' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for empty player id', async () => {
      const response = await request(app.getHttpServer())
        .post('/player')
        .send({ id: '' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for missing id field', async () => {
      const response = await request(app.getHttpServer())
        .post('/player')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for id too short', async () => {
      const response = await request(app.getHttpServer())
        .post('/player')
        .send({ id: 'ab' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for id too long', async () => {
      const response = await request(app.getHttpServer())
        .post('/player')
        .send({ id: 'a'.repeat(31) })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should accept valid player ids', async () => {
      const validIds = ['player1', 'Player-123', 'test_player', '123456', 'AbC-123_xyz'];

      for (const id of validIds) {
        const response = await request(app.getHttpServer())
          .post('/player')
          .send({ id })
          .expect(201);

        expect(response.body).toHaveProperty('id', id);
      }
    });
  });

  describe('Match Validation', () => {
    beforeAll(async () => {
      // Create test players
      await request(app.getHttpServer()).post('/player').send({ id: 'alice' });
      await request(app.getHttpServer()).post('/player').send({ id: 'bob' });
    });

    it('should return 400 for invalid winner format', async () => {
      const response = await request(app.getHttpServer())
        .post('/match')
        .send({
          winner: 'inv@lid',
          loser: 'bob',
          draw: false,
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for invalid draw type', async () => {
      const response = await request(app.getHttpServer())
        .post('/match')
        .send({
          winner: 'alice',
          loser: 'bob',
          draw: 'yes',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for missing winner', async () => {
      const response = await request(app.getHttpServer())
        .post('/match')
        .send({
          loser: 'bob',
          draw: false,
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for missing loser', async () => {
      const response = await request(app.getHttpServer())
        .post('/match')
        .send({
          winner: 'alice',
          draw: false,
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for missing draw', async () => {
      const response = await request(app.getHttpServer())
        .post('/match')
        .send({
          winner: 'alice',
          loser: 'bob',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('HTTP Error Responses', () => {
    it('should return 404 for unknown route', async () => {
      await request(app.getHttpServer())
        .get('/unknown-route')
        .expect(404);
    });

    it('should return 405 for unsupported method', async () => {
      await request(app.getHttpServer())
        .patch('/player')
        .expect(405);
    });

    it('should return 400 for malformed JSON', async () => {
      const response = await request(app.getHttpServer())
        .post('/player')
        .send('{ invalid json }')
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Application Health', () => {
    it('should respond to health check', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });

    it('should handle concurrent requests', async () => {
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app.getHttpServer())
            .post('/player')
            .send({ id: `concurrent${i}` })
        );
      }

      const responses = await Promise.all(requests);
      expect(responses.every(r => r.status === 201)).toBe(true);
    });
  });
});
