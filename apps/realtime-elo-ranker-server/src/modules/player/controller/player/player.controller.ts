/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post } from '@nestjs/common';
import { PlayerService } from '../../service/player/player.service';
import { CreatePlayerDto } from '../../dto/createPlayer.dto';
import { PlayerModel } from '../../model/player.model';

@Controller('player')
export class PlayerController {
    constructor(private readonly playerService: PlayerService) {}

    @Get()
    getAllPlayers() {
        return this.playerService.findAllPlayers();
    }

    @Post()
    addPlayer(@Body() createPlayerDto: CreatePlayerDto) {
        const player: PlayerModel = PlayerModel.fromDto(createPlayerDto);
        this.playerService.addPlayer(player);
    }
}
