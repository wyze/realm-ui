import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'

import type { HardhatUserConfig } from 'hardhat/config'
import dotenv from 'dotenv'

dotenv.config()

const ciConfig: HardhatUserConfig | undefined = process.env.CI
  ? {
      paths: {
        sources: './src/contracts',
      },
      solidity: '0.8.4',
    }
  : undefined

const config: HardhatUserConfig = ciConfig ?? {
  defaultNetwork: process.env.NODE_ENV === 'test' ? 'hardhat' : 'rinkeby',
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  networks: {
    rinkeby: {
      accounts: process.env.RINKEBY_ACCOUNTS?.split(','),
      url: process.env.RINKEBY_URL ?? '',
    },
  },
  paths: {
    sources: './src/contracts',
  },
  solidity: {
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
    version: '0.8.4',
  },
}

export default config
