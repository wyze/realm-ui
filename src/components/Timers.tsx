import { HStack, Skeleton } from '@chakra-ui/react'
import { formatDistanceToNow } from 'date-fns'

import { useRealmTimers } from '../lib/hooks'
import RealmAttribute from './RealmAttribute'
import RealmSection from './RealmSection'

export default function Timers() {
  const {
    canBuildCity,
    canCollect,
    canTerraform,
    hasEnoughGoldForCity,
    timers,
  } = useRealmTimers()

  if (
    timers.status === 'success' &&
    [canBuildCity, canCollect, canTerraform].every(Boolean)
  ) {
    return null
  }

  return (
    <RealmSection title="Timers">
      <HStack align="flex-start" spacing={10}>
        {timers.status === 'success' ? (
          <>
            {canTerraform ? null : (
              <RealmAttribute title="Terraform">
                {formatDistanceToNow(timers.data.terraformTime)}
              </RealmAttribute>
            )}
            {canBuildCity ? null : (
              <RealmAttribute title="Build City">
                {hasEnoughGoldForCity
                  ? formatDistanceToNow(timers.data.collectTime)
                  : `${timers.data.nextCityCost - timers.data.gold} gold`}
              </RealmAttribute>
            )}
            {canCollect ? null : (
              <RealmAttribute title="Collect">
                {formatDistanceToNow(timers.data.collectTime)}
              </RealmAttribute>
            )}
          </>
        ) : (
          <>
            <RealmAttribute title="Terraform">
              <Skeleton height="20px" w="60px" />
            </RealmAttribute>
            <RealmAttribute title="Build City">
              <Skeleton height="20px" w="60px" />
            </RealmAttribute>
            <RealmAttribute title="Collect">
              <Skeleton height="20px" w="60px" />
            </RealmAttribute>
          </>
        )}
      </HStack>
    </RealmSection>
  )
}
