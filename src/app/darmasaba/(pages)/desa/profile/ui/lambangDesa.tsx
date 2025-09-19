/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile'
import colors from '@/con/colors'
import { Box, Center, Image, Paper, Skeleton, Stack, Text, Tooltip } from '@mantine/core'
import { useEffect } from 'react'
import { useProxy } from 'valtio/utils'

function LambangDesa() {
  const state = useProxy(stateProfileDesa.lambangDesa)

  useEffect(() => {
    state.findUnique.load("edit")
  }, [])

  const { data, loading } = state.findUnique

  if (loading || !data) {
    return (
      <Box py="lg">
        <Skeleton h={420} radius="xl" />
      </Box>
    )
  }

  return (
    <Box pb={90}>
      <Stack align="center" gap="lg">
        <Box pb="lg">
          <Center>
            <Image
              src={"/darmasaba-icon.png"}
              alt="Lambang resmi desa"
              w={{ base: 180, md: 280 }}
              radius="md"
              loading="lazy"
            />
          </Center>
          <Text
            c={colors['blue-button']}
            ta="center"
            fw={800}
            fz={{ base: 28, md: 40 }}
            mt="sm"
            style={{ letterSpacing: '-0.5px' }}
          >
            Lambang Desa
          </Text>
        </Box>
        <Paper
          p="xl"
          radius="xl"
          withBorder
          shadow="sm"
          w="100%"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f3f7ff 100%)',
            borderColor: '#e0e9ff',
          }}
        >
          <Tooltip label="Deskripsi lambang desa" position="top-start" withArrow>
            <Text
              fz={{ base: 'md', md: 'lg' }}
              lh={1.8}
              c="dark"
              ta="justify"
              style={{ fontWeight: 400 }}
              dangerouslySetInnerHTML={{ __html: data.deskripsi }}
            />
          </Tooltip>
        </Paper>
      </Stack>
    </Box>
  )
}

export default LambangDesa
