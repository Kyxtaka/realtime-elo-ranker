/* eslint-disable prettier/prettier */
import { Injectable, Scope} from '@nestjs/common';
import { PlayerModel } from '../model/player.model';
import { PlayerDto } from '../dto/player.dto';
import { ErrorModel, } from '../../error/model/error.model';
import { ErrorService } from '../../error/services/error/error.service';
import { CreatePlayerDto } from '../dto/createPlayer.dto';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Injectable({scope: Scope.DEFAULT}) // Singleton
export class PlayerService {

    private players: PlayerModel[];
    private playerCount: number = 0;

    constructor(
        private errorService: ErrorService,
        private eventEmitter: EventEmitter2
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
        this.eventEmitter.emit(
            'player.created', player
        );
        return player;
    }

    // // Partira dans ranking service avec pour route @get api/ranking 
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

    public convertCreateDtoToModel(dto: CreatePlayerDto): PlayerModel {
        const meanRank = this.getMeanRank();
        console.log("Mean rank lors de la création du joueur : ", meanRank);
        const player: PlayerModel = new PlayerModel(dto.id, meanRank != 0 ? meanRank : 1000);
        return player;
    }

    public findPlayerById(id: string): PlayerModel | null {
        const player = this.players.find((p: PlayerModel) => p.getId() === id);
        return player ?? null;
    }

    public updatePlayerRank(player: PlayerModel, newRank: number): void {
        player.setRank(newRank);
    }

    public getPlayerCount(): number {
        return this.playerCount;
    }

    public checkIfPlayerExists(id: string): boolean {
        return this.players.some((p: PlayerModel) => p.getId() === id);
    }

    public getMeanRank(): number {
        if (this.players.length === 0) {
            return 0;
        }
        const totalRank = this.players.reduce((sum, player) => sum + player.getRank(), 0);
        return totalRank / this.players.length;
    }

    @OnEvent('player.created') // test event listener
    handlePlayerCreatedEvent(payload: PlayerModel) {
        console.log(`Événement reçu : Joueur créé avec l'ID ${payload.getId()} et le rang ${payload.getRank()}`);
    }

    @OnEvent('ranking.updated') // test event listener
    handleRankingUpdatedEvent(payload: {playerId: string, newRank: number}) {
        console.log(`Événement reçu : Classement mis à jour pour le joueur ${payload.playerId} avec le nouveau rang ${payload.newRank}`);
    }
}