/* eslint-disable prettier/prettier */
import { Controller, Get, HttpCode, Sse } from '@nestjs/common';
import { RankingService } from '../../services/ranking/ranking.service';
import { PlayerModel } from '../../../player/model/player.model';
import { ErrorModel } from '../../../error/model/error.model';
import { CustomHttpException } from '../../../../common/exceptions/custom-http.exception';
import { PlayerDto } from '../../../player/dto/player.dto';
import { Observable } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
// import { map } from 'rxjs/operators';
import { RankingUpdateEventDto } from '../../../event/dto/RankingUpdateDto';

@Controller('ranking')
export class RankingController {

    constructor(
        private readonly rankingService: RankingService,
        private readonly eventEmitter: EventEmitter2
    ) {}

    @Get()
    @HttpCode(200)
    async getRanking(): Promise<PlayerDto[]> {
        const ranking: PlayerModel[] | ErrorModel = await this.rankingService.getRanking();
        if (ranking instanceof ErrorModel) {
            throw new CustomHttpException(ranking.getCode(), ranking.getError().message);
        }
        const response: PlayerDto[] = ranking.map<PlayerDto>((player: PlayerModel) => {return player.convertToDto();});

        return response;
    }

    
    // @Post()
    @Sse('/events')
    @HttpCode(200)
    followRankingEventsNotification(): Observable<MessageEvent> {
        return new Observable<MessageEvent>((subscriber) => {
            // Handler pour l'événement ranking.updated
            const rankingUpdatedHandler = (playerObject: PlayerModel) => {
                const rankingEventDto: RankingUpdateEventDto = new RankingUpdateEventDto();
                rankingEventDto.type = 'RankingUpdate';
                const player = playerObject;

                const playerDto: PlayerDto = player.convertToDto();
                playerDto.id = player.getId();
                playerDto.rank = player.getRank();

                rankingEventDto.player = playerDto;
                // console.log('ranking.updated via SSE : ', rankingEventDto);
                // console.log('Player Object : ', player);
                // console.log('Player DTO : ', playerDto);
                
                // Envoyer au format SSE avec la propriété 'data'
                subscriber.next({
                    data: rankingEventDto
                } as MessageEvent);
            };

            this.eventEmitter.on('ranking.updated', rankingUpdatedHandler);
            this.eventEmitter.on('player.created', rankingUpdatedHandler);
            this.eventEmitter.on('player.removed', rankingUpdatedHandler);
            return () => {
                this.eventEmitter.off('ranking.updated', rankingUpdatedHandler);
                this.eventEmitter.off('player.created', rankingUpdatedHandler);
                this.eventEmitter.off('player.removed', rankingUpdatedHandler);
            };
        });
    }

    // @OnEvent('ranking.updated')
    // handleRankingUpdatedEvent(payload: {playerId: string, newRank: number}) {
    //     console.log(`Événement reçu dans le controller : Classement mis à jour pour le joueur ${payload.playerId} avec le nouveau rang ${payload.newRank}`);
    // }
}

