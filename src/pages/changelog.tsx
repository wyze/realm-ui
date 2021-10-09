import Head from 'next/head'

import { Divider, HStack, Heading, Text, VStack } from '@chakra-ui/react'

export default function Changelog() {
  return (
    <>
      <Head>
        <title>Changelog | Realm</title>
      </Head>

      <VStack align="flex-start" spacing={30} w="70vw">
        <Heading fontWeight="normal" mb="10">
          Changelog
        </Heading>
        <HStack align="flex-start" h={250} spacing={50}>
          <Text minW={140}>October 8th, 2021</Text>
          <Divider orientation="vertical" />
          <VStack align="flex-start">
            <Heading as="h4" fontWeight="semibold" mb="2" size="md">
              Initial public release
            </Heading>
            <Text>Hello traveller! I&apos;m glad you found us.</Text>
            <Text>
              With our first iteration, we allow you to create your Realm. Once
              you create your Realm, you can go view{' '}
              <strong>basic stats</strong> about it.
            </Text>
            <Text>
              You also have the option to <strong>terraform</strong> (destroy) a
              feature of your Realm. Choose carefully, as you can only terraform
              once per year!
            </Text>
          </VStack>
        </HStack>
      </VStack>
    </>
  )
}
