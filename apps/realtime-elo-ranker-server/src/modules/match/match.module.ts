/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MatchService } from './services/match/match.service';
import { MatchController } from './controller/match/match.controller';
import { PlayerModule } from '../player/player.module';
import { RankingModule } from '../ranking/ranking.module';
import { ErrorModule } from '../error/error.module';

@Module({
  providers: [MatchService],
  imports: [PlayerModule, RankingModule, ErrorModule],
  controllers: [MatchController], 
})
export class MatchModule {}
