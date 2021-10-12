import type { ReactNode } from 'react'

import { Heading, VStack } from '@chakra-ui/react'

type RealmAttributeProps = {
  children: ReactNode
  title: string
}

export default function RealmAttribute({
  children,
  title,
}: RealmAttributeProps) {
  return (
    <VStack align="flex-start" spacing={2}>
      <Heading as="h4" size="md">
        {title}
      </Heading>
      <>{children}</>
    </VStack>
  )
}
