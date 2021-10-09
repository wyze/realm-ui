export enum ChainId {
  Rinkeby = '0x4',
  Arbitrum = '0xa4b1',
}

const chains = {
  [ChainId.Arbitrum]: {
    explorer: 'arbiscan.io',
    name: 'Arbitrum',
  },
  [ChainId.Rinkeby]: {
    explorer: 'rinkeby.etherscan.io',
    name: 'Rinkeby',
  },
}

export const id = ChainId.Arbitrum
export const { explorer, name } = chains[id]
