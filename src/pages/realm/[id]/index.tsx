import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import NextLink from 'next/link'

import {
  Button,
  HStack,
  Heading,
  Link,
  Spinner,
  Tag,
  TagCloseButton,
  TagLabel,
  Tooltip,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { Home } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import { getRealmById } from '../../../lib/queries'
import { getRealmContract } from '../../../lib/contract'
import { useAccount, useIsRealmOwner, useRealmTimers } from '../../../lib/hooks'
import Actions from '../../../components/Actions'
import DetailLayout from '../../../components/DetailLayout'
import RealmAttribute from '../../../components/RealmAttribute'
import RealmBox from '../../../components/RealmBox'
import Resources from '../../../components/Resources'
import Timers from '../../../components/Timers'

const isValidFeature = (featureId: number): featureId is 0 | 1 | 2 =>
  featureId < 3

export default function Realm() {
  const isRealmOwner = useIsRealmOwner()
  const queryClient = useQueryClient()
  const router = useRouter()
  const toast = useToast()

  const { id } = router.query
  const { account } = useAccount()

  const realm = useQuery(['realm', String(id)], getRealmById, {
    enabled: Boolean(account) && Boolean(id),
  })

  const { canTerraform } = useRealmTimers()

  const terraform = useMutation(
    async (feature: 0 | 1 | 2) => {
      const transaction = await getRealmContract().terraform(
        ethers.BigNumber.from(id),
        feature
      )

      await transaction.wait()
    },
    {
      onError: (error: { message: string }) => {
        const description = error.message.includes('version=providers/5.4.5')
          ? 'Unknown error occurred'
          : error.message

        toast({
          title: 'Terraform Error',
          description,
          status: 'error',
          duration: 7000,
          isClosable: true,
        })
      },
      onSuccess: () => {
        queryClient.invalidateQueries(
          [
            ['realm', id],
            ['realm', id, 'timers'],
          ],
          { exact: true }
        )

        toast({
          title: 'Realm terraformed successfully!',
          status: 'success',
          duration: 7000,
          isClosable: true,
        })
      },
    }
  )

  if (realm.status === 'error') {
    return (
      <VStack spacing={20}>
        <Heading>Realm not found!</Heading>
        <NextLink href="/" passHref>
          <Button
            as={Link}
            colorScheme="linkedin"
            isFullWidth
            rightIcon={<Home size={16} />}
            sx={{ '&:hover': { textDecoration: 'none' } }}
          >
            Go Home
          </Button>
        </NextLink>
      </VStack>
    )
  }

  if (realm.status === 'loading') {
    return (
      <DetailLayout>
        <Spinner justifySelf="center" mt="10ch" size="xl" />
      </DetailLayout>
    )
  }

  if (!realm.data) {
    return null
  }

  const data = realm.data

  return (
    <DetailLayout>
      <RealmBox>
        <HStack justify="center" h={225} px={20} py={5} spacing={10}>
          <VStack align="flex-start" spacing={5} minW="20vw">
            <HStack spacing={10}>
              <RealmAttribute title="Age">
                {formatDistanceToNow(new Date(data.createdAt))}
              </RealmAttribute>
              <RealmAttribute title="Cities">{data.cities}</RealmAttribute>
            </HStack>
            <RealmAttribute title="Land Size">
              {data.size.toLocaleString()} sq mi
            </RealmAttribute>
            <RealmAttribute title="Geographical Features">
              <HStack spacing={2}>
                {data.features.map(({ feature }, index) => (
                  <Tag key={feature}>
                    <TagLabel>{feature}</TagLabel>
                    {canTerraform && isRealmOwner && isValidFeature(index) ? (
                      <Tooltip
                        label="Terraform"
                        placement="top"
                        shouldWrapChildren
                      >
                        <TagCloseButton
                          onClick={() => terraform.mutate(index)}
                        />
                      </Tooltip>
                    ) : null}
                  </Tag>
                ))}
              </HStack>
            </RealmAttribute>
          </VStack>
        </HStack>
      </RealmBox>
      <Actions />
      <Resources />
      <Timers />
    </DetailLayout>
  )
}
