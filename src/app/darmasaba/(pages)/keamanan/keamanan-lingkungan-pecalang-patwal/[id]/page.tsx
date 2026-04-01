'use client'

import { Box, Center, Image, Paper, Skeleton, Stack, Text, Title } from '@mantine/core'
import { useShallowEffect } from '@mantine/hooks'
import { useParams } from 'next/navigation'
import { useProxy } from 'valtio/utils'

import keamananLingkunganState from '@/app/admin/(dashboard)/_state/keamanan/keamanan-lingkungan'
import colors from '@/con/colors'
import BackButton from '../../../desa/layanan/_com/BackButto'

function DetailKeamananLingkunganUser() {
  const keamananState = useProxy(keamananLingkunganState)
  const params = useParams()

  // Ambil data berdasarkan ID dari URL
  useShallowEffect(() => {
    keamananState.findUnique.load(params?.id as string)
  }, [])

  // Loading state
  if (!keamananState.findUnique.data) {
    return (
      <Stack py={40}>
        <Skeleton height={500} radius="md" />
      </Stack>
    )
  }

  const data = keamananState.findUnique.data

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="lg">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />

        {/* Wrapper Detail */}
        <Paper
          withBorder
          w={{ base: '100%', md: '80%' }}
          mx="auto"
          bg={colors['white-1']}
          p="xl"
          radius="lg"
          shadow="md"
        >
          <Stack gap="lg">
            {/* Judul */}
            <Title
              order={1}
              ta="center"
              c={colors['blue-button']}
              style={{ lineHeight: 1.15 }}
            >
              {data?.name || 'Tanpa Judul'}
            </Title>

            {/* Gambar */}
            <Center>
              <Image
                w={{ base: 250, sm: 400, md: 550 }}
                src={data?.image?.link}
                alt={data?.name || 'gambar keamanan lingkungan'}
                radius="md"
                loading="lazy"
                fit="cover"
              />
            </Center>

            {/* Deskripsi */}
            <Box>
              <Title order={3} mb={5} style={{ lineHeight: 1.2 }}>
                Deskripsi
              </Title>
              <Box pl={20}>
                <Text
                  fz={{ base: 'sm', md: 'md' }}
                  lh={{ base: 1.5, md: 1.55 }}
                  c={data?.deskripsi ? 'text' : 'dimmed'}
                  dangerouslySetInnerHTML={{ __html: data?.deskripsi || '-' }}
                  style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                />
              </Box>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Stack>
  )
}

export default DetailKeamananLingkunganUser