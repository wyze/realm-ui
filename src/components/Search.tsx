import { useState } from 'react'
import NextLink from 'next/link'

import { ArrowRight } from 'lucide-react'
import { IconButton, Input, InputGroup, Link } from '@chakra-ui/react'
import { useQueryClient } from 'react-query'

import { getRealmById } from '../lib/queries'

export default function Search() {
  const queryClient = useQueryClient()
  const [id, setId] = useState('')
  const realmId = id.trim()

  return (
    <InputGroup>
      <Input
        onChange={(event) => setId(event.target.value)}
        placeholder="Realm ID (e.g. 777)"
        type="number"
        value={id}
      />
      <NextLink href={`/realm/${realmId}`} passHref>
        <IconButton
          aria-label={`View Realm ${realmId}`}
          as={Link}
          color="blue.400"
          icon={<ArrowRight />}
          isDisabled={realmId === ''}
          ml="-px"
          onMouseEnter={() =>
            queryClient.prefetchQuery(['realm', realmId], getRealmById)
          }
          variant="link"
        />
      </NextLink>
    </InputGroup>
  )
}
