/* eslint-disable prettier/prettier */
export interface Player {
    id: string;
    rank?: number;

    getId(): string;
    getRank(): number;
    setId(id: string): void;
    setRank(rank: number): void;
}