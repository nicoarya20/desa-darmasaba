/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile'
import colors from '@/con/colors'
import { Box, Center, Image, Paper, Skeleton, Stack, Text, Title } from '@mantine/core'
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
    <Box>
      <Stack align="center" gap="lg">
        
        {/* HEADER */}
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

          {/* TITLE - H1 */}
          <Title
            order={1}
            c={colors['blue-button']}
            ta="center"
            mt="sm"
            style={{ letterSpacing: '-0.5px' }}
          >
            Lambang Desa
          </Title>
        </Box>

        {/* DESKRIPSI */}
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
          <Text
            fz={{ base: 'sm', md: 'md' }}   // Body text mobile & desktop
            lh={1.7}
            c="dark"
            ta="justify"
            style={{
              fontWeight: 400,
              wordBreak: "break-word",
              whiteSpace: "normal",
            }}
            dangerouslySetInnerHTML={{ __html: data.deskripsi }}
          />
        </Paper>

      </Stack>
    </Box>
  )
}

export default LambangDesa
