import { Button, Flex, HStack, Text, useBoolean } from '@chakra-ui/react'
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
    <HStack display="flex" justifyContent="flex-end" maxW="container.lg">
      {account ? (
        <Flex
          align="center"
          bg="brand.600"
          borderRadius="sm"
          onMouseEnter={setHover.on}
          onMouseLeave={setHover.off}
          px="2"
          py="1"
          gridGap="3"
        >
          <Text color="white" display="flex" fontSize="sm">
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
          size="sm"
          m="-1.5px"
        >
          Connect Wallet
        </Button>
      )}
    </HStack>
  )
}
