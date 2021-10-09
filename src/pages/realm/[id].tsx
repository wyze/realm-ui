import type { ReactNode } from 'react'

import { ethers } from 'ethers'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import NextLink from 'next/link'

import {
  Button,
  Divider,
  HStack,
  Heading,
  Link,
  Spinner,
  Tag,
  TagCloseButton,
  TagLabel,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { Home } from 'lucide-react'
import { actions } from 'xstate'
import { formatDistanceToNow, isAfter } from 'date-fns'
import { createModel } from 'xstate/lib/model'
import { useMachine } from '@xstate/react'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import { getRealmById } from '../../lib/queries'
import { getRealmContract } from '../../lib/contract'
import { useAccount } from '../../lib/hooks'

const realmModel = createModel(
  {},
  {
    events: {
      init: (
        owner: boolean,
        terraformTime: number,
        blockTimestamp: number
      ) => ({
        blockTimestamp,
        owner,
        terraformTime,
      }),
      reverted: () => ({}),
      terraformable: () => ({}),
      terraforming: () => ({}),
      terraformed: () => ({}),
    },
  }
)

const machine = realmModel.createMachine(
  {
    context: realmModel.initialContext,
    id: 'realm-actions',
    initial: 'unknown',
    states: {
      owner: {
        type: 'parallel',
        states: {
          terraformable: {
            initial: 'no',
            states: {
              no: {
                entry: actions.choose([
                  {
                    actions: actions.send(realmModel.events.terraformable()),
                    cond: 'isTerraformable',
                  },
                ]),
                on: {
                  terraformable: 'yes',
                },
              },
              pending: {
                on: {
                  reverted: 'yes',
                  terraformed: 'no',
                },
              },
              yes: {
                on: {
                  terraforming: 'pending',
                },
              },
            },
          },
        },
      },
      unknown: {
        on: {
          init: [{ target: 'owner', cond: 'isOwner' }, 'viewer'],
        },
      },
      viewer: {},
    },
  },
  {
    guards: {
      isOwner: (_, event) => (event.type === 'init' ? event.owner : false),
      isTerraformable: (_, event) =>
        event.type === 'init'
          ? event.terraformTime === 1000 ||
            isAfter(event.blockTimestamp, event.terraformTime)
          : false,
    },
  }
)

const isValidFeature = (featureId: number): featureId is 0 | 1 | 2 =>
  featureId < 3

type RealmAttributeProps = {
  children: ReactNode
  title: string
}

function RealmAttribute({ children, title }: RealmAttributeProps) {
  return (
    <VStack align="flex-start" spacing={2}>
      <Heading as="h4" size="md">
        {title}
      </Heading>
      <>{children}</>
    </VStack>
  )
}

export default function Realm() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const id = String(router.query.id)
  const { account } = useAccount()

  const [state, send] = useMachine(machine)

  const realm = useQuery(['realm', id], getRealmById, { enabled: Boolean(id) })

  const blockTimestamp = useQuery('block-timestamp', async () => {
    const { provider } = getRealmContract()
    const blockNumber = await provider.getBlockNumber()
    const block = await provider.getBlock(blockNumber)

    return block.timestamp * 1000
  })

  const terraform = useMutation(
    async (feature: 0 | 1 | 2) => {
      const transaction = await getRealmContract().terraform(
        ethers.BigNumber.from(id),
        feature
      )

      await transaction.wait()
    },
    {
      onError: () => {
        send(realmModel.events.reverted())
      },
      onSuccess: () => {
        queryClient.invalidateQueries([['realm', id]])
        send(realmModel.events.terraformed())
      },
    }
  )

  useEffect(() => {
    if (realm.status === 'success' && blockTimestamp.status === 'success') {
      send(
        realmModel.events.init(
          account === realm.data.owner,
          realm.data.terraformTime,
          blockTimestamp.data
        )
      )
    }
  }, [
    account,
    blockTimestamp.data,
    blockTimestamp.status,
    realm.data?.owner,
    realm.data?.terraformTime,
    realm.status,
    send,
  ])

  if (realm.status === 'error') {
    return (
      <VStack spacing={20}>
        <Heading>Realm not found!</Heading>
        <NextLink href="/" passHref>
          <Button
            as={Link}
            colorScheme="linkedin"
            isFullWidth
            rightIcon={<Home />}
            sx={{ '&:hover': { textDecoration: 'none' } }}
          >
            Go Home
          </Button>
        </NextLink>
      </VStack>
    )
  }

  if (realm.status === 'loading') {
    return <Spinner mt="10ch" size="xl" />
  }

  if (!realm.data) {
    return null
  }

  const data = realm.data

  return (
    <>
      <Head>
        {data.name ? (
          <title>
            {data.name} (#{id}) | Realm
          </title>
        ) : null}
      </Head>
      <HStack
        borderRadius="md"
        boxShadow="lg"
        h={300}
        px={20}
        py={5}
        spacing={10}
      >
        <Heading>{data.name}</Heading>
        <Divider orientation="vertical" />
        <VStack align="flex-start" spacing={5}>
          <RealmAttribute title="Age">
            {formatDistanceToNow(new Date(data.createdAt))}
          </RealmAttribute>
          {state.matches('owner.terraformable.no') ? (
            <RealmAttribute title="Counters">
              Can terraform again in{' '}
              {formatDistanceToNow(new Date(data.terraformTime))}.
            </RealmAttribute>
          ) : null}
          <RealmAttribute title="Land Size">
            {data.size.toLocaleString()} sq mi
          </RealmAttribute>
          <RealmAttribute title="Geographical Features">
            <HStack spacing={2}>
              {data.features.map(({ feature }, index) => (
                <Tag key={feature}>
                  <TagLabel>{feature}</TagLabel>
                  {state.matches('owner.terraformable.yes') &&
                  isValidFeature(index) ? (
                    <Tooltip
                      label="Terraform"
                      placement="top"
                      shouldWrapChildren
                    >
                      <TagCloseButton onClick={() => terraform.mutate(index)} />
                    </Tooltip>
                  ) : null}
                </Tag>
              ))}
            </HStack>
          </RealmAttribute>
        </VStack>
      </HStack>
    </>
  )
}
