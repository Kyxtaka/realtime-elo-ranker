/* eslint-disable prettier/prettier */
import { Player } from '../interfaces/player.interface';

export class PlayerModel implements Player {
    id: string;
    rank: number;

    constructor(id: string, rank: number) {
        this.id = id;
        this.rank = rank;
    }

    getId(): string {
        return this.id;
    }
    
    getRank(): number {
        return this.rank;
    }

    setRank(rank: number): void {
        this.rank = rank;
    }

    setId(id: string): void {
        this.id = id;
    }
}