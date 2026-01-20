/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { RankingService } from './ranking.service';
import { ErrorService } from '../../../error/services/error/error.service';
import { PlayerService } from '../../../player/service/player.service';
import { PlayerModel } from '../../../player/model/player.model';
import { ErrorModel } from '../../../error/model/error.model';

describe('RankingService', () => {
  let service: RankingService;
  let errorService: ErrorService;
  let playerService: PlayerService;

  const mockErrorService = {
    createError: jest.fn((code: number, message: string) => new ErrorModel(code, message)),
  };

  const mockPlayerService = {
    getAllPlayers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingService,
        {
          provide: ErrorService,
          useValue: mockErrorService,
        },
        {
          provide: PlayerService,
          useValue: mockPlayerService,
        },
      ],
    }).compile();

    service = module.get<RankingService>(RankingService);
    errorService = module.get<ErrorService>(ErrorService);
    playerService = module.get<PlayerService>(PlayerService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRanking', () => {
    it('should return sorted ranking by rank descending', async () => {
      const player1 = new PlayerModel('player1', 1000);
      const player2 = new PlayerModel('player2', 1500);
      const player3 = new PlayerModel('player3', 800);
      const players = [player1, player2, player3];

      mockPlayerService.getAllPlayers.mockResolvedValue(players);

      const result = await service.getRanking();

      expect(result).toBeInstanceOf(Array);
      expect((result as PlayerModel[])).toHaveLength(3);
      // Should be sorted by rank descending
      expect((result as PlayerModel[])[0].getRank()).toBe(1500);
      expect((result as PlayerModel[])[1].getRank()).toBe(1000);
      expect((result as PlayerModel[])[2].getRank()).toBe(800);
      expect((result as PlayerModel[])[0].getId()).toBe('player2');
      expect((result as PlayerModel[])[1].getId()).toBe('player1');
      expect((result as PlayerModel[])[2].getId()).toBe('player3');
    });

    it('should return ErrorModel when no players exist', async () => {
      mockPlayerService.getAllPlayers.mockResolvedValue(new ErrorModel(404, 'No players found'));

      const result = await service.getRanking();

      expect(result).toBeInstanceOf(ErrorModel);
      expect((result as ErrorModel).getCode()).toBe(404);
      expect((result as ErrorModel).getMessage()).toBe("Le classement n'est pas disponible car aucun joueur n'existe");
    });

    it('should cache ranking after first call', async () => {
      const player1 = new PlayerModel('player1', 1000);
      const player2 = new PlayerModel('player2', 1200);
      const players = [player1, player2];

      mockPlayerService.getAllPlayers.mockResolvedValue(players);

      // First call
      const result1 = await service.getRanking();
      // Second call
      const result2 = await service.getRanking();

      expect(result1).toEqual(result2);
      expect(mockPlayerService.getAllPlayers).toHaveBeenCalledTimes(2);
    });

    it('should handle single player correctly', async () => {
      const player1 = new PlayerModel('player1', 1000);
      mockPlayerService.getAllPlayers.mockResolvedValue([player1]);

      const result = await service.getRanking();

      expect(result).toBeInstanceOf(Array);
      expect((result as PlayerModel[])).toHaveLength(1);
      expect((result as PlayerModel[])[0].getId()).toBe('player1');
    });

    it('should handle players with same rank', async () => {
      const player1 = new PlayerModel('player1', 1000);
      const player2 = new PlayerModel('player2', 1000);
      const player3 = new PlayerModel('player3', 1200);
      const players = [player1, player2, player3];

      mockPlayerService.getAllPlayers.mockResolvedValue(players);

      const result = await service.getRanking();

      expect(result).toBeInstanceOf(Array);
      expect((result as PlayerModel[])).toHaveLength(3);
      expect((result as PlayerModel[])[0].getRank()).toBe(1200);
      expect((result as PlayerModel[])[1].getRank()).toBe(1000);
      expect((result as PlayerModel[])[2].getRank()).toBe(1000);
    });
  });
});
