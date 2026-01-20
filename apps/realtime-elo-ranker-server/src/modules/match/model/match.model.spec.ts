/* eslint-disable prettier/prettier */
import { MatchModel } from './match.model';
import { PlayerModel } from '../../player/model/player.model';

describe('MatchModel', () => {
  let winner: PlayerModel;
  let loser: PlayerModel;

  beforeEach(() => {
    winner = new PlayerModel('player1', 1000);
    loser = new PlayerModel('player2', 900);
  });

  describe('constructor', () => {
    it('should create a match with winner, loser, and draw status', () => {
      const match = new MatchModel(winner, loser, false);

      expect(match.getWinner()).toBe(winner);
      expect(match.getLoser()).toBe(loser);
      expect(match.isDraw()).toBe(false);
    });

    it('should create a match with draw status true', () => {
      const match = new MatchModel(winner, loser, true);

      expect(match.isDraw()).toBe(true);
    });
  });

  describe('getWinner', () => {
    it('should return the winner player', () => {
      const match = new MatchModel(winner, loser, false);

      const result = match.getWinner();

      expect(result).toBe(winner);
      expect(result.getId()).toBe('player1');
    });
  });

  describe('getLoser', () => {
    it('should return the loser player', () => {
      const match = new MatchModel(winner, loser, false);

      const result = match.getLoser();

      expect(result).toBe(loser);
      expect(result.getId()).toBe('player2');
    });
  });

  describe('isDraw', () => {
    it('should return false for non-draw match', () => {
      const match = new MatchModel(winner, loser, false);

      expect(match.isDraw()).toBe(false);
    });

    it('should return true for draw match', () => {
      const match = new MatchModel(winner, loser, true);

      expect(match.isDraw()).toBe(true);
    });
  });

  describe('convertToDto', () => {
    it('should convert match to DTO format', () => {
      const match = new MatchModel(winner, loser, false);

      const dto = match.convertToDto();

      expect(dto).toHaveProperty('winner');
      expect(dto).toHaveProperty('loser');
      expect(dto.winner.id).toBe('player1');
      expect(dto.winner.rank).toBe(1000);
      expect(dto.loser.id).toBe('player2');
      expect(dto.loser.rank).toBe(900);
    });

    it('should reflect updated player ranks in DTO', () => {
      const match = new MatchModel(winner, loser, false);
      
      winner.setRank(1100);
      loser.setRank(800);

      const dto = match.convertToDto();

      expect(dto.winner.rank).toBe(1100);
      expect(dto.loser.rank).toBe(800);
    });
  });
});
