/* eslint-disable prettier/prettier */
// import { Param, Delete } from '@nestjs/common'; 
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
    @HttpCode(200)
    async getAllPlayers(): Promise<PlayerDto[]> {
        const players: PlayerModel[] | ErrorModel = await this.playerService.getAllPlayers();
        if (players instanceof ErrorModel) {
            throw new CustomHttpException(players.code, players.getError().message);
        }
        const response: PlayerDto[] = players.map<PlayerDto>((player: PlayerModel) => {return player.convertToDto();});
        return response;
    }

    @Post()
    @HttpCode(201)
    async addPlayer(@Body() createPlayerDto: CreatePlayerDto): Promise<PlayerDto> {
        const player: PlayerModel = await this.playerService.convertCreateDtoToModel(createPlayerDto);
        const result = await this.playerService.addPlayer(player);
        if (result instanceof ErrorModel) {
            throw new CustomHttpException(result.code, result.getError().message);
        }
        return this.playerService.convertToDto(result);
    }

    // @Delete(':id')
    // @HttpCode(200)
    // removePlayer(@Param('id') id: string): {message: string} {
    //     const result = this.playerService.removePlayer(id);
    //     if (result instanceof ErrorModel) {
    //         throw new CustomHttpException(result.code, result.getError().message);
    //     }
    //     return {message: `Le joueur avec l'id ${id} a été supprimé avec succès.`};
    // }
}
