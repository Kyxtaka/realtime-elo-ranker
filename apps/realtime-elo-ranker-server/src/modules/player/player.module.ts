/* eslint-disable prettier/prettier */
import { Module} from '@nestjs/common';
import { PlayerService } from './service/player.service';
import { PlayerController } from './controller/player.controller';
import { ErrorModule } from '../error/error.module';

@Module({
  controllers: [PlayerController],
  providers: [PlayerService],
  imports: [ErrorModule],
  exports: [PlayerService],
})
export class PlayerModule {}
