/* eslint-disable prettier/prettier */
import { PlayerInrterface } from '../interfaces/player.interface';

export class PlayerModel implements PlayerInrterface {
    id: string;
    rank: number;

    constructor(id: string, rank?: number) {
        this.id = id;
        this.rank = rank ?? 1000;
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

    convertToDto() {
        return {
            id: this.id,
            rank: this.rank,
        };
    }
}