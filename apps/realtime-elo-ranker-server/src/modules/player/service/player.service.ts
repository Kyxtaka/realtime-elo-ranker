/* eslint-disable prettier/prettier */
import { Injectable, Scope} from '@nestjs/common';
import { PlayerModel } from '../model/player.model';
import { PlayerDto } from '../dto/player.dto';
import { ErrorModel, } from '../../error/model/error.model';
import { ErrorService } from '../../error/services/error/error.service';
import { CreatePlayerDto } from '../dto/createPlayer.dto';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import  { PlayerEntity } from '../entity/player.entity';
import { Repository } from 'typeorm/repository/Repository';
import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';

@Injectable({scope: Scope.DEFAULT}) // Singleton
export class PlayerService {

    // private players: PlayerModel[];
    private playerCount: number = 0;

    constructor(
        @InjectRepository(PlayerEntity)
        private playerRepository: Repository<PlayerEntity>,

        private errorService: ErrorService,
        private eventEmitter: EventEmitter2
    ) {
        // this.players = [];
    }

    async findAllPlayersFromDB(): Promise<PlayerModel[] | ErrorModel> {
        const playerEntities: PlayerEntity[] = await this.playerRepository.find();
        if (playerEntities.length === 0) {
            return this.errorService.createError(404, "Il y a aucun joueur d'enregistré dans la base de données");
        }
        const players: PlayerModel[] = playerEntities.map((entity: PlayerEntity) => {
            return new PlayerModel(entity.id, entity.rank);
        });
        return players;
    }

    async savePlayerToDB(player: PlayerModel): Promise<PlayerModel | ErrorModel> {
        const playerEntity = new PlayerEntity();
        playerEntity.id = player.getId();
        playerEntity.rank = player.getRank();
        try {
            await this.playerRepository.save(playerEntity);
            return player;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du joueur dans la base de données : ', error);
            return this.errorService.createError(500, "Erreur lors de l'enregistrement du joueur dans la base de données");
        }
    }

    async findPlayerByIdInDB(id: string): Promise<PlayerModel | null> {
        const playerEntity = await this.playerRepository.findOneBy({id});
        if (!playerEntity) {
            return null;
        }
        return new PlayerModel(playerEntity.id, playerEntity.rank);
    }

    // public addPlayer(player: PlayerModel): PlayerModel | ErrorModel {
    //     const existingPlayer = this.players.find((p: PlayerModel) => p.getId() === player.getId());
    //     if (existingPlayer) {
    //         return this.errorService.createError(409, 'Le joueur existe déjà');
    //     }
    //     this.players.push(player);
    //     this.playerCount++;
    //     this.eventEmitter.emit(
    //         'player.created', player
    //     );
    //     return player;
    // }

    public async addPlayer(player: PlayerModel): Promise<PlayerModel | ErrorModel> {
        const existingPlayer = await this.findPlayerByIdInDB(player.getId());
        if (existingPlayer) {
            return this.errorService.createError(409, 'Le joueur existe déjà');
        }
        // this.players.push(player);
        await this.savePlayerToDB(player);
        this.playerCount++;
        this.eventEmitter.emit(
            'player.created', player
        );
        return player;
    }

    // // Partira dans ranking service avec pour route @get api/ranking 
    // public getAllPlayers(): PlayerModel[] | ErrorModel {
    //     if (this.players.length === 0) {
    //         return this.errorService.createError(404, "Il y a aucun joueur d'enregistré");
    //     }
    //     return this.players;
    // }

    public async getAllPlayers(): Promise<PlayerModel[] | ErrorModel> {
        const players = await this.findAllPlayersFromDB();
        if (players instanceof ErrorModel) {
            return players;
        }else if (players.length === 0) {
            return this.errorService.createError(404, "Il y a aucun joueur d'enregistré");
        }
        return players;
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

    // public convertCreateDtoToModel(dto: CreatePlayerDto): PlayerModel {
    //     const meanRank = this.getMeanRank();
    //     console.log("Mean rank lors de la création du joueur : ", meanRank);
    //     const player: PlayerModel = new PlayerModel(dto.id, meanRank != 0 ? meanRank : 1000);
    //     return player;
    // }

    public async convertCreateDtoToModel(dto: CreatePlayerDto): Promise<PlayerModel> {
        const meanRank = await this.getMeanRank();
        console.log("Mean rank lors de la création du joueur : ", meanRank);
        const player: PlayerModel = new PlayerModel(dto.id, meanRank != 0 ? meanRank : 1000);
        return player;
    }

    // public findPlayerById(id: string): PlayerModel | null {
    //     const player = this.players.find((p: PlayerModel) => p.getId() === id);
    //     return player ?? null;
    // }

    // public updatePlayerRank(player: PlayerModel, newRank: number): void {
    //     player.setRank(newRank);
    // }

    public async updatePlayerRankInDb(player: PlayerModel, newRank: number): Promise<void> {
        player.setRank(newRank);
        await this.savePlayerToDB(player);
    }

    // public getPlayerCount(): number {
    //     return this.playerCount;
    // }
    public async getPlayerCount(): Promise<number> {
        const players = await this.findAllPlayersFromDB();
        if (players instanceof ErrorModel) {
            return 0;
        }
        return players.length;
    }

    // public checkIfPlayerExists(id: string): boolean {
    //     return this.players.some((p: PlayerModel) => p.getId() === id);
    // }

    public async checkIfPlayerExists(id: string): Promise<boolean> {
        const player = await this.findPlayerByIdInDB(id);
        if (player) {
            return true;
        }
        // return this.players.some((p: PlayerModel) => p.getId() === id);
    }

    // public getMeanRank(): number {
    //     if (this.players.length === 0) {
    //         return 0;
    //     }
    //     const totalRank = this.players.reduce((sum, player) => sum + player.getRank(), 0);
    //     return totalRank / this.players.length;
    // }

    public async getMeanRank(): Promise<number> {
        const players = await this.findAllPlayersFromDB();
        if (players instanceof ErrorModel) {
            return 0;
        }
        const totalRank = players.reduce((sum, player) => sum + player.getRank(), 0);
        return totalRank / players.length;
    }

    // public removePlayer(id: string): ErrorModel | null {
    //     console.log("Suppression du joueur avec l'id : ", id);
    //     const playerIndex = this.players.findIndex((p: PlayerModel) => p.getId() === id);
    //     console.log("Index du joueur trouvé : ", playerIndex);
    //     if (playerIndex === -1) {
    //         return this.errorService.createError(404, "Le joueur n'existe pas");
    //     }   
    //     const [removedPlayer] = this.players.splice(playerIndex, 1);
    //     this.playerCount--;
    //     this.eventEmitter.emit(
    //         'player.removed', removedPlayer
    //     );
    //     return null;
    // }
    @OnEvent('player.created') // test event listener
    handlePlayerCreatedEvent(payload: PlayerModel) {
        console.log(`Événement reçu : Joueur créé avec l'ID ${payload.getId()} et le rang ${payload.getRank()}`);
    }

    @OnEvent('ranking.updated') // test event listener
    handleRankingUpdatedEvent(payload: {playerId: string, newRank: number}) {
        console.log(`Événement reçu : Classement mis à jour pour le joueur ${payload.playerId} avec le nouveau rang ${payload.newRank}`);
    }
}