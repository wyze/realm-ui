import type { CSSObject } from '@chakra-ui/react'

import { useRouter } from 'next/router'

import {
  Box,
  HStack,
  SimpleGrid,
  Skeleton,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useQuery } from 'react-query'

import { getResourcesForRealm } from '../lib/queries'
import { useAccount } from '../lib/hooks'
import RealmSection from './RealmSection'

type ResourceProps = {
  color: string
  name: string
  perTurn?: number
  sx?: CSSObject
  value: number
}

function Resource({ color, name, perTurn, sx, value }: ResourceProps) {
  return (
    <HStack sx={sx}>
      <Box bg={color} h={3} w={3} />
      <Text fontSize="sm">{name}:</Text>
      <Text fontSize="sm" fontWeight="semibold">
        {value.toLocaleString()}
      </Text>
      {perTurn ? (
        <Text fontSize="sm">(+{perTurn.toLocaleString()} per turn)</Text>
      ) : null}
    </HStack>
  )
}

export default function Resources() {
  const router = useRouter()

  const { id } = router.query
  const { account } = useAccount()

  const resources = useQuery(
    ['realm', String(id), 'resources'],
    getResourcesForRealm,
    { enabled: Boolean(account) && Boolean(id) }
  )

  return (
    <RealmSection title="Resources">
      <VStack align="flex-start" w="100%">
        {resources.status === 'success' ? (
          <SimpleGrid gap={2} templateColumns="repeat(3, 33%)" w="100%">
            <Resource {...resources.data[0]} />
            <Resource
              {...resources.data[4]}
              sx={{ gridColumn: '2 / span 2' }}
            />
            <Resource {...resources.data[1]} />
            <Resource {...resources.data[2]} />
            <Resource {...resources.data[3]} />
            <Resource {...resources.data[5]} />
            <Resource {...resources.data[6]} />
          </SimpleGrid>
        ) : (
          <>
            <Skeleton height="20px" width="30vw" />
            <Skeleton height="20px" width="45vw" />
            <Skeleton height="20px" width="40vw" />
          </>
        )}
      </VStack>
    </RealmSection>
  )
}
