/* eslint-disable prettier/prettier */
import { validate } from 'class-validator';
import { CreatePlayerDto } from './createPlayer.dto';

describe('CreatePlayerDto Validation', () => {
  it('should validate a valid player id', async () => {
    const dto = new CreatePlayerDto();
    dto.id = 'validPlayer123';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject empty id', async () => {
    const dto = new CreatePlayerDto();
    dto.id = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject id with invalid characters', async () => {
    const dto = new CreatePlayerDto();
    dto.id = 'invalid@player#123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject id shorter than 3 characters', async () => {
    const dto = new CreatePlayerDto();
    dto.id = 'ab';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject id longer than 30 characters', async () => {
    const dto = new CreatePlayerDto();
    dto.id = 'a'.repeat(31);

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should accept valid id with hyphens and underscores', async () => {
    const dto = new CreatePlayerDto();
    dto.id = 'valid-player_123';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should accept valid id with only letters', async () => {
    const dto = new CreatePlayerDto();
    dto.id = 'ValidPlayer';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should accept valid id with only numbers', async () => {
    const dto = new CreatePlayerDto();
    dto.id = '12345678';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
