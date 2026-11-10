'use client';
import colors from '@/con/colors';
import { Box, CloseButton, Container, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import BackButton from '../../../(pages)/pemerintahan/layanan/_com/BackButto';
import { useMenuVisibility } from '../../../_com/MenuVisibilityContext';
import { countPages, petaInformasiGroups } from '../_lib/petaInformasi';
import PetaInformasiGroupCard from './PetaInformasiGroupCard';

const textColor = colors['blue-button-7'];

/** Halaman Peta Informasi: semua halaman website per menu utama, bisa disaring tanpa API. */
export default function PetaInformasi() {
  const [query, setQuery] = useState('');
  const { searchMenus } = useMenuVisibility();
  const groups = useMemo(() => petaInformasiGroups(query, searchMenus), [query, searchMenus]);
  const isFiltering = query.trim() !== '';

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap={32}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Container w={{ base: '100%', md: '60%' }}>
        <Stack align="center" gap="sm">
          <Title order={1} fz={{ base: '2.4rem', md: '3.2rem' }} fw="bold" ta="center" c={textColor}>
            Peta Informasi
          </Title>
          <Text fz="md" ta="center" c={textColor}>
            Semua halaman website Desa Darmasaba dalam satu tempat.
          </Text>
        </Stack>
      </Container>

      <Box px={{ base: 'md', md: 100 }}>
        <TextInput
          label="Saring halaman"
          placeholder="Ketik nama halaman, mis. APBDes"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          leftSection={<IconSearch size={16} aria-hidden />}
          rightSection={
            isFiltering ? <CloseButton size="sm" aria-label="Hapus saringan" onClick={() => setQuery('')} /> : undefined
          }
          radius="md"
          size="md"
          maw={480}
          styles={{ label: { color: textColor, fontWeight: 600 } }}
        />
        <Text fz="sm" mt="xs" c={textColor} aria-live="polite">
          {groups.length === 0
            ? `Tidak ada halaman yang cocok dengan "${query.trim()}".`
            : `${countPages(groups)} halaman dalam ${groups.length} kelompok.`}
        </Text>
      </Box>

      {groups.length > 0 && (
        <SimpleGrid px={{ base: 'md', md: 100 }} cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" verticalSpacing="lg">
          {groups.map((group) => (
            <PetaInformasiGroupCard key={group.name} group={group} />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
