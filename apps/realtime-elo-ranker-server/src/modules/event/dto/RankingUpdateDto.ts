/* eslint-disable prettier/prettier */
import { PlayerDto } from "../../player/dto/player.dto";

export class RankingUpdateEventDto {
    type: string;
    player: PlayerDto;
}