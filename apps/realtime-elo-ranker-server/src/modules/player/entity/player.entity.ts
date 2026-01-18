/* eslint-disable prettier/prettier */
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('players')
export class PlayerEntity {
    @PrimaryColumn()
    id: string;
    
    @Column()
    rank: number;
}