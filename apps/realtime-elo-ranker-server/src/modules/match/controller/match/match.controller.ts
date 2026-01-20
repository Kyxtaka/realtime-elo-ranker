/* eslint-disable prettier/prettier */
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CreateMatchDto } from '../../dto/createMatch.dto';
import { MatchService } from '../../services/match/match.service';
import { CustomHttpException } from '../../../../common/exceptions/custom-http.exception'; 
import { ErrorService } from '../../../error/services/error/error.service';
import { MatchResultDto } from '../../dto/matchResult.dto';
import { MatchModel } from '../../model/match.model';

@Controller('match')
export class MatchController {

    constructor(
        private matchService: MatchService,
        private errorService: ErrorService
    ) { }

    @Post()
    @HttpCode(200)
    public async createMatch(@Body() createMatchDto: CreateMatchDto): Promise<MatchResultDto> {
        // convertion du DTO en modèle (+ vérification de l'existance joueurs)
        const match: MatchModel | null = await this.matchService.convertToModel(createMatchDto);
        if (!match) {
            const error = this.errorService.createError(500, "Erreur lors de la déclaration du match.");
            throw new CustomHttpException(error.getCode(), error.getError().message);
        }
        const declaredMatch: MatchModel = await this.matchService.declareNewMatch(match);
        return this.matchService.convertToDto(declaredMatch);
    }
}