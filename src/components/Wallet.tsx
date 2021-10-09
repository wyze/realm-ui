import { Button, Container, Flex, Text, useBoolean } from '@chakra-ui/react'
import { useMutation, useQueryClient } from 'react-query'

export default function Wallet() {
  const [hovered, setHover] = useBoolean()
  const queryClient = useQueryClient()

  const [[, [account] = []]] = queryClient.getQueriesData<string[] | undefined>(
    'accounts'
  )
  const connect = useMutation(
    () => window.ethereum.request({ method: 'eth_requestAccounts' }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('accounts')
      },
    }
  )

  return (
    <Container display="flex" justifyContent="flex-end" maxW="container.lg">
      {account ? (
        <Flex
          align="center"
          bg="teal.50"
          borderRadius="md"
          onMouseEnter={setHover.on}
          onMouseLeave={setHover.off}
          p="2"
          gridGap="3"
        >
          <Text display="flex" fontSize="sm">
            <Text
              as="span"
              display="inline-block"
              w={hovered ? 304 : 65}
              mr={hovered ? '-1px' : '-4px'}
              overflow="hidden"
              textOverflow="ellipsis"
              transition="all 300ms linear"
              transitionProperty="margin-right, width"
              whiteSpace="nowrap"
            >
              {account.slice(0, -4)}
            </Text>
            {account.slice(-4)}
          </Text>
        </Flex>
      ) : (
        <Button
          colorScheme="orange"
          isLoading={connect.status === 'loading'}
          onClick={() => connect.mutate()}
        >
          Connect Wallet
        </Button>
      )}
    </Container>
  )
}
