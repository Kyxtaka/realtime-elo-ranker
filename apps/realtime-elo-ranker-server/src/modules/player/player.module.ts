/* eslint-disable prettier/prettier */
import { Module} from '@nestjs/common';
import { PlayerService } from './service/player.service';
import { PlayerController } from './controller/player.controller';
import { ErrorModule } from '../error/error.module';
import { PlayerEntity } from './entity/player.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
// import { playerProviders } from './provider/player.provider';

@Module({
  controllers: [PlayerController],
  providers: [ 
    PlayerService
  ],
  imports: [ErrorModule, TypeOrmModule.forFeature([PlayerEntity])],
  exports: [PlayerService],
})
export class PlayerModule {}
