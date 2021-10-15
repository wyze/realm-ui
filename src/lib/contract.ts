import type { City, Data, Farm, Manager, Realm } from '../../typechain'

import { ethers } from 'ethers'

import { ChainId, id } from './chain'
import CityContract from '../../artifacts/src/contracts/City.sol/City.json'
import DataContract from '../../artifacts/src/contracts/Data.sol/Data.json'
import FarmContract from '../../artifacts/src/contracts/Farm.sol/Farm.json'
import ManagerContract from '../../artifacts/src/contracts/Manager.sol/Manager.json'
import RealmContract from '../../artifacts/src/contracts/Realm.sol/Realm.json'

const addresses = {
  [ChainId.Arbitrum]: {
    city: '0x1aEb0bb454E7DD0211601CaA16E6D80c4eD05d2b',
    data: '0xAae3A78EA8De1b89C64D5c64A26d5b1FC8F91496',
    farm: '0x37dB66a2622D83C0523437e6A808FAE3327C5A3E',
    manager: '0x4E572433A3Bfa336b6396D13AfC9F69b58252861',
    realm: '0x4de95c1E202102E22E801590C51D7B979f167FBB',
  },
  [ChainId.Rinkeby]: {
    city :'0x2f4EB55b537142551235FC919A211A5E25c17C91',
    data: '0x4900583e87F414e321DACDA0bbe549DfCb4F0617',
    farm : '0x65cE994F6D4b0F763E6b62366F1158D1E08Da404',
    manager: '0xd7731Da60e06Fc74e43B304977B8b22f75Df6E1b',
    realm: '0x24e0d044b9379EaF201266F9f1E8484f057859D1',
  },
}

export const address = addresses[id].realm

export function getCityContract() {
  const address = addresses[id].city
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  return new ethers.Contract(address, CityContract.abi, signer) as City
}

export function getDataContract() {
  const address = addresses[id].data
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  return new ethers.Contract(address, DataContract.abi, signer) as Data
}

export function getFarmContract() {
  const address = addresses[id].farm
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  return new ethers.Contract(address, FarmContract.abi, signer) as Farm
}

export function getManagerContract() {
  const address = addresses[id].manager
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  return new ethers.Contract(address, ManagerContract.abi, signer) as Manager
}

export function getRealmContract() {
  const address = addresses[id].realm
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  return new ethers.Contract(address, RealmContract.abi, signer) as Realm
}
