/* eslint-disable prettier/prettier */
import { Injectable} from '@nestjs/common';
import { PlayerModel } from '../../model/player.model';
import { Player } from '../../interfaces/player.interface';

@Injectable()
export class PlayerService {

    private players: Player[];

    addPlayer(player: PlayerModel): void {
        this.players.push(player);
    }

    findAllPlayers(): Player[] {
        return this.players;
    }
    
    constructor() {
        this.players = [];
    }
}
