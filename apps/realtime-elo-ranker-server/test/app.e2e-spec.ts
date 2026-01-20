/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request = require('supertest');
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlayerEntity } from '../src/modules/player/entity/player.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let playerRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    
    playerRepository = moduleFixture.get(getRepositoryToken(PlayerEntity));
    
    await app.init();

    // Clean up database before each test
    await playerRepository.clear();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('Player Module (e2e)', () => {
    describe('POST /player', () => {
      it('should create a new player with default rank', () => {
        return request(app.getHttpServer())
          .post('/player')
          .send({ id: 'player1' })
          .expect(201)
          .then((response) => {
            expect(response.body).toHaveProperty('id', 'player1');
            expect(response.body).toHaveProperty('rank', 1000);
          });
      });

      it('should create multiple players with average rank', async () => {
        // Create first player
        await request(app.getHttpServer())
          .post('/player')
          .send({ id: 'player1' })
          .expect(201);

        // Create second player - should get mean rank
        return request(app.getHttpServer())
          .post('/player')
          .send({ id: 'player2' })
          .expect(201)
          .then((response) => {
            expect(response.body).toHaveProperty('id', 'player2');
            expect(response.body).toHaveProperty('rank', 1000);
          });
      });

      it('should return 409 when player already exists', async () => {
        // Create first player
        await request(app.getHttpServer())
          .post('/player')
          .send({ id: 'player1' })
          .expect(201);

        // Try to create same player again
        return request(app.getHttpServer())
          .post('/player')
          .send({ id: 'player1' })
          .expect(409);
      });
    });

    describe('GET /player', () => {
      it('should return 404 when no players exist', () => {
        return request(app.getHttpServer())
          .get('/player')
          .expect(404);
      });

      it('should return all players', async () => {
        // Create some players
        await request(app.getHttpServer())
          .post('/player')
          .send({ id: 'player1' });

        await request(app.getHttpServer())
          .post('/player')
          .send({ id: 'player2' });

        return request(app.getHttpServer())
          .get('/player')
          .expect(200)
          .then((response) => {
            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toHaveProperty('id');
            expect(response.body[0]).toHaveProperty('rank');
          });
      });
    });
  });

  describe('Match Module (e2e)', () => {
    beforeEach(async () => {
      // Create two players for match tests
      await request(app.getHttpServer())
        .post('/player')
        .send({ id: 'player1' });

      await request(app.getHttpServer())
        .post('/player')
        .send({ id: 'player2' });
    });

    describe('POST /match', () => {
      it('should create a match and update player ranks', async () => {
        const response = await request(app.getHttpServer())
          .post('/match')
          .send({
            winner: 'player1',
            loser: 'player2',
            draw: false,
          })
          .expect(200);

        expect(response.body).toHaveProperty('winner');
        expect(response.body).toHaveProperty('loser');
        expect(response.body.winner.id).toBe('player1');
        expect(response.body.loser.id).toBe('player2');
        
        // Winner should gain points
        expect(response.body.winner.rank).toBeGreaterThan(1000);
        // Loser should lose points
        expect(response.body.loser.rank).toBeLessThan(1000);
      });

      it('should handle draw matches', async () => {
        const response = await request(app.getHttpServer())
          .post('/match')
          .send({
            winner: 'player1',
            loser: 'player2',
            draw: true,
          })
          .expect(200);

        expect(response.body).toHaveProperty('winner');
        expect(response.body).toHaveProperty('loser');
      });

      it('should return error when player does not exist', () => {
        return request(app.getHttpServer())
          .post('/match')
          .send({
            winner: 'nonexistent',
            loser: 'player2',
            draw: false,
          })
          .expect(500);
      });
    });
  });

  describe('Ranking Module (e2e)', () => {
    describe('GET /ranking', () => {
      it('should return 404 when no players exist', () => {
        return request(app.getHttpServer())
          .get('/ranking')
          .expect(404);
      });

      it('should return ranking sorted by rank descending', async () => {
        // Create players
        await request(app.getHttpServer())
          .post('/player')
          .send({ id: 'player1' });

        await request(app.getHttpServer())
          .post('/player')
          .send({ id: 'player2' });

        await request(app.getHttpServer())
          .post('/player')
          .send({ id: 'player3' });

        // Create match to differentiate ranks
        await request(app.getHttpServer())
          .post('/match')
          .send({
            winner: 'player1',
            loser: 'player2',
            draw: false,
          });

        const response = await request(app.getHttpServer())
          .get('/ranking')
          .expect(200);

        expect(response.body).toHaveLength(3);
        // Check that ranking is sorted by rank descending
        for (let i = 0; i < response.body.length - 1; i++) {
          expect(response.body[i].rank).toBeGreaterThanOrEqual(response.body[i + 1].rank);
        }
      });
    });
  });

  describe('Integration Flow (e2e)', () => {
    it('should complete a full game flow: create players, play matches, check ranking', async () => {
      // Step 1: Create players
      await request(app.getHttpServer())
        .post('/player')
        .send({ id: 'alice' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/player')
        .send({ id: 'bob' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/player')
        .send({ id: 'charlie' })
        .expect(201);

      // Step 2: Play some matches
      await request(app.getHttpServer())
        .post('/match')
        .send({ winner: 'alice', loser: 'bob', draw: false })
        .expect(200);

      await request(app.getHttpServer())
        .post('/match')
        .send({ winner: 'alice', loser: 'charlie', draw: false })
        .expect(200);

      await request(app.getHttpServer())
        .post('/match')
        .send({ winner: 'bob', loser: 'charlie', draw: false })
        .expect(200);

      // Step 3: Check final ranking
      const rankingResponse = await request(app.getHttpServer())
        .get('/ranking')
        .expect(200);

      expect(rankingResponse.body).toHaveLength(3);
      
      // Alice should be first (won 2 matches)
      expect(rankingResponse.body[0].id).toBe('alice');
      
      // Check that ranking is properly sorted
      expect(rankingResponse.body[0].rank).toBeGreaterThan(rankingResponse.body[1].rank);
      expect(rankingResponse.body[1].rank).toBeGreaterThan(rankingResponse.body[2].rank);
    });

    it('should handle draw matches correctly in ranking', async () => {
      // Create players
      await request(app.getHttpServer())
        .post('/player')
        .send({ id: 'player1' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/player')
        .send({ id: 'player2' })
        .expect(201);

      // Get initial ranks
      const initialRanking = await request(app.getHttpServer())
        .get('/ranking')
        .expect(200);

      const initialRank1 = initialRanking.body.find(p => p.id === 'player1').rank;
      const initialRank2 = initialRanking.body.find(p => p.id === 'player2').rank;

      // Play a draw
      await request(app.getHttpServer())
        .post('/match')
        .send({ winner: 'player1', loser: 'player2', draw: true })
        .expect(200);

      // Check that ranks changed only slightly
      const finalRanking = await request(app.getHttpServer())
        .get('/ranking')
        .expect(200);

      const finalRank1 = finalRanking.body.find(p => p.id === 'player1').rank;
      const finalRank2 = finalRanking.body.find(p => p.id === 'player2').rank;

      // Both ranks should have changed but not dramatically
      expect(Math.abs(finalRank1 - initialRank1)).toBeLessThan(50);
      expect(Math.abs(finalRank2 - initialRank2)).toBeLessThan(50);
    });
  });
});
