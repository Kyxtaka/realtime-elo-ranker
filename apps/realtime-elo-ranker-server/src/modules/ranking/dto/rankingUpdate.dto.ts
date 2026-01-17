/* eslint-disable prettier/prettier */
import { PlayerDto } from "../../player/dto/player.dto";

export class RankingEventDto implements RankingEventDto {
    type: string;
    player: PlayerDto;
}