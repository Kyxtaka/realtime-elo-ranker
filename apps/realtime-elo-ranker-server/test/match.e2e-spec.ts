/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlayerEntity } from '../src/modules/player/entity/player.entity';

describe('Match E2E Tests', () => {
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
    
    // Create test players
    await request(app.getHttpServer()).post('/player').send({ id: 'alice' });
    await request(app.getHttpServer()).post('/player').send({ id: 'bob' });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /match', () => {
    it('should create a match between two existing players', async () => {
      const response = await request(app.getHttpServer())
        .post('/match')
        .send({
          winner: 'alice',
          loser: 'bob',
          draw: false,
        })
        .expect(200);

      expect(response.body).toHaveProperty('winner');
      expect(response.body).toHaveProperty('loser');
      expect(response.body.winner.id).toBe('alice');
      expect(response.body.loser.id).toBe('bob');
    });

    it('should update winner rank upward', async () => {
      const response = await request(app.getHttpServer())
        .post('/match')
        .send({
          winner: 'alice',
          loser: 'bob',
          draw: false,
        })
        .expect(200);

      expect(response.body.winner.rank).toBeGreaterThan(1000);
    });

    it('should update loser rank downward', async () => {
      const response = await request(app.getHttpServer())
        .post('/match')
        .send({
          winner: 'alice',
          loser: 'bob',
          draw: false,
        })
        .expect(200);

      expect(response.body.loser.rank).toBeLessThan(1000);
    });

    it('should handle draw matches correctly', async () => {
      const response = await request(app.getHttpServer())
        .post('/match')
        .send({
          winner: 'alice',
          loser: 'bob',
          draw: true,
        })
        .expect(200);

      // In a draw with equal ranks, both should adjust slightly
      expect(response.body.winner.rank).toBeDefined();
      expect(response.body.loser.rank).toBeDefined();
    });

    it('should fail when winner does not exist', async () => {
      await request(app.getHttpServer())
        .post('/match')
        .send({
          winner: 'nonexistent',
          loser: 'bob',
          draw: false,
        })
        .expect(500);
    });

    it('should fail when loser does not exist', async () => {
      await request(app.getHttpServer())
        .post('/match')
        .send({
          winner: 'alice',
          loser: 'nonexistent',
          draw: false,
        })
        .expect(500);
    });

    it('should update ranks persistently in database', async () => {
      await request(app.getHttpServer())
        .post('/match')
        .send({
          winner: 'alice',
          loser: 'bob',
          draw: false,
        })
        .expect(200);

      const players = await request(app.getHttpServer())
        .get('/player')
        .expect(200);

      const alice = players.body.find(p => p.id === 'alice');
      const bob = players.body.find(p => p.id === 'bob');

      expect(alice.rank).toBeGreaterThan(1000);
      expect(bob.rank).toBeLessThan(1000);
    });

    it('should handle multiple consecutive matches', async () => {
      await request(app.getHttpServer())
        .post('/match')
        .send({ winner: 'alice', loser: 'bob', draw: false });

      await request(app.getHttpServer())
        .post('/match')
        .send({ winner: 'alice', loser: 'bob', draw: false });

      const response = await request(app.getHttpServer())
        .post('/match')
        .send({ winner: 'alice', loser: 'bob', draw: false })
        .expect(200);

      // Alice should have significantly higher rank after 3 wins
      expect(response.body.winner.rank).toBeGreaterThan(1000);
    });

    it('should calculate ELO correctly based on rank difference', async () => {
      // Set up players with different ranks
      await playerRepository.update({ id: 'alice' }, { rank: 1500 });
      await playerRepository.update({ id: 'bob' }, { rank: 1000 });

      const response = await request(app.getHttpServer())
        .post('/match')
        .send({
          winner: 'bob', // Underdog wins
          loser: 'alice',
          draw: false,
        })
        .expect(200);

      // Underdog should gain more points
      const bobGain = response.body.winner.rank - 1000;
      const aliceLoss = 1500 - response.body.loser.rank;

      expect(bobGain).toBeGreaterThan(16); // Should gain more than average
      expect(aliceLoss).toBeGreaterThan(16); // Should lose more than average
    });
  });
});
