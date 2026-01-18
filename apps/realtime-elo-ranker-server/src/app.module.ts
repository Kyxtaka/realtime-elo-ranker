/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { PlayerModule } from './modules/player/player.module';
import { RankingModule } from './modules/ranking/ranking.module';
import { MatchModule } from './modules/match/match.module';
import { EventEmitterModule } from '@nestjs/event-emitter/dist/event-emitter.module';

@Module({
  imports: [
    PlayerModule,
    RankingModule,
    MatchModule,
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
  ],
})
export class AppModule {}
