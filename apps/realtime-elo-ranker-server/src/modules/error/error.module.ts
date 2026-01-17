/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ErrorService } from './services/error/error.service';
// import { ErrorModel } from './model/error.model';
// import { ErrorDto } from './dto/error.dto';

@Module({
  providers: [ErrorService],
  exports: [ErrorService],
})
export class ErrorModule {}
