import type { QueryFunctionContext } from 'react-query'

import { ethers } from 'ethers'

import { getRealmContract } from './contract'

const base = Array(3).fill(0)

export async function getRealmById({
  queryKey,
}: QueryFunctionContext<['realm', string]>) {
  const [, id] = queryKey

  const bnId = ethers.BigNumber.from(id)
  const contract = getRealmContract()

  const {
    name,
    size: bnSize,
    createdAt: bnCreatedAt,
    partner,
  } = await contract.realms(bnId)

  const features = await Promise.all(
    base.map(async (_, index) => {
      const bnFeatureId = await contract.realmFeatures(bnId, index)
      const featureId = bnFeatureId.toNumber()
      const feature = await contract.features(bnFeatureId)

      return { feature, featureId }
    })
  )
  const bnTerraformTime = await contract.terraformTime(bnId)
  const owner = await contract.ownerOf(bnId)

  const createdAt = bnCreatedAt.toNumber() * 1000
  const terraformTime = bnTerraformTime.toNumber() * 1000
  const size = bnSize.toNumber()

  return {
    createdAt,
    features,
    name,
    owner: owner.toLowerCase(),
    partner,
    size,
    terraformTime,
  }
}
