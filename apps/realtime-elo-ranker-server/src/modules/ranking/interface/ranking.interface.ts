/* eslint-disable prettier/prettier */
import { PlayerModel } from "../../player/model/player.model";

export interface rankingInterface {
    type: string;
    player?: PlayerModel;

    getData(): { type: string; player?: PlayerModel };
    getType(): string;
    setType(type: string): void;
    setUpdateEventPlayer(player: PlayerModel): void;
}