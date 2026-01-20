/* eslint-disable prettier/prettier */
import { validate } from 'class-validator';
import { CreateMatchDto } from './createMatch.dto';

describe('CreateMatchDto Validation', () => {
  it('should validate a valid match dto', async () => {
    const dto = new CreateMatchDto();
    dto.winner = 'player1';
    dto.loser = 'player2';
    dto.draw = false;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject missing winner', async () => {
    const dto = new CreateMatchDto();
    dto.loser = 'player2';
    dto.draw = false;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject missing loser', async () => {
    const dto = new CreateMatchDto();
    dto.winner = 'player1';
    dto.draw = false;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject missing draw status', async () => {
    const dto = new CreateMatchDto();
    dto.winner = 'player1';
    dto.loser = 'player2';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject non-boolean draw value', async () => {
    const dto = new CreateMatchDto();
    dto.winner = 'player1';
    dto.loser = 'player2';
    dto.draw = 'false' as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should accept draw true', async () => {
    const dto = new CreateMatchDto();
    dto.winner = 'player1';
    dto.loser = 'player2';
    dto.draw = true;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject invalid player id format in winner', async () => {
    const dto = new CreateMatchDto();
    dto.winner = 'invalid@player';
    dto.loser = 'player2';
    dto.draw = false;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject too short player id', async () => {
    const dto = new CreateMatchDto();
    dto.winner = 'ab';
    dto.loser = 'player2';
    dto.draw = false;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should accept valid match with hyphens and underscores', async () => {
    const dto = new CreateMatchDto();
    dto.winner = 'player-1_test';
    dto.loser = 'player-2_test';
    dto.draw = false;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
