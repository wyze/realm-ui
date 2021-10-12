import type { ReactNode } from 'react'

import { Divider, Heading, VStack } from '@chakra-ui/react'

import RealmBox from './RealmBox'

type RealmSectionProps = {
  children: ReactNode
  heading?: ReactNode
  title: string
}

export default function RealmSection({ children, title }: RealmSectionProps) {
  return (
    <RealmBox>
      <VStack align="flex-start" p={5}>
        <Heading as="h3" size="lg">
          {title}
        </Heading>
        <Divider />
        <>{children}</>
      </VStack>
    </RealmBox>
  )
}
