import { ethers } from 'ethers'
import { useRouter } from 'next/router'

import {
  Button,
  HStack,
  SimpleGrid,
  Skeleton,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { Hammer } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import { getFarmsForRealm } from '../../../lib/queries'
import { getFarmContract } from '../../../lib/contract'
import { useAccount, useRealmTimers } from '../../../lib/hooks'
import DetailLayout from '../../../components/DetailLayout'
import RealmSection from '../../../components/RealmSection'

type ResourceProps = {
  icon: string
  name: string
  value: number
}

function Resource({ icon, name, value }: ResourceProps) {
  return (
    <HStack spacing={3}>
      <Text>{icon}</Text>
      <Text fontSize="sm">{name}:</Text>
      <Text fontSize="sm" fontWeight="semibold">
        {value.toLocaleString()}
      </Text>
    </HStack>
  )
}

export default function Farms() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const toast = useToast()

  const { id } = router.query
  const { account } = useAccount()
  const { canBuild } = useRealmTimers()

  const farms = useQuery(['realm', String(id), 'farms'], getFarmsForRealm, {
    enabled: Boolean(account) && Boolean(id),
  })

  const build = useMutation(
    async () => {
      const bnId = ethers.BigNumber.from(id)
      const transaction = await getFarmContract().build(bnId, 0, {
        gasLimit: 300_000,
      })

      await transaction.wait()
    },
    {
      onError: (error: { message: string }) => {
        const description = error.message.includes('version=providers/5.4.5')
          ? 'Unknown error occurred'
          : error.message

        toast({
          title: 'Farm Build Error',
          description,
          status: 'error',
          duration: 7000,
          isClosable: true,
        })
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['realm', id])

        toast({
          title: 'Farm built successfully!',
          status: 'success',
          duration: 7000,
          isClosable: true,
        })
      },
    }
  )

  return (
    <DetailLayout>
      <RealmSection title="Resources">
        <VStack align="flex-start" w="100%">
          {farms.status === 'success' ? (
            <SimpleGrid columns={3} w="100%">
              {farms.data.resources.slice(1).map((resource) => (
                <Resource key={resource.name} {...resource} />
              ))}
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
      {farms.status === 'success' ? (
        <RealmSection title="Farms">
          <SimpleGrid columns={3} w="100%">
            {Object.keys(farms.data.farms).map((name) => (
              <Resource key={name} {...farms.data.farms[name]} />
            ))}
          </SimpleGrid>
        </RealmSection>
      ) : null}
      {canBuild ? (
        <Button
          borderRadius="none"
          colorScheme="brand"
          flexDirection="column"
          h={40}
          isLoading={build.status === 'loading'}
          justifyContent="space-around"
          onClick={() => build.mutate()}
          py={7}
          rightIcon={<Hammer height={50} width={50} />}
          sx={{
            '&:hover': {
              boxShadow: '5px 4px 0 #444',
            },
            transition: 'box-shadow 300ms linear',
          }}
          variant="outline"
          w={60}
        >
          Build A Farm
        </Button>
      ) : null}
    </DetailLayout>
  )
}
