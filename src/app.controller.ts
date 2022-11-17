import {Controller, Get, Param} from '@nestjs/common';
import { AssetService } from './app.service';

@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get()
  default(): string {
    return "Enter asset address and it's id";
  }

  @Get('/buy/:address/:id/:owner')
  async buyAsset(
    @Param('address') assetAddress: string,
    @Param('id') assetId: string,
    @Param('owner') assetOwner: string) {
    await this.assetService.buyOutAsset(assetAddress, assetId, assetOwner);

    return 'finished';
  }

  @Get('/finalize-purchase')
  async finalizePurchase() {
    await this.assetService.finalizePurchase();
  }
}
