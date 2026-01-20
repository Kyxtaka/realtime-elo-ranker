/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { PlayerController } from './player.controller';
import { PlayerService } from '../service/player.service';
import { PlayerModel } from '../model/player.model';
import { ErrorModel } from '../../error/model/error.model';
import { CreatePlayerDto } from '../dto/createPlayer.dto';
import { PlayerDto } from '../dto/player.dto';
import { CustomHttpException } from '../../../common/exceptions/custom-http.exception';

describe('PlayerController', () => {
  let controller: PlayerController;
  let service: PlayerService;

  const mockPlayerService = {
    getAllPlayers: jest.fn(),
    convertCreateDtoToModel: jest.fn(),
    addPlayer: jest.fn(),
    convertToDto: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerController],
      providers: [
        {
          provide: PlayerService,
          useValue: mockPlayerService,
        },
      ],
    }).compile();

    controller = module.get<PlayerController>(PlayerController);
    service = module.get<PlayerService>(PlayerService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllPlayers', () => {
    it('should return an array of PlayerDto', async () => {
      const player1 = new PlayerModel('player1', 1000);
      const player2 = new PlayerModel('player2', 1200);
      const players = [player1, player2];

      mockPlayerService.getAllPlayers.mockResolvedValue(players);

      const result = await controller.getAllPlayers();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('rank');
      expect(mockPlayerService.getAllPlayers).toHaveBeenCalledTimes(1);
    });

    it('should throw CustomHttpException when service returns ErrorModel', async () => {
      const errorModel = new ErrorModel(404, 'No players found');
      mockPlayerService.getAllPlayers.mockResolvedValue(errorModel);

      await expect(controller.getAllPlayers()).rejects.toThrow(CustomHttpException);
    });
  });

  describe('addPlayer', () => {
    it('should create and return a new player', async () => {
      const createPlayerDto = new CreatePlayerDto();
      createPlayerDto.id = 'newPlayer';

      const playerModel = new PlayerModel('newPlayer', 1000);
      const playerDto = new PlayerDto();
      playerDto.id = 'newPlayer';
      playerDto.rank = 1000;

      mockPlayerService.convertCreateDtoToModel.mockResolvedValue(playerModel);
      mockPlayerService.addPlayer.mockResolvedValue(playerModel);
      mockPlayerService.convertToDto.mockReturnValue(playerDto);

      const result = await controller.addPlayer(createPlayerDto);

      expect(result).toEqual(playerDto);
      expect(mockPlayerService.convertCreateDtoToModel).toHaveBeenCalledWith(createPlayerDto);
      expect(mockPlayerService.addPlayer).toHaveBeenCalledWith(playerModel);
      expect(mockPlayerService.convertToDto).toHaveBeenCalledWith(playerModel);
    });

    it('should throw CustomHttpException when player already exists', async () => {
      const createPlayerDto = new CreatePlayerDto();
      createPlayerDto.id = 'existingPlayer';

      const playerModel = new PlayerModel('existingPlayer', 1000);
      const errorModel = new ErrorModel(409, 'Le joueur existe déjà');

      mockPlayerService.convertCreateDtoToModel.mockResolvedValue(playerModel);
      mockPlayerService.addPlayer.mockResolvedValue(errorModel);

      await expect(controller.addPlayer(createPlayerDto)).rejects.toThrow(CustomHttpException);
    });
  });
});
