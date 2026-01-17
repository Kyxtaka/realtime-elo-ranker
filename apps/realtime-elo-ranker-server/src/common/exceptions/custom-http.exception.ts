/* eslint-disable prettier/prettier */
import { HttpException} from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(code: number, message: string) {
    super({ code, message }, code);
  }
}
