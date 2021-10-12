import type { ReactNode } from 'react'

import { Box } from '@chakra-ui/react'

type RealmBoxProps = {
  children: ReactNode
  w?: string
}

export default function RealmBox({ children, w = '55vw' }: RealmBoxProps) {
  return (
    <Box
      borderLeft="1px solid #ffb30080"
      borderTop="2px solid #ffb300"
      boxShadow="10px 9px 0 #444"
      w={w}
    >
      {children}
    </Box>
  )
}
