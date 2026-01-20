/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlayerEntity } from '../src/modules/player/entity/player.entity';

describe('Player E2E Tests', () => {
  let app: INestApplication;
  let playerRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    playerRepository = moduleFixture.get(getRepositoryToken(PlayerEntity));
    await app.init();
  });

  beforeEach(async () => {
    await playerRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /player', () => {
    it('should create a player with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/player')
        .send({ id: 'testPlayer' })
        .expect(201);

      expect(response.body).toMatchObject({
        id: 'testPlayer',
        rank: 1000,
      });
    });

    it('should return 409 for duplicate player', async () => {
      await request(app.getHttpServer())
        .post('/player')
        .send({ id: 'duplicate' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/player')
        .send({ id: 'duplicate' })
        .expect(409);
    });

    it('should assign mean rank to new players', async () => {
      // Create first player with rank 1000
      await request(app.getHttpServer())
        .post('/player')
        .send({ id: 'player1' })
        .expect(201);

      // Modify first player's rank manually for testing
      await playerRepository.update({ id: 'player1' }, { rank: 1200 });

      // Create second player - should get mean rank
      const response = await request(app.getHttpServer())
        .post('/player')
        .send({ id: 'player2' })
        .expect(201);

      // Mean of 1200 is 1200
      expect(response.body.rank).toBe(1200);
    });
  });

  describe('GET /player', () => {
    it('should return empty 404 when no players', async () => {
      await request(app.getHttpServer())
        .get('/player')
        .expect(404);
    });

    it('should return all players', async () => {
      await request(app.getHttpServer()).post('/player').send({ id: 'p1' });
      await request(app.getHttpServer()).post('/player').send({ id: 'p2' });
      await request(app.getHttpServer()).post('/player').send({ id: 'p3' });

      const response = await request(app.getHttpServer())
        .get('/player')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body.every(p => p.id && typeof p.rank === 'number')).toBe(true);
    });

    it('should persist players across requests', async () => {
      await request(app.getHttpServer())
        .post('/player')
        .send({ id: 'persistent' })
        .expect(201);

      const response1 = await request(app.getHttpServer()).get('/player').expect(200);
      const response2 = await request(app.getHttpServer()).get('/player').expect(200);

      expect(response1.body).toEqual(response2.body);
    });
  });
});
