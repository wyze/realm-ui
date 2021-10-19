import { useEffect } from 'react'
import NextLink from 'next/link'

import { Box, Container, Flex, Heading, Link } from '@chakra-ui/react'
import { ExternalLink } from 'lucide-react'
import { useQueryClient } from 'react-query'

import { address } from '../lib/contract'
import { explorer, name } from '../lib/chain'
import { useAccount } from '../lib/hooks'
import Wallet from './Wallet'

type LayoutProps = {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const queryClient = useQueryClient()
  const { account } = useAccount()

  useEffect(() => {
    if (account) {
      queryClient.setDefaultOptions({ queries: { enabled: true } })
      queryClient.invalidateQueries()
    }
  }, [account, queryClient])

  return (
    <Flex direction="column" flex="1" minHeight="100vh" pb="10">
      <Box boxShadow="md" bg="brand.900">
        <Flex align="center" p="5">
          <Heading size="md">
            <NextLink href="/">Realm</NextLink>
          </Heading>

          <Flex align="center" gridGap={5} ml="auto">
            <Wallet />
            <NextLink href="/changelog" passHref>
              <Link fontWeight="bold">Changelog</Link>
            </NextLink>
            <Link
              href={`https://${explorer}/address/${address}`}
              isExternal
              display="flex"
              alignItems="center"
              gridGap={2}
            >
              {name} <ExternalLink height={18} width={18} />
            </Link>
            <Link
              href="https://github.com/wyze/realm-ui"
              isExternal
              display="flex"
              alignItems="center"
              gridGap={2}
            >
              GitHub <ExternalLink height={18} width={18} />
            </Link>
          </Flex>
        </Flex>
      </Box>
      <Container centerContent justifyContent="center" maxW="container.xl">
        {children}
      </Container>
    </Flex>
  )
}
