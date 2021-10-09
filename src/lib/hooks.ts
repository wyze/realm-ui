import { useEffect } from 'react'

import { useBoolean } from '@chakra-ui/react'
import { useQuery } from 'react-query'

export function useAccount() {
  const [enabled, setEnabled] = useBoolean()
  const { data: [account] = [], status } = useQuery(
    'accounts',
    () => window.ethereum.request<string[]>({ method: 'eth_accounts' }),
    { enabled }
  )

  useEffect(() => {
    if (window.ethereum) {
      setEnabled.on()
    }
  }, [setEnabled])

  return { account, status }
}
