/* eslint-disable prettier/prettier */
import { PlayerModel } from "../../player/model/player.model";
import { rankingInterface } from "../interface/ranking.interface";

export class rankingModel implements rankingInterface {
    type: string;
    player?: PlayerModel;

    constructor(type: string, player?: PlayerModel) {
        this.type = type;
        this.player = player;
    }
    getType(): string {
        return this.type;
    }
    setType(type: string): void {
        this.type = type;
    }
    setUpdateEventPlayer(player: PlayerModel): void {
        this.player = player;
    }

    getData() {
        return {
            type: this.type,
            player: this.player,
        };
    }

    static crateUpdateEvent(type: string, player: PlayerModel): rankingModel {
        return new rankingModel(type, player);
    }
    
    static craeteEvent(type: string): rankingModel {
        return new rankingModel(type);
    }
}