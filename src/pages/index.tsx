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

      <HStack h={650} px={10} py={5} spacing={10} w="60vw">
        <VStack spacing={150} w="20vw">
          <Heading as="h3" size="md">
            Total Realms
          </Heading>
          <Heading as="h3" size="md">
            Create Realm
          </Heading>
          <Heading as="h3" size="md">
            View Realm
          </Heading>
        </VStack>
        <Divider borderColor="brand.900" orientation="vertical" />
        <VStack spacing={115}>
          <Heading>{currentTokens.data}</Heading>
          <Mint />
          <Search />
        </VStack>
      </HStack>
    </VStack>
  )
}
