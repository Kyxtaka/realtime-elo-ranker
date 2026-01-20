/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { MatchController } from './match.controller';
import { MatchService } from '../../services/match/match.service';
import { ErrorService } from '../../../error/services/error/error.service';
import { CreateMatchDto } from '../../dto/createMatch.dto';
import { MatchModel } from '../../model/match.model';
import { PlayerModel } from '../../../player/model/player.model';
import { ErrorModel } from '../../../error/model/error.model';
import { CustomHttpException } from '../../../../common/exceptions/custom-http.exception';

describe('MatchController', () => {
  let controller: MatchController;
  let matchService: MatchService;
  let errorService: ErrorService;

  const mockMatchService = {
    convertToModel: jest.fn(),
    declareNewMatch: jest.fn(),
    convertToDto: jest.fn(),
  };

  const mockErrorService = {
    createError: jest.fn((code: number, message: string) => new ErrorModel(code, message)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchController],
      providers: [
        {
          provide: MatchService,
          useValue: mockMatchService,
        },
        {
          provide: ErrorService,
          useValue: mockErrorService,
        },
      ],
    }).compile();

    controller = module.get<MatchController>(MatchController);
    matchService = module.get<MatchService>(MatchService);
    errorService = module.get<ErrorService>(ErrorService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createMatch', () => {
    it('should create a match successfully', async () => {
      const createMatchDto = new CreateMatchDto();
      createMatchDto.winner = 'player1';
      createMatchDto.loser = 'player2';
      createMatchDto.draw = false;

      const winner = new PlayerModel('player1', 1000);
      const loser = new PlayerModel('player2', 900);
      const match = new MatchModel(winner, loser, false);

      const matchResultDto = {
        winner: { id: 'player1', rank: 1016 },
        loser: { id: 'player2', rank: 884 },
      };

      mockMatchService.convertToModel.mockResolvedValue(match);
      mockMatchService.declareNewMatch.mockResolvedValue(match);
      mockMatchService.convertToDto.mockReturnValue(matchResultDto);

      const result = await controller.createMatch(createMatchDto);

      expect(result).toEqual(matchResultDto);
      expect(mockMatchService.convertToModel).toHaveBeenCalledWith(createMatchDto);
      expect(mockMatchService.declareNewMatch).toHaveBeenCalledWith(match);
      expect(mockMatchService.convertToDto).toHaveBeenCalledWith(match);
    });

    it('should throw CustomHttpException when match conversion fails', async () => {
      const createMatchDto = new CreateMatchDto();
      createMatchDto.winner = 'player1';
      createMatchDto.loser = 'player2';
      createMatchDto.draw = false;

      mockMatchService.convertToModel.mockResolvedValue(null);

      await expect(controller.createMatch(createMatchDto)).rejects.toThrow(CustomHttpException);
      expect(mockErrorService.createError).toHaveBeenCalledWith(500, 'Erreur lors de la déclaration du match.');
    });

    it('should throw CustomHttpException when player does not exist', async () => {
      const createMatchDto = new CreateMatchDto();
      createMatchDto.winner = 'nonexistent';
      createMatchDto.loser = 'player2';
      createMatchDto.draw = false;

      mockMatchService.convertToModel.mockResolvedValue(null);

      await expect(controller.createMatch(createMatchDto)).rejects.toThrow(CustomHttpException);
    });
  });
});
