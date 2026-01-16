/* eslint-disable prettier/prettier */
import { Injectable} from '@nestjs/common';
import { PlayerModel } from '../model/player.model';
import { PlayerDto } from '../dto/player.dto';

@Injectable()
export class PlayerService {

    private players: PlayerModel[];

    constructor() {
        this.players = [];
    }

    public addPlayer(player: PlayerModel): void {
        this.players.push(player);
    }

    public getAllPlayers(): PlayerModel[] {
        return this.players;
    }

    public convertToDto(player: PlayerModel) {
        const dto = new PlayerDto();
        dto.id = player.getId()
        dto.rank = player.getRank();
        return dto;
    }

    public convertToModel(dto: PlayerDto) {
        const player = new PlayerModel(dto.id, dto.rank);
        return player;
    }

    public convertCretateDtoToModel(dto: {id: string}): PlayerModel {
        const player = new PlayerModel(dto.id, 0);
        return player;
    }
}
