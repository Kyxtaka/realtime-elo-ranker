import { PlayerModel } from "../../player/model/player.model";
import { MatchResultDto } from "../dto/matchResult.dto";

/* eslint-disable prettier/prettier */
export class MatchModel {
    winner: PlayerModel;
    loser: PlayerModel;
    draw: boolean;

    constructor(winner: PlayerModel, loser: PlayerModel, draw: boolean) {
        this.winner = winner;
        this.loser = loser;
        this.draw = draw;
    }

    getWinner(): PlayerModel {
        return this.winner;
    }

    getLoser(): PlayerModel {
        return this.loser;
    }

    isDraw(): boolean {
        return this.draw;
    }

    convertToDto(): MatchResultDto {
        return {
            winner: this.winner.convertToDto(),
            loser: this.loser.convertToDto()
        };
    }
}