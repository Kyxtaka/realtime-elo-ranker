/* eslint-disable prettier/prettier */
import { Module} from '@nestjs/common';
import { PlayerService } from './service/player.service';
import { PlayerController } from './controller/player.controller';

@Module({
  controllers: [PlayerController],
  providers: [PlayerService],
})
export class PlayerModule {}
