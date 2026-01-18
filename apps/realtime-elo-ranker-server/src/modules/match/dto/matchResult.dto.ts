/* eslint-disable prettier/prettier */
import { PlayerDto } from "../../player/dto/player.dto";

export class MatchResultDto {
    winner: PlayerDto;
    loser: PlayerDto;
}