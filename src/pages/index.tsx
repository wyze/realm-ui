import Head from 'next/head'

import { useEffect } from 'react'

import { Divider, HStack, Heading, VStack } from '@chakra-ui/react'
import { useQuery, useQueryClient } from 'react-query'

import { getRealmContract } from '../lib/contract'
import { useAccount } from '../lib/hooks'
import Mint from '../components/Mint'
import Search from '../components/Search'

export default function Home() {
  const queryClient = useQueryClient()
  const { account } = useAccount()

  const currentTokens = useQuery(
    'current-tokens',
    async () => {
      const transaction = await getRealmContract().totalSupply()

      return transaction.toNumber().toLocaleString()
    },
    { enabled: Boolean(account) }
  )

  useEffect(() => {
    if (window.ethereum) {
      const invalidateChain = () => {
        queryClient.invalidateQueries('chain')
      }

      window.ethereum.on('chainChanged', invalidateChain)

      return () => {
        window.ethereum.removeListener('chainChanged', invalidateChain)
      }
    }
  }, [queryClient])

  return (
    <VStack spacing={20}>
      <Head>
        <title>Realm</title>
      </Head>

      <Heading as="h1" mt="10" mb="0" textAlign={'center'}>
        Choose your Realm
      </Heading>
      <Search />
    </VStack>
  )
}
