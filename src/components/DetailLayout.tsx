import type { ReactNode } from 'react'

import { useRouter } from 'next/router'
import Head from 'next/head'
import NextLink from 'next/link'

import { Grid, Heading, Link, Skeleton, VStack } from '@chakra-ui/react'
import { useQuery } from 'react-query'

import { getNameForRealm } from '../lib/queries'
import { useAccount } from '../lib/hooks'

type DetailLayoutProps = {
  children: ReactNode
}

export default function DetailLayout({ children }: DetailLayoutProps) {
  const router = useRouter()

  const { id } = router.query
  const { account } = useAccount()

  const name = useQuery(['realm-name', String(id)], getNameForRealm, {
    enabled: Boolean(account) && Boolean(id),
  })

  const subpage = router.pathname.endsWith('/farms') ? "'s Farms" : ''

  return (
    <>
      <Head>
        {name.data ? (
          <title>
            {name.data} (#{id}) | Realm
          </title>
        ) : null}
      </Head>
      <Grid
        h="calc(100vh - 69px)"
        templateColumns="12vw 83vw"
        templateRows="max-content 1fr"
        mb="-2.5rem"
        w="100vw"
      >
        <VStack
          align="start"
          bg="gray.50"
          borderRight="1px solid #ffb30080"
          gridRow="1 / span 2"
          px="4"
          pt="2"
          spacing={2}
        >
          <NextLink href={`/realm/${id}`} passHref>
            <Link py="2">Info</Link>
          </NextLink>
          <NextLink href={`/realm/${id}/farms`} passHref>
            <Link py="2">Farms</Link>
          </NextLink>
        </VStack>
        <Heading textAlign="center" as="h1" py="10" size="2xl">
          {name.status === 'success' ? (
            `${name.data}${subpage}`
          ) : (
            <Skeleton height="30px" />
          )}
        </Heading>

        <VStack spacing={10} pb="10">
          {children}
        </VStack>
      </Grid>
    </>
  )
}
