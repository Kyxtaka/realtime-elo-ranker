/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { PlayerService } from './player.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlayerEntity } from '../entity/player.entity';
import { Repository } from 'typeorm';
import { ErrorService } from '../../error/services/error/error.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PlayerModel } from '../model/player.model';
import { ErrorModel } from '../../error/model/error.model';
import { CreatePlayerDto } from '../dto/createPlayer.dto';
import { PlayerDto } from '../dto/player.dto';

describe('PlayerService', () => {
  let service: PlayerService;
  let repository: Repository<PlayerEntity>;
  let errorService: ErrorService;
  let eventEmitter: EventEmitter2;

  const mockPlayerEntity: PlayerEntity = {
    id: 'player1',
    rank: 1000,
  };

  const mockPlayerEntity2: PlayerEntity = {
    id: 'player2',
    rank: 1200,
  };

  const mockRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
  };

  const mockErrorService = {
    createError: jest.fn((code: number, message: string) => new ErrorModel(code, message)),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerService,
        {
          provide: getRepositoryToken(PlayerEntity),
          useValue: mockRepository,
        },
        {
          provide: ErrorService,
          useValue: mockErrorService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<PlayerService>(PlayerService);
    repository = module.get<Repository<PlayerEntity>>(getRepositoryToken(PlayerEntity));
    errorService = module.get<ErrorService>(ErrorService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllPlayersFromDB', () => {
    it('should return an array of PlayerModel when players exist', async () => {
      mockRepository.find.mockResolvedValue([mockPlayerEntity, mockPlayerEntity2]);

      const result = await service.findAllPlayersFromDB();

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(2);
      expect((result as PlayerModel[])[0]).toBeInstanceOf(PlayerModel);
      expect((result as PlayerModel[])[0].getId()).toBe('player1');
      expect((result as PlayerModel[])[0].getRank()).toBe(1000);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return ErrorModel when no players exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAllPlayersFromDB();

      expect(result).toBeInstanceOf(ErrorModel);
      expect((result as ErrorModel).getCode()).toBe(404);
      expect((result as ErrorModel).getMessage()).toBe("Il y a aucun joueur d'enregistré dans la base de données");
    });
  });

  describe('savePlayerToDB', () => {
    it('should save a player successfully', async () => {
      const player = new PlayerModel('player1', 1000);
      mockRepository.save.mockResolvedValue(mockPlayerEntity);

      const result = await service.savePlayerToDB(player);

      expect(result).toBeInstanceOf(PlayerModel);
      expect((result as PlayerModel).getId()).toBe('player1');
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        id: 'player1',
        rank: 1000,
      }));
    });

    it('should return ErrorModel when save fails', async () => {
      const player = new PlayerModel('player1', 1000);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      const result = await service.savePlayerToDB(player);

      expect(result).toBeInstanceOf(ErrorModel);
      expect((result as ErrorModel).getCode()).toBe(500);
    });
  });

  describe('findPlayerByIdInDB', () => {
    it('should return a PlayerModel when player exists', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockPlayerEntity);

      const result = await service.findPlayerByIdInDB('player1');

      expect(result).toBeInstanceOf(PlayerModel);
      expect(result?.getId()).toBe('player1');
      expect(result?.getRank()).toBe(1000);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 'player1' });
    });

    it('should return null when player does not exist', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findPlayerByIdInDB('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('addPlayer', () => {
    it('should add a new player successfully', async () => {
      const player = new PlayerModel('player1', 1000);
      mockRepository.findOneBy.mockResolvedValue(null);
      mockRepository.save.mockResolvedValue(mockPlayerEntity);

      const result = await service.addPlayer(player);

      expect(result).toBeInstanceOf(PlayerModel);
      expect((result as PlayerModel).getId()).toBe('player1');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('player.created', player);
    });

    it('should return ErrorModel when player already exists', async () => {
      const player = new PlayerModel('player1', 1000);
      mockRepository.findOneBy.mockResolvedValue(mockPlayerEntity);

      const result = await service.addPlayer(player);

      expect(result).toBeInstanceOf(ErrorModel);
      expect((result as ErrorModel).getCode()).toBe(409);
      expect((result as ErrorModel).getMessage()).toBe('Le joueur existe déjà');
    });
  });

  describe('getAllPlayers', () => {
    it('should return all players', async () => {
      mockRepository.find.mockResolvedValue([mockPlayerEntity, mockPlayerEntity2]);

      const result = await service.getAllPlayers();

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(2);
    });

    it('should return ErrorModel when no players exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.getAllPlayers();

      expect(result).toBeInstanceOf(ErrorModel);
      expect((result as ErrorModel).getCode()).toBe(404);
    });
  });

  describe('convertToDto', () => {
    it('should convert PlayerModel to PlayerDto', () => {
      const player = new PlayerModel('player1', 1000);

      const result = service.convertToDto(player);

      expect(result).toBeInstanceOf(PlayerDto);
      expect(result.id).toBe('player1');
      expect(result.rank).toBe(1000);
    });
  });

  describe('convertToModel', () => {
    it('should convert PlayerDto to PlayerModel', () => {
      const dto = new PlayerDto();
      dto.id = 'player1';
      dto.rank = 1000;

      const result = service.convertToModel(dto);

      expect(result).toBeInstanceOf(PlayerModel);
      expect(result.getId()).toBe('player1');
      expect(result.getRank()).toBe(1000);
    });
  });

  describe('convertCreateDtoToModel', () => {
    it('should convert CreatePlayerDto to PlayerModel with mean rank', async () => {
      mockRepository.find.mockResolvedValue([mockPlayerEntity, mockPlayerEntity2]);
      const dto = new CreatePlayerDto();
      dto.id = 'player3';

      const result = await service.convertCreateDtoToModel(dto);

      expect(result).toBeInstanceOf(PlayerModel);
      expect(result.getId()).toBe('player3');
      expect(result.getRank()).toBe(1100); // (1000 + 1200) / 2
    });

    it('should use default rank 1000 when no players exist', async () => {
      mockRepository.find.mockResolvedValue([]);
      const dto = new CreatePlayerDto();
      dto.id = 'player1';

      const result = await service.convertCreateDtoToModel(dto);

      expect(result).toBeInstanceOf(PlayerModel);
      expect(result.getRank()).toBe(1000);
    });
  });

  describe('updatePlayerRankInDb', () => {
    it('should update player rank in database', async () => {
      const player = new PlayerModel('player1', 1000);
      mockRepository.save.mockResolvedValue(mockPlayerEntity);

      await service.updatePlayerRankInDb(player, 1200);

      expect(player.getRank()).toBe(1200);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('getPlayerCount', () => {
    it('should return the count of players', async () => {
      mockRepository.find.mockResolvedValue([mockPlayerEntity, mockPlayerEntity2]);

      const result = await service.getPlayerCount();

      expect(result).toBe(2);
    });

    it('should return 0 when error occurs', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.getPlayerCount();

      expect(result).toBe(0);
    });
  });

  describe('checkIfPlayerExists', () => {
    it('should return true when player exists', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockPlayerEntity);

      const result = await service.checkIfPlayerExists('player1');

      expect(result).toBe(true);
    });

    it('should return undefined when player does not exist', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await service.checkIfPlayerExists('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('getMeanRank', () => {
    it('should calculate mean rank correctly', async () => {
      mockRepository.find.mockResolvedValue([mockPlayerEntity, mockPlayerEntity2]);

      const result = await service.getMeanRank();

      expect(result).toBe(1100); // (1000 + 1200) / 2
    });

    it('should return 0 when no players exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.getMeanRank();

      expect(result).toBe(0);
    });
  });
});
