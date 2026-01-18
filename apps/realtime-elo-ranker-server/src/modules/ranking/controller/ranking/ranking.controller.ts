/* eslint-disable prettier/prettier */
import { Controller, Get, HttpCode } from '@nestjs/common';
import { RankingService } from '../../services/ranking/ranking.service';
import { PlayerModel } from '../../../player/model/player.model';
import { ErrorModel } from '../../../error/model/error.model';
import { CustomHttpException } from '../../../../common/exceptions/custom-http.exception';
import { PlayerDto } from '../../../player/dto/player.dto';


@Controller('ranking')
export class RankingController {

    constructor(private readonly rankingService: RankingService) {}

    @Get()
    @HttpCode(200)
    getRanking(): PlayerDto[] {
        const ranking: PlayerModel[] | ErrorModel = this.rankingService.getRanking();
        if (ranking instanceof ErrorModel) {
            throw new CustomHttpException(ranking.getCode(), ranking.getError().message);
        }
        const response: PlayerDto[] = ranking.map<PlayerDto>((player: PlayerModel) => {return player.convertToDto();});

        return response;
    }
}
