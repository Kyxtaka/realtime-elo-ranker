/* eslint-disable prettier/prettier */
import { Injectable, Scope} from '@nestjs/common';
import { PlayerModel } from '../model/player.model';
import { PlayerDto } from '../dto/player.dto';
import { ErrorModel, } from '../../error/model/error.model';
import { ErrorService } from '../../error/services/error/error.service';
import { CreatePlayerDto } from '../dto/createPlayer.dto';

@Injectable({scope: Scope.DEFAULT}) // Singleton
export class PlayerService {

    private players: PlayerModel[];
    private playerCount: number = 0;

    constructor(
        private errorService: ErrorService,
    ) {
        this.players = [];
    }

    public addPlayer(player: PlayerModel): PlayerModel | ErrorModel {
        const existingPlayer = this.players.find((p: PlayerModel) => p.getId() === player.getId());
        if (existingPlayer) {
            return this.errorService.createError(409, 'Le joueur existe déjà');
        }
        this.players.push(player);
        this.playerCount++;
        return player;
    }

    // Partira dans ranking service avec pour route @get api/ranking 
    public getAllPlayers(): PlayerModel[] | ErrorModel {
        if (this.players.length === 0) {
            return this.errorService.createError(404, "Il y a aucun joueur d'enregistré");
        }
        return this.players;
    }

    public convertToDto(player: PlayerModel): PlayerDto {
        const dto: PlayerDto = new PlayerDto();
        dto.id = player.getId()
        dto.rank = player.getRank();
        return dto;
    }

    public convertToModel(dto: PlayerDto): PlayerModel {
        const player = new PlayerModel(dto.id, dto.rank);
        return player;
    }

    public convertCretateDtoToModel(dto: CreatePlayerDto): PlayerModel {
        const player: PlayerModel = new PlayerModel(dto.id);
        return player;
    }

    public getPlayerCount(): number {
        return this.playerCount;
    }
}
