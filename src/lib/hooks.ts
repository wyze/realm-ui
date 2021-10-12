import { ethers } from 'ethers'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

import { isAfter } from 'date-fns'
import { useBoolean } from '@chakra-ui/react'
import { useQuery } from 'react-query'

import { getRealmContract } from './contract'
import { getTimersForRealm } from './queries'

export function useAccount() {
  const [enabled, setEnabled] = useBoolean()
  const { data: [account] = [], status } = useQuery(
    'accounts',
    () => window.ethereum.request<string[]>({ method: 'eth_accounts' }),
    { enabled }
  )

  useEffect(() => {
    if (window.ethereum) {
      setEnabled.on()
    }
  }, [setEnabled])

  return { account, status }
}

export function useBlockTimestamp() {
  return useQuery('block-timestamp', async () => {
    const { provider } = getRealmContract()
    const blockNumber = await provider.getBlockNumber()
    const block = await provider.getBlock(blockNumber)

    return block.timestamp * 1000
  })
}

export function useIsRealmOwner() {
  const router = useRouter()

  const { account } = useAccount()
  const { id } = router.query

  const owner = useQuery(
    ['owner', account, id],
    async () => {
      const bnId = ethers.BigNumber.from(id)
      const owner = await getRealmContract().ownerOf(bnId)

      return owner.toLowerCase() === account
    },
    { enabled: Boolean(account) && Boolean(id) }
  )

  return owner.data ?? false
}

export function useRealmTimers() {
  const router = useRouter()

  const { id } = router.query
  const { account } = useAccount()

  const timers = useQuery(['realm', String(id), 'timers'], getTimersForRealm, {
    enabled: Boolean(account) && Boolean(id),
  })

  const blockTimestamp = useBlockTimestamp()

  const canCollect =
    blockTimestamp.status === 'success' && timers.status === 'success'
      ? isAfter(blockTimestamp.data, timers.data.collectTime)
      : false

  const canTerraform =
    blockTimestamp.status === 'success' && timers.status === 'success'
      ? isAfter(blockTimestamp.data, timers.data.terraformTime)
      : false

  const hasEnoughGoldForCity =
    timers.status === 'success'
      ? timers.data.gold >= timers.data.nextCityCost
      : false

  const hasWaitedEnoughForCity =
    blockTimestamp.status === 'success' && timers.status === 'success'
      ? isAfter(blockTimestamp.data, timers.data.cityBuildTime)
      : false

  const canBuildCity = hasEnoughGoldForCity && hasWaitedEnoughForCity

  return {
    canBuildCity,
    canCollect,
    canTerraform,
    hasEnoughGoldForCity,
    timers,
  }
}
