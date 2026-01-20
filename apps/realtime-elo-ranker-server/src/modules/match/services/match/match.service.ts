/* eslint-disable prettier/prettier */
import { Injectable, Scope } from '@nestjs/common';
import { CreateMatchDto } from '../../dto/createMatch.dto';
import { MatchModel } from '../../model/match.model';
import { PlayerModel } from '../../../player/model/player.model';
import { PlayerService } from '../../../player/service/player.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MatchResultDto } from '../../dto/matchResult.dto';

@Injectable({ scope: Scope.DEFAULT })
export class MatchService {
    private readonly K = 32; // Constante K pour le calcul Elo
    // private readonly K = 40
    // private readonly K = 24
    // private readonly K = 16
    private matchHistory: MatchModel[] = [];

    constructor(
        private readonly playerService: PlayerService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    public async convertToModel(dto: CreateMatchDto): Promise<MatchModel | null> {
        const winner = await this.playerService.findPlayerByIdInDB(dto.winner);
        const loser = await this.playerService.findPlayerByIdInDB(dto.loser);
        if (!winner || !loser) {
            return null;
        }
        return new MatchModel(winner, loser, dto.draw);
    }

    public getMatchResultCoef(match: MatchModel, player: PlayerModel): number {
        let winCoef = 1;
        if (match.getWinner().getId() === player.getId() && !match.isDraw()) {
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

    public async updatePlayerRanks(match: MatchModel): Promise<void> {
        const winner = match.getWinner();
        const loser = match.getLoser();

        const winnerProbality = this.calculatePlayerWinProbality(winner, loser);
        const loserProbality = 1 - winnerProbality;

        const winnerResultCef = this.getMatchResultCoef(match, winner);
        const loserResultCef = this.getMatchResultCoef(match, loser);

        const newWinnerRank = Math.round(winner.getRank() + this.K * (winnerResultCef - winnerProbality));
        const newLoserRank = Math.round(loser.getRank() + this.K * (loserResultCef - loserProbality));

        await this.playerService.updatePlayerRankInDb(winner, newWinnerRank);
        await this.playerService.updatePlayerRankInDb(loser, newLoserRank);

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

    public addMatchToHistory(match: MatchModel): void {
        this.matchHistory.push(match);
        console.log('Match ajouté à l\'historique des matchs.');
        console.log('Historiqque des matchs : ', this.matchHistory);
    }

    public async declareNewMatch(match: MatchModel): Promise<MatchModel> {
        // const winnerPlayerExist = await this.playerService.checkIfPlayerExists(match.getWinnerId());
        // const loserPlayerExist = await this.playerService.checkIfPlayerExists(match.getLoserId());
        // const winnerPlayer = await this.playerService.findPlayerByIdInDB(match.getWinnerId());
        // const loserPlayer = await this.playerService.findPlayerByIdInDB(match.getLoserId());

        ////// les vérification sont faite en amont lors de la conversion du DTO en modèle
        await this.updatePlayerRanks(match);
        this.addMatchToHistory(match);
        return match;
    }

    public convertToDto(match: MatchModel): MatchResultDto {
        return match.convertToDto();
    }

    
}
