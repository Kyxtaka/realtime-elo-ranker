/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankingModule } from './ranking.module';
import { RankingService } from './services/ranking/ranking.service';
import { RankingController } from './controller/ranking/ranking.controller';
import { PlayerModule } from '../player/player.module';
import { PlayerEntity } from '../player/entity/player.entity';
import { ErrorService } from '../error/services/error/error.service';
import { PlayerService } from '../player/service/player.service';

describe('RankingModule definition', () => {
  let module: TestingModule;
  let rankingService: RankingService;
  let rankingController: RankingController;
  let errorService: ErrorService;
  let playerService: PlayerService;

  beforeAll(async () => {

    // Mock TypeORM pour les tests
    module = await Test.createTestingModule({
      imports: [
        // Créer une BD en mémoire pour les tests
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [PlayerEntity],
          synchronize: true,
          dropSchema: true,
        }),
        PlayerModule,  // Si RankingModule en dépend
        RankingModule,
      ],
    }).compile();

    await module.init();
    rankingService = module.get<RankingService>(RankingService);
    rankingController = module.get<RankingController>(RankingController);
    errorService = module.get<ErrorService>(ErrorService);
    playerService = module.get<PlayerService>(PlayerService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('Should have RankingService provider defined', () => {
    expect(rankingService).toBeDefined();
  });

  it('Should have RankingController defined', () => {
    expect(rankingController).toBeDefined();
  });
});