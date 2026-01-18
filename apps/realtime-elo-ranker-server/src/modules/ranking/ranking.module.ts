/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { RankingController } from './controller/ranking/ranking.controller';
import { RankingService } from './services/ranking/ranking.service';
import { PlayerModule } from '../player/player.module';
import { ErrorModule } from '../error/error.module';

@Module({
  controllers: [RankingController],
  providers: [RankingService],
  imports: [PlayerModule, ErrorModule],
  exports: [RankingService],
})
export class RankingModule {}
