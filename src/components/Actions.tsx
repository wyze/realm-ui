import { useCallback } from 'react'
import { useRouter } from 'next/router'

import { ethers } from 'ethers'

import { Button, HStack, useToast } from '@chakra-ui/react'
import { useMutation, useQueryClient } from 'react-query'

import { getCityContract, getDataContract } from '../lib/contract'
import { useIsRealmOwner, useRealmTimers } from '../lib/hooks'
import RealmSection from './RealmSection'

export default function Actions() {
  const isRealmOwner = useIsRealmOwner()
  const queryClient = useQueryClient()
  const router = useRouter()
  const toast = useToast()

  const { id } = router.query
  const { canBuildCity, canCollect, timers } = useRealmTimers()

  const createOnError = useCallback(
    (title: string) => (error: { message: string }) => {
      const description = error.message.includes('version=providers/5.4.5')
        ? 'Unknown error occurred'
        : error.message

      toast({
        title,
        description,
        status: 'error',
        duration: 7000,
        isClosable: true,
      })
    },
    [toast]
  )

  const createOnSuccess = useCallback(
    (title: string) => () => {
      queryClient.invalidateQueries([['realm', id]])

      toast({
        title,
        status: 'success',
        duration: 7000,
        isClosable: true,
      })
    },
    [id, queryClient, toast]
  )

  const build = useMutation(
    async () => {
      const transaction = await getCityContract().build(
        ethers.BigNumber.from(id)
      )

      await transaction.wait()
    },
    {
      onError: createOnError('City Building Error'),
      onSuccess: createOnSuccess('City built successfully!'),
    }
  )

  const collect = useMutation(
    async () => {
      const transaction = await getDataContract().collect(
        ethers.BigNumber.from(id)
      )

      await transaction.wait()
    },
    {
      onError: createOnError('Collection Error'),
      onSuccess: createOnSuccess('Collected resources successfully!'),
    }
  )

  if (
    !isRealmOwner ||
    timers.status !== 'success' ||
    (timers.status === 'success' && !canCollect && !canBuildCity)
  ) {
    return null
  }

  return (
    <RealmSection title="Actions">
      <HStack align="flex-start">
        {canCollect ? (
          <Button
            isLoading={collect.status === 'loading'}
            onClick={() => collect.mutate()}
            size="xs"
            variant="outline"
          >
            Collect
          </Button>
        ) : null}
        {canBuildCity ? (
          <Button
            isLoading={build.status === 'loading'}
            onClick={() => build.mutate()}
            size="xs"
            variant="outline"
          >
            Build City
          </Button>
        ) : null}
      </HStack>
    </RealmSection>
  )
}
