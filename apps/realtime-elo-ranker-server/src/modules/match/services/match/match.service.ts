/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { CreateMatchDto } from '../../dto/createMatch.dto';
import { MatchModel } from '../../model/match.model';
import { PlayerModel } from '../../../player/model/player.model';
import { PlayerService } from '../../../player/service/player.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MatchService {
    private readonly K = 32; // Constante K pour le calcul Elo
    // private readonly K = 40
    // private readonly K = 24
    // private readonly K = 16

    constructor(
        private readonly playerService: PlayerService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    public convertToModel(dto: CreateMatchDto): MatchModel {
        return new MatchModel(dto.winner, dto.loser, dto.draw);
    }

    public getMatchResultCoef(match: MatchModel, player: PlayerModel): number {
        let winCoef = 1;
        if (match.getWinnerId() === player.getId() && !match.isDraw()) {
            winCoef = 1;
        }else {
            winCoef = 0;
        }
        if (match.isDraw()) {
            winCoef = 0.5;
        }
        return winCoef;
    }

    public calculatePlayerWinProbality(player: PlayerModel, oponent: PlayerModel): number {
        const bestPlayer = player.getRank() >= oponent.getRank() ? player : oponent; 
        const worstPlayer = bestPlayer === player ? oponent : player;
        const rankDifference = bestPlayer.getRank() - worstPlayer.getRank();
        const worstPlayerProbability = 1 / (1 + Math.pow(10, rankDifference / 400));
        return bestPlayer === player ? (1 - worstPlayerProbability) : worstPlayerProbability;
    }

    public updatePlayerRanks(match: MatchModel): void {
        const winner = this.playerService.findPlayerById(match.getWinnerId());
        const loser = this.playerService.findPlayerById(match.getLoserId());
        if (!winner || !loser) {
            console.error('Joueur non trouvé pour le match');
            return;
        }
        const winnerProbality = this.calculatePlayerWinProbality(winner, loser);
        const loserProbality = 1 - winnerProbality;

        const winnerResultCef = this.getMatchResultCoef(match, winner);
        const loserResultCef = this.getMatchResultCoef(match, loser);

        const newWinnerRank = Math.round(winner.getRank() + this.K * (winnerResultCef - winnerProbality));
        const newLoserRank = Math.round(loser.getRank() + this.K * (loserResultCef - loserProbality));

        this.playerService.updatePlayerRank(winner, newWinnerRank);
        this.playerService.updatePlayerRank(loser, newLoserRank);

        winner.setRank(newWinnerRank);
        loser.setRank(newLoserRank);
        this.eventEmitter.emit(
            'ranking.updated', 
            winner
        );
        this.eventEmitter.emit(
            'ranking.updated', 
            loser
        );
    }


}
