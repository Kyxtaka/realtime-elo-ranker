/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, HttpCode } from '@nestjs/common';
import { PlayerService } from '../service/player.service';
import { CreatePlayerDto } from '../dto/createPlayer.dto';
import { PlayerModel } from '../model/player.model';
import { PlayerDto } from '../dto/player.dto';
import { ErrorModel } from '../../error/model/error.model';
import { CustomHttpException } from '../../../common/exceptions/custom-http.exception';

@Controller('player')
export class PlayerController {
    constructor(private readonly playerService: PlayerService) {}

    @Get()
    getAllPlayers(): PlayerDto[] {
        const players: PlayerModel[] | ErrorModel = this.playerService.getAllPlayers();
        if (players instanceof ErrorModel) {
            throw new CustomHttpException(players.code, players.getError().message);
        }
        const response: PlayerDto[] = players.map<PlayerDto>((player: PlayerModel) => {return player.convertToDto();});
        return response;
    }

    @Post()
    @HttpCode(201)
    addPlayer(@Body() createPlayerDto: CreatePlayerDto): PlayerDto {
        const player: PlayerModel = this.playerService.convertCretateDtoToModel(createPlayerDto);
        const result = this.playerService.addPlayer(player);
        if (result instanceof ErrorModel) {
            throw new CustomHttpException(result.code, result.getError().message);
        }
        return this.playerService.convertToDto(result);
    }
}
