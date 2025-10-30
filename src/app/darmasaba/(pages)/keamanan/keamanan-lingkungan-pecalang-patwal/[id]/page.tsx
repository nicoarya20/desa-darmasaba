'use client'

import { Box, Center, Image, Paper, Skeleton, Stack, Text } from '@mantine/core'
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
          <Text
            ta="center"
            fz={{ base: 'xl', md: '2xl' }}
            fw={700}
            c={colors['blue-button']}
          >
            {data?.name || 'Tanpa Judul'}
          </Text>

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
            <Text fz="lg" fw="bold" mb={5}>
              Deskripsi
            </Text>
            <Text
              fz="md"
              c="dimmed"
              dangerouslySetInnerHTML={{ __html: data?.deskripsi || '-' }}
              style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
            />
          </Box>
        </Stack>
      </Paper>
    </Box>
    </Stack>
  )
}

export default DetailKeamananLingkunganUser
