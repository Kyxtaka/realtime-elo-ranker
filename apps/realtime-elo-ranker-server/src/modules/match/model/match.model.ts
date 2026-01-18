/* eslint-disable prettier/prettier */
export class MatchModel {
    winner: string;
    loser: string;
    draw: boolean;

    constructor(winner: string, loser: string, draw: boolean) {
        this.winner = winner;
        this.loser = loser;
        this.draw = draw;
    }

    getWinnerId(): string {
        return this.winner;
    }

    getLoserId(): string {
        return this.loser;
    }

    isDraw(): boolean {
        return this.draw;
    }
}