import type { QueryFunctionContext } from 'react-query'

import { ethers } from 'ethers'
import { useCallback } from 'react'

import { compareAsc, isAfter } from 'date-fns'
import { useQueryClient } from 'react-query'

import {
  getCityContract,
  getDataContract,
  getFarmContract,
  getRealmContract,
} from './contract'

interface ErrorWithValue extends Error {
  value: string
}

const dataIndexes = Array(7).fill(0)
const farmIndexes = Array(9).fill(0)
const featureIndexes = Array(3).fill(0)

const farmIcons: Record<string, string> = {
  Chocolate: '🍫',
  Coffee: '☕️',
  Corn: '🌽',
  Honey: '🍯',
  None: '🚜',
  Rice: '🍚',
  Tea: '🍃',
  Wheat: '🍞',
  Wine: '🍷',
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

export async function getFarmsForRealm({
  queryKey,
}: QueryFunctionContext<['realm', string, 'farms']>) {
  const [, id] = queryKey

  const bnId = ethers.BigNumber.from(id)
  const farmContract = getFarmContract()

  const bnTotalFarms = await farmContract.totalFarms(bnId)
  const totalFarms = bnTotalFarms.toNumber()

  const resourceNames = await Promise.all(
    farmIndexes.map(async (_, index) => farmContract.resourceNames(index))
  )
  const resources = await Promise.all(
    resourceNames.map(async (name, index) => {
      const bnValue = await farmContract.resources(bnId, index)
      const value = bnValue.toNumber()
      const icon = farmIcons[name]

      return { icon, name, value }
    })
  )

  const farmsByResource = await Promise.all(
    Array(totalFarms)
      .fill(0)
      .map(async (_, index) => {
        const bnResourceId = await farmContract.farms(bnId, index)
        const resourceId = bnResourceId.toNumber()

        return resourceNames[resourceId]
      })
  )

  const farms = farmsByResource.reduce((acc, name) => {
    const icon = farmIcons[name]
    const value = (acc[name]?.value ?? 0) + 1

    acc[name] = { icon, name, value }

    return acc
  }, {} as Record<string, { icon: string; name: string; value: number }>)

  return { farms, resources }
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

export async function getQueueForRealm({
  queryKey,
}: QueryFunctionContext<['realm', string, 'queue']>) {
  const [, id] = queryKey

  const bnId = ethers.BigNumber.from(id)
  const dataContract = getDataContract()

  const name = await dataContract.dataNames(2)
  const bnResource = await dataContract.data(bnId, 2)
  const resource = bnResource.toNumber()

  const bnQueueLimit = await dataContract.queueLimit(bnId)
  const bnQueueMod = await dataContract.queueMod(bnId)

  const queueLimit = bnQueueLimit.toNumber() + 1
  const queueMod = bnQueueMod.toNumber() + 1

  const { provider } = dataContract
  const blockNumber = await provider.getBlockNumber()
  const block = await provider.getBlock(blockNumber)
  const timestamp = block.timestamp * 1000

  const buildTimes = await Promise.all(
    Array(queueLimit)
      .fill(0)
      .map(async (_, index) => {
        const bnBuildTime = await dataContract.buildTime(bnId, index)
        const buildTime = bnBuildTime.toNumber() * 1000
        const canBuild = isAfter(timestamp, buildTime)

        return { buildTime, canBuild }
      })
  )

  const [buildTime] = buildTimes
    .map(({ buildTime }) => buildTime)
    .sort(compareAsc)

  const queueAvailable = buildTimes.reduce(
    (acc, { canBuild }) => acc + Number(!canBuild),
    0
  )

  const canBuild = queueAvailable !== buildTimes.length
  const gainSlot = { name, value: `${resource}/${queueMod}` }
  const queue = `${queueAvailable}/${buildTimes.length}`

  return { buildTime, canBuild, gainSlot, queue }
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

      return { name, perTurn, value }
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
