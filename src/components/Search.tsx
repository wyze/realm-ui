import { useRouter } from 'next/router'
import { useState } from 'react'
import NextLink from 'next/link'

import { ArrowRight } from 'lucide-react'
import { IconButton, Input, InputGroup, Link } from '@chakra-ui/react'

import { usePrefetchRealm } from '../lib/queries'

export default function Search() {
  const prefetchRealm = usePrefetchRealm()
  const router = useRouter()
  const [id, setId] = useState('')
  const realmId = id.trim()

  return (
    <InputGroup>
      <Input
        onChange={(event) => setId(event.target.value)}
        onKeyPress={(event) => {
          if (event.key === 'Enter' && Boolean(realmId)) {
            prefetchRealm(realmId)
            router.push(`/realm/${realmId}`)
          }
        }}
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
          onMouseEnter={() => prefetchRealm(realmId)}
          variant="link"
        />
      </NextLink>
    </InputGroup>
  )
}
