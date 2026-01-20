/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlayerEntity } from '../src/modules/player/entity/player.entity';

describe('Ranking E2E Tests', () => {
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

  describe('GET /ranking', () => {
    it('should return 404 when no players exist', async () => {
      await request(app.getHttpServer())
        .get('/ranking')
        .expect(404);
    });

    it('should return ranking sorted by rank descending', async () => {
      // Create players with different ranks
      await playerRepository.save({ id: 'player1', rank: 1000 });
      await playerRepository.save({ id: 'player2', rank: 1500 });
      await playerRepository.save({ id: 'player3', rank: 800 });

      const response = await request(app.getHttpServer())
        .get('/ranking')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0].id).toBe('player2'); // Highest rank
      expect(response.body[0].rank).toBe(1500);
      expect(response.body[1].id).toBe('player1');
      expect(response.body[1].rank).toBe(1000);
      expect(response.body[2].id).toBe('player3'); // Lowest rank
      expect(response.body[2].rank).toBe(800);
    });

    it('should update ranking after matches', async () => {
      await request(app.getHttpServer()).post('/player').send({ id: 'alice' });
      await request(app.getHttpServer()).post('/player').send({ id: 'bob' });
      await request(app.getHttpServer()).post('/player').send({ id: 'charlie' });

      // Alice beats everyone
      await request(app.getHttpServer())
        .post('/match')
        .send({ winner: 'alice', loser: 'bob', draw: false });

      await request(app.getHttpServer())
        .post('/match')
        .send({ winner: 'alice', loser: 'charlie', draw: false });

      const response = await request(app.getHttpServer())
        .get('/ranking')
        .expect(200);

      // Alice should be first
      expect(response.body[0].id).toBe('alice');
    });

    it('should handle ties in ranking', async () => {
      await playerRepository.save({ id: 'player1', rank: 1000 });
      await playerRepository.save({ id: 'player2', rank: 1000 });
      await playerRepository.save({ id: 'player3', rank: 1200 });

      const response = await request(app.getHttpServer())
        .get('/ranking')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0].rank).toBe(1200);
      expect(response.body[1].rank).toBe(1000);
      expect(response.body[2].rank).toBe(1000);
    });

    it('should reflect real-time changes in ranking', async () => {
      await request(app.getHttpServer()).post('/player').send({ id: 'p1' });
      await request(app.getHttpServer()).post('/player').send({ id: 'p2' });

      const rankingBefore = await request(app.getHttpServer())
        .get('/ranking')
        .expect(200);

      await request(app.getHttpServer())
        .post('/match')
        .send({ winner: 'p1', loser: 'p2', draw: false });

      const rankingAfter = await request(app.getHttpServer())
        .get('/ranking')
        .expect(200);

      expect(rankingAfter.body).not.toEqual(rankingBefore.body);
      
      const p1Before = rankingBefore.body.find(p => p.id === 'p1');
      const p1After = rankingAfter.body.find(p => p.id === 'p1');
      
      expect(p1After.rank).toBeGreaterThan(p1Before.rank);
    });

    it('should maintain ranking consistency with multiple players', async () => {
      // Create 5 players
      for (let i = 1; i <= 5; i++) {
        await request(app.getHttpServer())
          .post('/player')
          .send({ id: `player${i}` });
      }

      // Play some matches
      await request(app.getHttpServer())
        .post('/match')
        .send({ winner: 'player1', loser: 'player2', draw: false });

      await request(app.getHttpServer())
        .post('/match')
        .send({ winner: 'player3', loser: 'player4', draw: false });

      const response = await request(app.getHttpServer())
        .get('/ranking')
        .expect(200);

      expect(response.body).toHaveLength(5);
      
      // Verify sorting
      for (let i = 0; i < response.body.length - 1; i++) {
        expect(response.body[i].rank).toBeGreaterThanOrEqual(response.body[i + 1].rank);
      }
    });
  });

  describe('GET /ranking/events (SSE)', () => {
    it('should establish SSE connection', async (done) => {
      const response = request(app.getHttpServer())
        .get('/ranking/events')
        .set('Accept', 'text/event-stream')
        .expect(200)
        .expect('Content-Type', /text\/event-stream/);

      response.on('data', () => {
        // Connection established
        response.abort();
        done();
      });

      // Trigger an event by creating a player
      setTimeout(async () => {
        await request(app.getHttpServer())
          .post('/player')
          .send({ id: 'newPlayer' });
      }, 100);
    }, 10000);
  });
});
