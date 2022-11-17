import {Injectable} from '@nestjs/common';
import HDWalletProvider from "@truffle/hdwallet-provider";
import {Network, OpenSeaPort,} from "opensea-js";
import {Contract} from "web3-eth-contract";
import {
  IPool,
  IActivePool,
} from 'interfaces/contractInterfaces';
// const MnemonicWalletSubprovider = require("@0x/subproviders")
//   .MnemonicWalletSubprovider;
const Web3 = require('web3');
// const { WyvernSchemaName } = require('opensea-js/lib/types');
// idk why this thing wants to be required not imported.
// const RPCSubprovider = require("web3-provider-engine/subproviders/rpc");
// const Web3ProviderEngine = require('web3-provider-engine');
import abi from '../abis/abi.json';
import erc721Abi from '../abis/erc721Abi.json';
import erc1155Abi from '../abis/erc1155Abi.json';

const CONTRACT_ADDRESS = '';

@Injectable()
export class AssetService {
  readonly botAddress = '';
  readonly provider: HDWalletProvider = new HDWalletProvider(
    [''],
    '',
  );
  readonly seaport: OpenSeaPort;
  readonly web3: any;
  readonly contract: Contract;

  constructor() {
    this.seaport = new OpenSeaPort(this.provider);
    this.web3 = new Web3(this.provider);
    this.contract = new this.web3.eth.Contract(abi, CONTRACT_ADDRESS);
  };

  async buyOutAsset(tokenId: string, tokenAddress: string, assetOwner: string) {
    const order = await this.seaport.api.getOrder({
      side: "ask",
      assetContractAddress: tokenAddress,
      tokenId: tokenId,
      owner: assetOwner,
    });

    return await this.seaport.fulfillOrder({ order, accountAddress: this.botAddress });
  };

  async getActivePools(): Promise<Array<IPool>> {
    const activePoolsIds: Array<number> = await this.contract.methods.getActivePoolsIDs();
    let promises: Array<Promise<IActivePool>> = [];

    activePoolsIds.forEach((poolId) => {
      promises.push(this.contract.methods.pools(poolId));
    });
    const activePools = await Promise.all(promises);

    return activePools.map((activePool, index) => ({...activePool, id: activePoolsIds[index]}));
  };

  async finalizePurchase() {
    const activePools = await this.getActivePools();

    for (let i = 0; i < activePools.length; i++) {
      if (activePools[i].unavailable) {
        const pool = activePools[i];
        let assetContract : Contract;
        let isBotOwner = false;

        if (pool.isERC721) {
          assetContract = new this.web3.eth.Contract(erc721Abi, pool.assetAddress);
          isBotOwner = await assetContract.methods.ownerOf(pool.assetId);
        } else {
          assetContract = new this.web3.eth.Contract(erc1155Abi, pool.assetAddress);
          isBotOwner = await assetContract.methods.balanceOf(this.botAddress, pool.assetId);
        }

        await this.contract.methods.finalizeAssetPurchase(pool.id, pool.assetAddress, isBotOwner, isBotOwner ? 0 : pool.tokensNeedToCollect);
      }
    }
  };
}
