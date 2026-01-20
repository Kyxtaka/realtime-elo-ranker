/* eslint-disable prettier/prettier */
import { ErrorModel } from './error.model';

describe('ErrorModel', () => {
  describe('constructor', () => {
    it('should create an error with code and message', () => {
      const error = new ErrorModel(404, 'Not Found');

      expect(error.getCode()).toBe(404);
      expect(error.getMessage()).toBe('Not Found');
    });

    it('should handle different error codes', () => {
      const error400 = new ErrorModel(400, 'Bad Request');
      const error500 = new ErrorModel(500, 'Internal Server Error');

      expect(error400.getCode()).toBe(400);
      expect(error500.getCode()).toBe(500);
    });
  });

  describe('getError', () => {
    it('should return an object with code and message', () => {
      const error = new ErrorModel(404, 'Not Found');

      const result = error.getError();

      expect(result).toEqual({
        code: 404,
        message: 'Not Found',
      });
    });

    it('should return correct error object for different errors', () => {
      const error1 = new ErrorModel(409, 'Conflict');
      const error2 = new ErrorModel(500, 'Server Error');

      expect(error1.getError()).toEqual({ code: 409, message: 'Conflict' });
      expect(error2.getError()).toEqual({ code: 500, message: 'Server Error' });
    });
  });

  describe('getCode', () => {
    it('should return the error code', () => {
      const error = new ErrorModel(403, 'Forbidden');

      expect(error.getCode()).toBe(403);
    });
  });

  describe('getMessage', () => {
    it('should return the error message', () => {
      const error = new ErrorModel(400, 'Invalid Input');

      expect(error.getMessage()).toBe('Invalid Input');
    });
  });
});
