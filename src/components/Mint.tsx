import { ethers } from 'ethers'
import { useEffect } from 'react'
import NextLink from 'next/link'

import { ArrowRight } from 'lucide-react'
import { Button, HStack, Input, Link, VStack, useToast } from '@chakra-ui/react'
import { createModel } from 'xstate/lib/model'
import { useMachine } from '@xstate/react'
import { useMutation, useQueryClient } from 'react-query'

import { getRealmById } from '../lib/queries'
import { getRealmContract } from '../lib/contract'
import { useAccount } from '../lib/hooks'

const mintPrice = '0.01'

const realmModel = createModel(
  {
    account: '',
    id: '',
    name: '',
  },
  {
    events: {
      mint: () => ({}),
      reset: () => ({}),
      reverted: () => ({}),
      updateAccount: (value: string) => ({ value }),
      updateId: (value: string) => ({ value }),
      updateName: (value: string) => ({ value }),
    },
  }
)

const machine = realmModel.createMachine(
  {
    context: realmModel.initialContext,
    initial: 'invalid',
    on: {
      updateAccount: {
        actions: realmModel.assign({ account: (_, event) => event.value }),
        target: '.validating',
      },
      updateId: {
        actions: realmModel.assign({ id: (_, event) => event.value }),
        target: '.validating',
      },
      updateName: {
        actions: realmModel.assign({ name: (_, event) => event.value }),
        target: '.validating',
      },
    },
    states: {
      invalid: {},
      valid: {
        on: {
          mint: 'minting',
        },
      },
      validating: {
        after: {
          0: [{ target: 'valid', cond: 'isValid' }],
          300: 'invalid',
        },
      },
      minting: {
        on: {
          reset: {
            actions: realmModel.assign({ id: '', name: '' }),
            target: 'invalid',
          },
          reverted: 'valid',
        },
      },
    },
  },
  {
    guards: {
      isValid: (context) => {
        const id = Number(context.id.trim())
        const name = context.name.trim()

        return !isNaN(id) && [context.account, id, name].every(Boolean)
      },
    },
  }
)

export default function Mint() {
  const queryClient = useQueryClient()
  const toast = useToast()

  const { account, status } = useAccount()
  const [state, send] = useMachine(machine)

  const mint = useMutation(
    async () => {
      send(realmModel.events.mint())

      const transaction = await getRealmContract().claim(
        state.context.id,
        state.context.name,
        { value: ethers.utils.parseEther(mintPrice) }
      )

      await transaction.wait()

      return transaction.hash
    },
    {
      onError: (error: { message: string }) => {
        send(realmModel.events.reverted())

        const description = error.message.includes('version=providers/5.4.5')
          ? 'Unknown error occurred'
          : error.message

        toast({
          title: 'Error',
          description,
          status: 'error',
          duration: 7000,
          isClosable: true,
        })
      },
      onSuccess: () => {
        queryClient.invalidateQueries('current-tokens')
        queryClient.prefetchQuery(['realm', state.context.id], getRealmById)

        toast({
          title: 'Realm Created',
          status: 'success',
          duration: 7000,
          isClosable: true,
        })
      },
    }
  )

  useEffect(() => {
    if (window.ethereum) {
      getRealmContract().on('RealmCreated', () => {
        queryClient.invalidateQueries('current-tokens')
      })
    }
  }, [queryClient])

  useEffect(() => {
    send(realmModel.events.updateAccount(account))
  }, [account, send])

  return (
    <VStack spacing="-px" w="100%">
      {mint.status !== 'success' ? (
        <>
          <Input
            borderRadius={0}
            borderTopLeftRadius="md"
            borderTopRightRadius="md"
            isDisabled={mint.status === 'loading'}
            onChange={(event) =>
              send(realmModel.events.updateName(event.target.value))
            }
            placeholder="Name"
            value={state.context.name}
          />
          <HStack spacing="-px">
            <Input
              borderBottomLeftRadius="md"
              borderRadius={0}
              flexBasis="50%"
              isDisabled={mint.status === 'loading'}
              onChange={(event) =>
                send(realmModel.events.updateId(event.target.value))
              }
              placeholder="Realm ID"
              type="number"
              value={state.context.id}
            />
            <Button
              borderBottomLeftRadius={0}
              borderTopLeftRadius={0}
              borderTopRightRadius={0}
              colorScheme="brand"
              isDisabled={!state.matches('valid')}
              isFullWidth
              isLoading={status === 'loading' || mint.status === 'loading'}
              onClick={() => mint.mutate()}
              variant="outline"
            >
              Create Realm for {mintPrice}
            </Button>
          </HStack>
        </>
      ) : (
        <>
          <Button
            borderBottomLeftRadius={0}
            borderBottomRightRadius={0}
            colorScheme="yellow"
            isFullWidth
            onClick={() => {
              send(realmModel.events.reset())
              mint.reset()
            }}
            variant="outline"
          >
            Reset
          </Button>
          <NextLink href={`/realm/${state.context.id}`} passHref>
            <Button
              as={Link}
              borderTopLeftRadius={0}
              borderTopRightRadius={0}
              colorScheme="teal"
              isFullWidth
              rightIcon={<ArrowRight />}
              sx={{ '&:hover': { textDecoration: 'none' } }}
              variant="outline"
            >
              View Realm {state.context.id}
            </Button>
          </NextLink>
        </>
      )}
    </VStack>
  )
}
