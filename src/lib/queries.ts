import type { QueryFunctionContext } from 'react-query'

import { ethers } from 'ethers'
import { useCallback } from 'react'

import { useQueryClient } from 'react-query'

import { getCityContract, getDataContract, getRealmContract } from './contract'

interface ErrorWithValue extends Error {
  value: string
}

const dataIndexes = Array(7).fill(0)
const featureIndexes = Array(3).fill(0)

const resourceColors: Record<string, string> = {
  Culture: '#d45caa',
  Food: '#83c760',
  Gold: '#ffb300',
  Religion: '#a162dc',
  Reputation: '#996a6a',
  Technology: '#f1ea15',
  Workforce: '#6b84cc',
}

const cityBuildCost = 50

export async function getRealmById({
  queryKey,
}: QueryFunctionContext<['realm', string]>) {
  const [, id] = queryKey

  const bnId = ethers.BigNumber.from(id)
  const cityContract = getCityContract()
  const dataContract = getDataContract()
  const realmContract = getRealmContract()

  const {
    size: bnSize,
    createdAt: bnCreatedAt,
    partner,
  } = await realmContract.realms(bnId)

  const bnCities = await cityContract.totalCities(bnId)
  const bnFoodBonus = await dataContract.foodBonus(bnId)

  const cities = bnCities.toNumber()
  const createdAt = bnCreatedAt.toNumber() * 1000
  const foodBonus = bnFoodBonus.toNumber()
  const size = bnSize.toNumber()

  const features = await Promise.all(
    featureIndexes.map(async (_, index) => {
      const bnFeatureId = await realmContract.realmFeatures(bnId, index)
      const featureId = bnFeatureId.toNumber()
      const feature = await realmContract.features(bnFeatureId)

      return { feature, featureId }
    })
  )

  return {
    cities,
    createdAt,
    features,
    foodBonus,
    partner,
    size,
  }
}

const isErrorWithValue = (value: unknown): value is ErrorWithValue => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  return 'value' in value
}

export async function getNameForRealm({
  queryKey,
}: QueryFunctionContext<['realm-name', string]>) {
  const [, id] = queryKey

  const bnId = ethers.BigNumber.from(id)

  try {
    const { name } = await getRealmContract().realms(bnId)

    return name
  } catch (error) {
    if (isErrorWithValue(error)) {
      return ethers.utils.toUtf8String(
        error.value,
        ethers.utils.Utf8ErrorFuncs.ignore
      )
    }

    return 'Unknown'
  }
}

export async function getResourcesForRealm({
  queryKey,
}: QueryFunctionContext<['realm', string, 'resources']>) {
  const [, id] = queryKey

  const bnId = ethers.BigNumber.from(id)
  const dataContract = getDataContract()

  const bnGold = await dataContract.gold(bnId)
  const bnReligion = await dataContract.religion(bnId)

  const gold = bnGold.toNumber()
  const religion = bnReligion.toNumber()

  const resourcePerTurn: Record<string, number> = {
    Gold: gold,
    Religion: religion,
  }

  const dataNames = await Promise.all(
    dataIndexes.map(async (_, index) => dataContract.dataNames(index))
  )
  const resources = await Promise.all(
    dataNames.map(async (name, index) => {
      const bnValue = await dataContract.data(bnId, index)
      const value = bnValue.toNumber()
      const perTurn = resourcePerTurn[name]
      const color = resourceColors[name]

      return { color, name, perTurn, value }
    })
  )

  return resources
}

export async function getTimersForRealm({
  queryKey,
}: QueryFunctionContext<['realm', string, 'timers']>) {
  const [, id] = queryKey

  const bnId = ethers.BigNumber.from(id)
  const cityContract = getCityContract()
  const dataContract = getDataContract()
  const realmContract = getRealmContract()

  const bnCities = await cityContract.totalCities(bnId)
  const bnCityBuildTime = await cityContract.buildTime(bnId)
  const bnCollectTime = await dataContract.collectTime(bnId)
  const bnGold = await dataContract.data(bnId, 0) // Gold
  const bnTerraformTime = await realmContract.terraformTime(bnId)

  const cities = bnCities.toNumber()
  const cityBuildTime = bnCityBuildTime.toNumber() * 1000
  const collectTime = bnCollectTime.toNumber() * 1000
  const gold = bnGold.toNumber()
  const terraformTime = bnTerraformTime.toNumber() * 1000

  const nextCityCost = cities > 0 ? cityBuildCost + cities * 2 : 0

  return { cityBuildTime, collectTime, gold, nextCityCost, terraformTime }
}

export function usePrefetchRealm() {
  const queryClient = useQueryClient()

  return useCallback(
    (id: string) => {
      queryClient.prefetchQuery(['realm-name', id], getNameForRealm)
      queryClient.prefetchQuery(['realm', id], getRealmById)
      queryClient.prefetchQuery(
        ['realm', id, 'resources'],
        getResourcesForRealm
      )
      queryClient.prefetchQuery(['realm', id, 'timers'], getTimersForRealm)
    },
    [queryClient]
  )
}
