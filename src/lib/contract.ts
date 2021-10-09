import type { Realm } from '../../typechain'

import { ethers } from 'ethers'

import { ChainId, id } from './chain'
import RealmContract from '../../artifacts/src/contracts/Realm.sol/Realm.json'

const addresses = {
  [ChainId.Rinkeby]: '0x24e0d044b9379EaF201266F9f1E8484f057859D1',
  [ChainId.Arbitrum]: '0x4de95c1E202102E22E801590C51D7B979f167FBB',
}

export const address = addresses[id]

export function getRealmContract() {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  return new ethers.Contract(address, RealmContract.abi, signer) as Realm
}
