import { Module } from '@nestjs/common';
import { AssetController } from './app.controller';
import { AssetService } from './app.service';

@Module({
  imports: [],
  controllers: [AssetController],
  providers: [AssetService],
})
export class AppModule {}
