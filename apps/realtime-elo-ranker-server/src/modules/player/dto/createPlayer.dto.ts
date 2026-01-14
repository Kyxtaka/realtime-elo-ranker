/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreatePlayerDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsNumber()
    @IsOptional()
    rank?: number;
}