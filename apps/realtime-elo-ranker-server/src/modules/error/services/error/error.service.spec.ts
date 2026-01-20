/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { ErrorService } from './error.service';
import { ErrorModel } from '../../model/error.model';
import { ErrorDto } from '../../dto/error.dto';

describe('ErrorService', () => {
  let service: ErrorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorService],
    }).compile();

    service = module.get<ErrorService>(ErrorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createError', () => {
    it('should create an ErrorModel with code and message', () => {
      const code = 404;
      const message = 'Not Found';

      const result = service.createError(code, message);

      expect(result).toBeInstanceOf(ErrorModel);
      expect(result.getCode()).toBe(404);
      expect(result.getMessage()).toBe('Not Found');
    });

    it('should create different error codes', () => {
      const error400 = service.createError(400, 'Bad Request');
      const error500 = service.createError(500, 'Internal Server Error');
      const error409 = service.createError(409, 'Conflict');

      expect(error400.getCode()).toBe(400);
      expect(error500.getCode()).toBe(500);
      expect(error409.getCode()).toBe(409);
    });

    it('should preserve error messages', () => {
      const message = 'Custom error message';
      const result = service.createError(500, message);

      expect(result.getMessage()).toBe(message);
    });
  });

  describe('convertToDto', () => {
    it('should convert ErrorModel to ErrorDto', () => {
      const errorModel = new ErrorModel(404, 'Not Found');

      const result = ErrorService.convertToDto(errorModel);

      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('message');
      expect(result.code).toBe(404);
      expect(result.message).toBe('Not Found');
    });

    it('should handle different error codes in conversion', () => {
      const error1 = new ErrorModel(400, 'Bad Request');
      const error2 = new ErrorModel(500, 'Server Error');

      const dto1 = ErrorService.convertToDto(error1);
      const dto2 = ErrorService.convertToDto(error2);

      expect(dto1.code).toBe(400);
      expect(dto1.message).toBe('Bad Request');
      expect(dto2.code).toBe(500);
      expect(dto2.message).toBe('Server Error');
    });
  });
});
