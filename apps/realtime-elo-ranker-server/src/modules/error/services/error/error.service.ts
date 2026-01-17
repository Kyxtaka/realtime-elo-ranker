/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ErrorModel } from '../../model/error.model';
import { ErrorDto } from '../../dto/error.dto';

@Injectable()
export class ErrorService {
    createError(code: number, message: string): ErrorModel {
        return new ErrorModel(code, message);
    }

    public static convertToDto(error: ErrorModel): ErrorDto {
        return {
            code: error.code,
            message: error.message,
        };
    }
}
