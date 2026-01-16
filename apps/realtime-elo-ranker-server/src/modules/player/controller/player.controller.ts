/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post } from '@nestjs/common';
import { PlayerService } from '../service/player.service';
import { CreatePlayerDto } from '../dto/createPlayer.dto';
import { PlayerModel } from '../model/player.model';
import { PlayerDto } from '../dto/player.dto';

@Controller('player')
export class PlayerController {
    constructor(private readonly playerService: PlayerService) {}

    @Get()
    getAllPlayers(): PlayerDto[] {
        const result: PlayerDto[] = [];
        const players: PlayerModel[] = this.playerService.getAllPlayers();
        players.forEach(player => result.push(this.playerService.convertToDto(player)));
        return result;
    }

    @Post()
    addPlayer(@Body() createPlayerDto: CreatePlayerDto) {
        const player: PlayerModel = this.playerService.convertCretateDtoToModel(createPlayerDto);
        this.playerService.addPlayer(player);
    }
}
