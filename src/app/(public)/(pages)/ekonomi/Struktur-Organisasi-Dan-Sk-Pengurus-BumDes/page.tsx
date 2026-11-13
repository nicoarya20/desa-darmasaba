'use client'
import colors from '@/con/colors'
import { Box, Stack, Text, Title } from '@mantine/core'
import BackButton from '../../pemerintahan/layanan/_com/BackButto'
import ProfilBumdesSection from './_com/ProfilBumdesSection'
import StrukturBumdesSection from './_com/StrukturBumdesSection'
import { BUMDES_VARS } from './_com/struktur-bumdes.meta'
import UnitUsahaBumdesSection from './_com/UnitUsahaBumdesSection'

/** Halaman publik BUMDes: profil (+ galeri), unit usaha, lalu bagan struktur pengurus. */
export default function Page() {
  return (
    <Box style={{ minHeight: '100vh', background: colors['Bg'], color: '#E6F0FF', paddingBottom: 48, ...BUMDES_VARS }}>
      <Box px={{ base: 'md', md: 100 }} py="xl">
        <BackButton />

        <Stack align="center" gap="xl" mt="xl">
          <Title order={1} ta="center" c={colors['blue-button']} fz={{ base: 28, md: 36, lg: 44 }} lh={{ base: 1.05, md: 1.03 }}>
            BUMDes
          </Title>
          <Text ta="center" c="black" maw={800} fz={{ base: 14, md: 16 }} lh={1.6}>
            Profil, unit usaha, serta struktur pengurus dan SK Badan Usaha Milik Desa Darmasaba.
          </Text>
        </Stack>

        <ProfilBumdesSection />
        <UnitUsahaBumdesSection />
        <StrukturBumdesSection />
      </Box>
    </Box>
  )
}
