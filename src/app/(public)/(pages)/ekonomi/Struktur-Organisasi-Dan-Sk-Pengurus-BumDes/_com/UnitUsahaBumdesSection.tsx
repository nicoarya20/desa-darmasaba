'use client'
import stateBumdes from '@/app/admin/(dashboard)/_state/ekonomi/bumdes/bumdes'
import { Card, Center, Image, Pagination, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core'
import { IconBuildingStore } from '@tabler/icons-react'
import { useEffect } from 'react'
import { useProxy } from 'valtio/utils'
import BumdesSection, { BumdesEmptyState } from './BumdesSection'

const PUBLIC_PAGE_SIZE = 9

/** Section unit usaha BUMDes: kartu berpaginasi, urut sesuai `urutan` dari admin; empty-state bila belum ada. */
export default function UnitUsahaBumdesSection() {
  const unit = useProxy(stateBumdes.unitUsaha)
  const { data, page, totalPages } = unit.findMany

  useEffect(() => {
    void stateBumdes.unitUsaha.findMany.load(1, PUBLIC_PAGE_SIZE)
  }, [])

  return (
    <BumdesSection title="Unit Usaha">
      {!data ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {[0, 1, 2].map((i) => <Skeleton key={i} height={260} radius="lg" />)}
        </SimpleGrid>
      ) : data.length === 0 ? (
        <BumdesEmptyState
          icon={<IconBuildingStore size={48} stroke={1.5} color="var(--mantine-color-gray-6)" />}
          message="Unit usaha BUMDes belum tersedia."
        />
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {data.map((item) => (
              <Card key={item.id} radius="lg" p={0} bg="white" withBorder shadow="sm">
                {item.image ? (
                  <Image src={item.image.link} alt={item.nama} h={180} fit="cover" loading="lazy" />
                ) : (
                  <Center h={180} bg="gray.1">
                    <IconBuildingStore size={56} stroke={1.3} color="var(--mantine-color-gray-6)" />
                  </Center>
                )}
                <Stack gap="xs" p="md">
                  <Title order={4} c="dark" fz={{ base: 17, md: 19 }}>{item.nama}</Title>
                  <Text c="dark" fz={{ base: 13, md: 14 }} lh={1.6} style={{ whiteSpace: 'pre-line' }}>
                    {item.deskripsi}
                  </Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
          {totalPages > 1 && (
            <Center>
              <Pagination
                value={page}
                total={totalPages}
                radius="md"
                onChange={(next) => void stateBumdes.unitUsaha.findMany.load(next, PUBLIC_PAGE_SIZE)}
              />
            </Center>
          )}
        </>
      )}
    </BumdesSection>
  )
}
