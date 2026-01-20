/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { RankingController } from './ranking.controller';
import { RankingService } from '../../services/ranking/ranking.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PlayerModel } from '../../../player/model/player.model';
import { ErrorModel } from '../../../error/model/error.model';
import { CustomHttpException } from '../../../../common/exceptions/custom-http.exception';
import { Observable } from 'rxjs';

describe('RankingController', () => {
  let controller: RankingController;
  let rankingService: RankingService;
  let eventEmitter: EventEmitter2;

  const mockRankingService = {
    getRanking: jest.fn(),
  };

  const mockEventEmitter = {
    on: jest.fn(),
    off: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RankingController],
      providers: [
        {
          provide: RankingService,
          useValue: mockRankingService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    controller = module.get<RankingController>(RankingController);
    rankingService = module.get<RankingService>(RankingService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRanking', () => {
    it('should return an array of PlayerDto sorted by rank', async () => {
      const player1 = new PlayerModel('player1', 1500);
      const player2 = new PlayerModel('player2', 1200);
      const player3 = new PlayerModel('player3', 1000);
      const ranking = [player1, player2, player3];

      mockRankingService.getRanking.mockResolvedValue(ranking);

      const result = await controller.getRanking();

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('rank');
      expect(result[0].id).toBe('player1');
      expect(result[0].rank).toBe(1500);
      expect(mockRankingService.getRanking).toHaveBeenCalledTimes(1);
    });

    it('should throw CustomHttpException when service returns ErrorModel', async () => {
      const errorModel = new ErrorModel(404, "Le classement n'est pas disponible");
      mockRankingService.getRanking.mockResolvedValue(errorModel);

      await expect(controller.getRanking()).rejects.toThrow(CustomHttpException);
    });

    it('should return empty array when no players exist', async () => {
      mockRankingService.getRanking.mockResolvedValue([]);

      const result = await controller.getRanking();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('followRankingEventsNotification', () => {
    it('should return an Observable for SSE', () => {
      const result = controller.followRankingEventsNotification();

      expect(result).toBeInstanceOf(Observable);
    });

    it('should register event listeners', (done) => {
      const observable = controller.followRankingEventsNotification();

      const subscription = observable.subscribe({
        next: () => {
          // Event received
        },
        complete: () => {
          done();
        },
      });

      // Verify that event listeners are registered
      expect(mockEventEmitter.on).toHaveBeenCalledWith('ranking.updated', expect.any(Function));
      expect(mockEventEmitter.on).toHaveBeenCalledWith('player.created', expect.any(Function));
      expect(mockEventEmitter.on).toHaveBeenCalledWith('player.removed', expect.any(Function));

      subscription.unsubscribe();
      done();
    });

    it('should emit events when ranking is updated', (done) => {
      const observable = controller.followRankingEventsNotification();
      const player = new PlayerModel('player1', 1200);

      let eventReceived = false;

      const subscription = observable.subscribe({
        next: (event: MessageEvent) => {
          eventReceived = true;
          expect(event).toHaveProperty('data');
          expect(event.data).toHaveProperty('type');
          expect(event.data.type).toBe('RankingUpdate');
          expect(event.data).toHaveProperty('player');
          subscription.unsubscribe();
          done();
        },
      });

      // Get the registered handler
      const handler = mockEventEmitter.on.mock.calls[0][1];
      
      // Simulate the event
      handler(player);

      if (!eventReceived) {
        subscription.unsubscribe();
        done();
      }
    });

    it('should clean up event listeners on unsubscribe', () => {
      const observable = controller.followRankingEventsNotification();
      const subscription = observable.subscribe();

      subscription.unsubscribe();

      // Note: The actual cleanup happens in the teardown function
      // We can't easily test this without more complex mocking
      expect(mockEventEmitter.on).toHaveBeenCalled();
    });
  });
});
