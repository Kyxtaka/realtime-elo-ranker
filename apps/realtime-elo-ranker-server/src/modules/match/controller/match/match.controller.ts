/* eslint-disable prettier/prettier */
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CreateMatchDto } from '../../dto/createMatch.dto';
import { MatchService } from '../../services/match/match.service';
import { CustomHttpException } from '../../../../common/exceptions/custom-http.exception'; 
import { PlayerService } from '../../../player/service/player.service';
import { ErrorService } from '../../../error/services/error/error.service';
import { MatchResultDto } from '../../dto/matchResult.dto';

@Controller('match')
export class MatchController {

    constructor(
        private matchService: MatchService,
        private playerService: PlayerService,
        private errorService: ErrorService
    ) { }

    @Post()
    @HttpCode(200)
    async createMatch(@Body() createMatchDto: CreateMatchDto): Promise<MatchResultDto> {
        const matchModel = this.matchService.convertToModel(createMatchDto);
        const winnerPlayerExist = await this.playerService.checkIfPlayerExists(matchModel.getWinnerId());
        const loserPlayerExist = await this.playerService.checkIfPlayerExists(matchModel.getLoserId());
        if (!winnerPlayerExist || !loserPlayerExist) {
            const error = this.errorService.createError(422, "Soit le gagnant, soit le perdant indiqué n'existe pas.");
            throw new CustomHttpException(error.getCode(), error.getError().message);
        }
        await this.matchService.updatePlayerRanks(matchModel);
        const winnerPlayer = await this.playerService.findPlayerByIdInDB(matchModel.getWinnerId());
        const loserPlayer = await this.playerService.findPlayerByIdInDB(matchModel.getLoserId());
        return {
            winner: winnerPlayer?.convertToDto(),
            loser: loserPlayer?.convertToDto()
        };  
    }
}