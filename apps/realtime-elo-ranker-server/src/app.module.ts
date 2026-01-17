/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { PlayerModule } from './modules/player/player.module';
import { RankingModule } from './modules/ranking/ranking.module';
// import { MatchModule } from './modules/match/match.module';

@Module({
  imports: [
    PlayerModule,
    RankingModule,
    // MatchModule,
  ],
})
export class AppModule {}
