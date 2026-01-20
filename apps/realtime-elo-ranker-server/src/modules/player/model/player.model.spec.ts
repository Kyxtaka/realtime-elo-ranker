/* eslint-disable prettier/prettier */
import { PlayerModel } from './player.model';

describe('PlayerModel', () => {
  describe('constructor', () => {
    it('should create a player with id and rank', () => {
      const player = new PlayerModel('player1', 1000);

      expect(player.getId()).toBe('player1');
      expect(player.getRank()).toBe(1000);
    });

    it('should handle different rank values', () => {
      const player1 = new PlayerModel('player1', 500);
      const player2 = new PlayerModel('player2', 2000);

      expect(player1.getRank()).toBe(500);
      expect(player2.getRank()).toBe(2000);
    });
  });

  describe('getId', () => {
    it('should return the player id', () => {
      const player = new PlayerModel('testPlayer', 1000);

      expect(player.getId()).toBe('testPlayer');
    });
  });

  describe('getRank', () => {
    it('should return the player rank', () => {
      const player = new PlayerModel('player1', 1500);

      expect(player.getRank()).toBe(1500);
    });
  });

  describe('setRank', () => {
    it('should update the player rank', () => {
      const player = new PlayerModel('player1', 1000);

      player.setRank(1200);

      expect(player.getRank()).toBe(1200);
    });

    it('should allow multiple rank updates', () => {
      const player = new PlayerModel('player1', 1000);

      player.setRank(1100);
      expect(player.getRank()).toBe(1100);

      player.setRank(1300);
      expect(player.getRank()).toBe(1300);
    });
  });

  describe('setId', () => {
    it('should update the player id', () => {
      const player = new PlayerModel('player1', 1000);

      player.setId('newPlayer');

      expect(player.getId()).toBe('newPlayer');
    });
  });

  describe('convertToDto', () => {
    it('should convert player to DTO format', () => {
      const player = new PlayerModel('player1', 1200);

      const dto = player.convertToDto();

      expect(dto).toEqual({
        id: 'player1',
        rank: 1200,
      });
    });

    it('should return correct DTO after rank update', () => {
      const player = new PlayerModel('player1', 1000);
      player.setRank(1500);

      const dto = player.convertToDto();

      expect(dto.rank).toBe(1500);
    });
  });
});
