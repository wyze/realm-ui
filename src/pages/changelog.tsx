import type { ReactNode } from 'react'

import Head from 'next/head'

import { Divider, Grid, Heading, Text, VStack } from '@chakra-ui/react'

type ChangelogSectionProps = {
  children: ReactNode
}

function ChangelogDivider() {
  return <Divider orientation="vertical" h="calc(100% + 50px)" ml="30px" />
}

function ChangelogSection({ children }: ChangelogSectionProps) {
  return (
    <Grid templateColumns="max-content 60px 1fr" pb="50px">
      {children}
    </Grid>
  )
}

export default function Changelog() {
  return (
    <>
      <Head>
        <title>Changelog | Realm</title>
      </Head>

      <VStack align="flex-start" spacing={0} w="70vw">
        <Heading fontWeight="normal" py="20">
          Changelog
        </Heading>
        <ChangelogSection>
          <Text minW={140}>October 12th, 2021</Text>
          <ChangelogDivider />
          <VStack align="flex-start">
            <Heading as="h4" fontWeight="semibold" mb="2" size="md">
              UI, resources, cities, timers, and actions too!
            </Heading>
            <Text>
              First and foremost, we have updated some UI to be more in line
              with Realm&apos;s branding.
            </Text>
            <Text>
              We have added information about your <strong>cities</strong>. This
              includes total number of cities you have as well as a timer for
              when you can build your next one. This will either be a time delay
              or a gold delay. Also, once you meet the requirements you can
              build your city right here too!
            </Text>
            <Text>
              Next, we added all you need to know about your available
              resources. This includes the amount per turn you get for{' '}
              <strong>Gold</strong> and <strong>Religion</strong>, based on your
              built cities.
            </Text>
            <Text>
              Additionally, we added a <strong>Timers</strong> section. In here
              you can see when you can do your next actions for various things.
              Currently, we track <strong>Terraform</strong>,{' '}
              <strong>Build City</strong>, and <strong>Collect</strong>.
            </Text>
            <Text>
              Which brings us to our last feature, the ability to{' '}
              <strong>collect</strong> your per turn resources. If available,
              you will see an <strong>Actions</strong> section in your Realm
              detail view that you can interact with.
            </Text>
            <Text>
              A few more small changes. You can now use the{' '}
              <strong>Enter</strong> key when searching for your Realm. We have
              widened the panel with your Realm name to see more of it. Also,
              handle cases of UTF-8 encoded names.
            </Text>
          </VStack>
        </ChangelogSection>
        <ChangelogSection>
          <Text minW={140}>October 8th, 2021</Text>
          <ChangelogDivider />
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
        </ChangelogSection>
      </VStack>
    </>
  )
}
