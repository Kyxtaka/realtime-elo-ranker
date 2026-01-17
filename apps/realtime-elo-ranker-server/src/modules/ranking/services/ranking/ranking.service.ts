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

    public getRanking(): PlayerModel[] | ErrorModel {
        const needUpdateRanking: boolean = this.ranking.length !== this.playerService.getPlayerCount(); 
        if (needUpdateRanking) {
            const allPlayers = this.playerService.getAllPlayers();
            if (allPlayers instanceof ErrorModel) {
                return allPlayers;
            }
            this.ranking = allPlayers.sort((a: PlayerModel, b: PlayerModel) => b.getRank() - a.getRank());
        }
        if (this.ranking.length === 0) {
            return this.errorService.createError(404, "Le classement n'est pas disponible car aucun joueur n'existe");
        }
        console.log(this.ranking);
        return this.ranking;
    }
}
