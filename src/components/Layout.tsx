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
    <Flex direction="column" flex="1" minHeight="100vh">
      <Box boxShadow="md">
        <Flex align="center" p="5">
          <Heading color="cyan.700" size="md">
            <NextLink href="/">Realm</NextLink>
          </Heading>

          <Flex gridGap={5} ml="auto">
            <NextLink href="/changelog" passHref>
              <Link color="gray.500" fontWeight="bold">Changelog</Link>
            </NextLink>
            <Link
              href={`https://${explorer}/address/${address}`}
              color="blue.600"
              isExternal
              display="flex"
              alignItems="center"
              gridGap={2}
            >
              {name} <ExternalLink height={18} width={18} />
            </Link>
            <Link
              href="https://github.com/wyze/realm-ui"
              color="blue.600"
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
      <Container
        centerContent
        justifyContent="center"
        mt="3ch"
        maxW="container.xl"
      >
        <Wallet />
        <Box mb="6ch" />
        {children}
      </Container>
    </Flex>
  )
}
