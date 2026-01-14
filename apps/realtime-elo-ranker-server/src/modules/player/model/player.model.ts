/* eslint-disable prettier/prettier */
import { CreatePlayerDto } from '../dto/createPlayer.dto';
import { Player } from '../interfaces/player.interface';

export class PlayerModel implements Player {
    id: string;
    rank?: number;

    constructor(id: string, rank?: number) {
        this.id = id;
        this.rank = rank;
    }

    static fromDto(dto: CreatePlayerDto): PlayerModel {
        return new PlayerModel(dto.id, dto.rank);
    }
}