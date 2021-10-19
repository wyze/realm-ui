import { useRouter } from 'next/router'

import { HStack, Skeleton } from '@chakra-ui/react'
import { useQuery } from 'react-query'

import { Resource } from './Resources'
import { formatDistanceToNow } from 'date-fns'
import { getQueueForRealm } from '../lib/queries'
import { useAccount, useRealmTimers } from '../lib/hooks'
import RealmAttribute from './RealmAttribute'
import RealmSection from './RealmSection'

export default function BuildQueue() {
  const router = useRouter()

  const { id } = router.query
  const { account } = useAccount()
  const { canBuild } = useRealmTimers()

  const queue = useQuery(['realm', String(id), 'queue'], getQueueForRealm, {
    enabled: Boolean(account) && Boolean(id),
  })

  return (
    <RealmSection title="Build Queue">
      <HStack align="flex-start" spacing={10}>
        {queue.status === 'success' ? (
          <>
            <RealmAttribute title="Queue">{queue.data.queue}</RealmAttribute>
            {canBuild ? null : (
              <RealmAttribute title="Slot Freed">
                {formatDistanceToNow(queue.data.buildTime)}
              </RealmAttribute>
            )}
            {queue.data.gainSlot.value === '0/0' ? null : (
              <RealmAttribute title="Gain Slot">
                <Resource
                  sx={{ marginTop: '0 !important' }}
                  {...queue.data.gainSlot}
                />
              </RealmAttribute>
            )}
          </>
        ) : (
          <>
            <RealmAttribute title="Queue">
              <Skeleton height="20px" w="60px" />
            </RealmAttribute>
            <RealmAttribute title="Slot Freed">
              <Skeleton height="20px" w="60px" />
            </RealmAttribute>
            <RealmAttribute title="Gain Slot">
              <Skeleton height="20px" w="60px" />
            </RealmAttribute>
          </>
        )}
      </HStack>
    </RealmSection>
  )
}
