/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { MatchService } from './match.service';
import { PlayerService } from '../../../player/service/player.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateMatchDto } from '../../dto/createMatch.dto';
import { PlayerModel } from '../../../player/model/player.model';
import { MatchModel } from '../../model/match.model';

describe('MatchService', () => {
  let service: MatchService;
  let playerService: PlayerService;
  let eventEmitter: EventEmitter2;

  const mockPlayerService = {
    findPlayerByIdInDB: jest.fn(),
    updatePlayerRankInDb: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        {
          provide: PlayerService,
          useValue: mockPlayerService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
    playerService = module.get<PlayerService>(PlayerService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('convertToModel', () => {
    it('should convert CreateMatchDto to MatchModel successfully', async () => {
      const dto = new CreateMatchDto();
      dto.winner = 'player1';
      dto.loser = 'player2';
      dto.draw = false;

      const winner = new PlayerModel('player1', 1000);
      const loser = new PlayerModel('player2', 900);

      mockPlayerService.findPlayerByIdInDB
        .mockResolvedValueOnce(winner)
        .mockResolvedValueOnce(loser);

      const result = await service.convertToModel(dto);

      expect(result).toBeInstanceOf(MatchModel);
      expect(result?.getWinner().getId()).toBe('player1');
      expect(result?.getLoser().getId()).toBe('player2');
      expect(result?.isDraw()).toBe(false);
    });

    it('should return null when winner does not exist', async () => {
      const dto = new CreateMatchDto();
      dto.winner = 'nonexistent';
      dto.loser = 'player2';
      dto.draw = false;

      mockPlayerService.findPlayerByIdInDB.mockResolvedValue(null);

      const result = await service.convertToModel(dto);

      expect(result).toBeNull();
    });

    it('should return null when loser does not exist', async () => {
      const dto = new CreateMatchDto();
      dto.winner = 'player1';
      dto.loser = 'nonexistent';
      dto.draw = false;

      const winner = new PlayerModel('player1', 1000);
      mockPlayerService.findPlayerByIdInDB
        .mockResolvedValueOnce(winner)
        .mockResolvedValueOnce(null);

      const result = await service.convertToModel(dto);

      expect(result).toBeNull();
    });
  });

  describe('getMatchResultCoef', () => {
    it('should return 1 when player is winner and not a draw', () => {
      const winner = new PlayerModel('player1', 1000);
      const loser = new PlayerModel('player2', 900);
      const match = new MatchModel(winner, loser, false);

      const result = service.getMatchResultCoef(match, winner);

      expect(result).toBe(1);
    });

    it('should return 0 when player is loser and not a draw', () => {
      const winner = new PlayerModel('player1', 1000);
      const loser = new PlayerModel('player2', 900);
      const match = new MatchModel(winner, loser, false);

      const result = service.getMatchResultCoef(match, loser);

      expect(result).toBe(0);
    });

    it('should return 0.5 when match is a draw', () => {
      const winner = new PlayerModel('player1', 1000);
      const loser = new PlayerModel('player2', 900);
      const match = new MatchModel(winner, loser, true);

      const result = service.getMatchResultCoef(match, winner);

      expect(result).toBe(0.5);
    });
  });

  describe('calculatePlayerWinProbality', () => {
    it('should calculate win probability correctly for better player', () => {
      const bestPlayer = new PlayerModel('player1', 1200);
      const worstPlayer = new PlayerModel('player2', 1000);

      const result = service.calculatePlayerWinProbality(bestPlayer, worstPlayer);

      // Expected probability formula: 1 - (1 / (1 + 10^(200/400)))
      // = 1 - (1 / (1 + 10^0.5)) = 1 - (1 / (1 + 3.162...)) ≈ 0.76
      expect(result).toBeGreaterThan(0.7);
      expect(result).toBeLessThan(0.8);
    });

    it('should calculate win probability correctly for worse player', () => {
      const bestPlayer = new PlayerModel('player1', 1200);
      const worstPlayer = new PlayerModel('player2', 1000);

      const result = service.calculatePlayerWinProbality(worstPlayer, bestPlayer);

      expect(result).toBeGreaterThan(0.2);
      expect(result).toBeLessThan(0.3);
    });

    it('should return 0.5 for equally ranked players', () => {
      const player1 = new PlayerModel('player1', 1000);
      const player2 = new PlayerModel('player2', 1000);

      const result = service.calculatePlayerWinProbality(player1, player2);

      expect(result).toBe(0.5);
    });
  });

  describe('updatePlayerRanks', () => {
    it('should update both players ranks correctly after a match', async () => {
      const winner = new PlayerModel('player1', 1000);
      const loser = new PlayerModel('player2', 1000);
      const match = new MatchModel(winner, loser, false);

      mockPlayerService.updatePlayerRankInDb.mockResolvedValue(undefined);

      await service.updatePlayerRanks(match);

      expect(mockPlayerService.updatePlayerRankInDb).toHaveBeenCalledTimes(2);
      expect(mockEventEmitter.emit).toHaveBeenCalledTimes(2);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('ranking.updated', winner);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('ranking.updated', loser);
      
      // Winner should gain points, loser should lose points
      expect(winner.getRank()).toBeGreaterThan(1000);
      expect(loser.getRank()).toBeLessThan(1000);
    });

    it('should update ranks correctly for a draw', async () => {
      const winner = new PlayerModel('player1', 1200);
      const loser = new PlayerModel('player2', 1000);
      const match = new MatchModel(winner, loser, true);

      const initialWinnerRank = winner.getRank();
      const initialLoserRank = loser.getRank();

      mockPlayerService.updatePlayerRankInDb.mockResolvedValue(undefined);

      await service.updatePlayerRanks(match);

      // In a draw, better player should lose points, worse player should gain points
      expect(winner.getRank()).toBeLessThan(initialWinnerRank);
      expect(loser.getRank()).toBeGreaterThan(initialLoserRank);
    });
  });

  describe('addMatchToHistory', () => {
    it('should add match to history', () => {
      const winner = new PlayerModel('player1', 1000);
      const loser = new PlayerModel('player2', 900);
      const match = new MatchModel(winner, loser, false);

      // Use spy to track console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      service.addMatchToHistory(match);

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('declareNewMatch', () => {
    it('should declare a new match and update ranks', async () => {
      const winner = new PlayerModel('player1', 1000);
      const loser = new PlayerModel('player2', 1000);
      const match = new MatchModel(winner, loser, false);

      mockPlayerService.updatePlayerRankInDb.mockResolvedValue(undefined);

      const result = await service.declareNewMatch(match);

      expect(result).toBe(match);
      expect(mockPlayerService.updatePlayerRankInDb).toHaveBeenCalledTimes(2);
      expect(mockEventEmitter.emit).toHaveBeenCalledTimes(2);
    });
  });

  describe('convertToDto', () => {
    it('should convert MatchModel to MatchResultDto', () => {
      const winner = new PlayerModel('player1', 1000);
      const loser = new PlayerModel('player2', 900);
      const match = new MatchModel(winner, loser, false);

      const result = service.convertToDto(match);

      expect(result).toHaveProperty('winner');
      expect(result).toHaveProperty('loser');
      expect(result.winner.id).toBe('player1');
      expect(result.loser.id).toBe('player2');
    });
  });
});
