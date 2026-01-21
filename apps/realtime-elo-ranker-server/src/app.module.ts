/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { PlayerModule } from './modules/player/player.module';
import { RankingModule } from './modules/ranking/ranking.module';
import { MatchModule } from './modules/match/match.module';
import { EventEmitterModule } from '@nestjs/event-emitter/dist/event-emitter.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [],
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
    TypeOrmModule.forRoot({
        // type: 'sqlite',
        type: 'better-sqlite3',
        database: './databases/TPNESTJS.db',
        entities: [__dirname + '/modules/**/*.entity{.ts,.js}'], // ou juste importer les Classe entite 
        synchronize: true,
    }),
  ],
})
export class AppModule {}
// version serveur distant OVH
// TypeOrmModule.forRoot({
//     type: 'mysql',
//     host: 'db-ovh.hikarizsu.fr',
//     port: 3893,
//     username: 'root',
//     password: 'ThIsIsIsntS3cur3d',
//     database: 'TPNESTJS',
//     entities: [__dirname + '/modules/**/*.entity{.ts,.js}'], // ou juste importer les Classe entite 
//     synchronize: true,
// }),