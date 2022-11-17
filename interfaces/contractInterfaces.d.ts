export interface IActivePool {
  poolCreator: string;
  buyTokenAddress: string;
  isERC721: boolean;
  piecesNeedToCollect: number;
  tokensNeedToCollect: number;
  piecesCollected: number;
  assetAddress: string;
  assetId: number;
  assetOwner: string;
  pieceCost: number;
  unavailable: boolean;
  closed: boolean;
}

interface IPool extends IActivePool{
  id: number;
}