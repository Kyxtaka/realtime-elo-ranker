/* eslint-disable prettier/prettier */
import { Injectable, Scope } from '@nestjs/common';
import { ErrorService } from '../../../error/services/error/error.service';
import { PlayerModel } from '../../../player/model/player.model';
import { ErrorModel } from '../../../error/model/error.model';
import { PlayerService } from '../../../player/service/player.service';


@Injectable({scope: Scope.DEFAULT})
export class RankingService {
    private ranking: PlayerModel[];

    constructor(
        private errorService: ErrorService,
        private playerService: PlayerService,
    ) {
        this.ranking = [] // cache du ranking
    }

    public async getRanking(): Promise<PlayerModel[] | ErrorModel> {
        // const needUpdateRanking: boolean = this.ranking.length !== this.playerService.getPlayerCount(); 
        // if (needUpdateRanking) {
        //     if (allPlayers instanceof ErrorModel) {
        //         return allPlayers;
        //     }
        // }
        // if (this.ranking.length === 0) {
        //     return this.errorService.createError(404, "Le classement n'est pas disponible car aucun joueur n'existe");
        // }
        const allPlayers = await this.playerService.getAllPlayers();
        if (allPlayers instanceof ErrorModel) {
             return this.errorService.createError(404, "Le classement n'est pas disponible car aucun joueur n'existe");
        }
        this.ranking = allPlayers.sort((a: PlayerModel, b: PlayerModel) => b.getRank() - a.getRank());
        // console.log(this.ranking);
        return this.ranking;
    }
}
