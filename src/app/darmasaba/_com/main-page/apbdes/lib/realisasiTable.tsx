import { Paper, Table, Title, Badge, Text, Box, ScrollArea } from '@mantine/core'
import { APBDes, APBDesItem, RealisasiItem } from '../types/apbdes'

interface RealisasiRowProps {
  realisasi: RealisasiItem
  parentItem: APBDesItem
}

function RealisasiRow({ realisasi, parentItem }: RealisasiRowProps) {
  const persentase = parentItem.anggaran > 0
    ? (realisasi.jumlah / parentItem.anggaran) * 100
    : 0

  const getBadgeColor = (percentage: number) => {
    if (percentage >= 100) return 'teal'
    if (percentage >= 80) return 'blue'
    if (percentage >= 60) return 'yellow'
    return 'red'
  }

  const getBadgeVariant = (percentage: number) => {
    if (percentage >= 100) return 'filled'
    return 'light'
  }

  return (
    <Table.Tr
      style={{
        transition: 'background-color 0.2s ease',
        ':hover': {
          backgroundColor: 'var(--mantine-color-blue-0)',
        },
      }}
    >
      <Table.Td style={{ borderBottom: '1px solid #e5e7eb' }}>
        <Box style={{ gap: 8, alignItems: 'center' }}>
          <span style={{
            fontWeight: 500,
            color: 'var(--mantine-color-gray-7)',
          }}>
            {realisasi.kode || '-'}
          </span>
          <Text
            size="sm"
            c="gray.7"
            title={realisasi.keterangan || '-'}
          >
            {realisasi.keterangan || '-'}
          </Text>
        </Box>
      </Table.Td>
      <Table.Td
        ta="right"
        style={{
          borderBottom: '1px solid #e5e7eb',
          fontWeight: 700,
          color: 'var(--mantine-color-blue-7)',
        }}
      >
        {new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(realisasi.jumlah || 0)}
      </Table.Td>
      <Table.Td
        ta="center"
        style={{ borderBottom: '1px solid #e5e7eb' }}
      >
        <Badge
          color={getBadgeColor(persentase)}
          variant={getBadgeVariant(persentase)}
          size="sm"
          radius="xl"
          fw={600}
          style={{
            minWidth: 65,
            transition: 'transform 0.2s ease',
          }}
        >
          {persentase.toFixed(1)}%
        </Badge>
      </Table.Td>
    </Table.Tr>
  )
}

interface RealisasiTableProps {
  apbdesData: APBDes
}

export default function RealisasiTable({ apbdesData }: RealisasiTableProps) {
  const items = apbdesData.items || []

  const title = apbdesData.tahun
    ? `REALISASI APBDes Tahun ${apbdesData.tahun}`
    : 'REALISASI APBDes'

  // Flatten: kumpulkan semua realisasi items
  const allRealisasiRows: Array<{ realisasi: RealisasiItem; parentItem: APBDesItem }> = []

  items.forEach((item: APBDesItem) => {
    if (item.realisasiItems && item.realisasiItems.length > 0) {
      item.realisasiItems.forEach((realisasi: RealisasiItem) => {
        allRealisasiRows.push({ realisasi, parentItem: item })
      })
    }
  })

  // Calculate total realisasi
  const totalRealisasi = allRealisasiRows.reduce(
    (sum, { realisasi }) => sum + (realisasi.jumlah || 0),
    0
  )

  return (
    <Paper
      withBorder
      p="md"
      radius="lg"
      shadow="sm"
      style={{
        transition: 'box-shadow 0.3s ease',
        ':hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      }}
      h={"100%"}
    >
      <Title
        order={5}
        mb="md"
        c="blue.9"
        fz={{ base: '1rem', md: '1.1rem' }}
        fw={700}
      >
        {title}
      </Title>

      {allRealisasiRows.length === 0 ? (
        <Box
          py="xl"
          px="md"
          style={{
            backgroundColor: 'var(--mantine-color-gray-0)',
            borderRadius: 8,
          }}
        >
          <Text
            fz="sm"
            c="dimmed"
            ta="center"
            lh={1.6}
          >
            Belum ada data realisasi untuk tahun ini
          </Text>
        </Box>
      ) : (
        <>
          <ScrollArea offsetScrollbars type="hover">
            <Table
              horizontalSpacing="md"
              verticalSpacing="xs"
              layout="fixed"
            >
              <Table.Thead>
                <Table.Tr bg="blue.9">
                  <Table.Th c="white" fw={600}>Uraian</Table.Th>
                  <Table.Th c="white" fw={600} ta="right">Realisasi (Rp)</Table.Th>
                  <Table.Th c="white" fw={600} ta="center">%</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {allRealisasiRows.map(({ realisasi, parentItem }) => (
                  <RealisasiRow
                    key={realisasi.id}
                    realisasi={realisasi}
                    parentItem={parentItem}
                  />
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
          <Box mb="md" px="sm">
            <Text
              size="sm"
              c="gray.6"
              fw={500}
            >
              Total Realisasi:{' '}
              <Text
                component="span"
                c="blue.9"
                fw={700}
                fz="md"
              >
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(totalRealisasi)}
              </Text>
            </Text>
          </Box>
        </>
      )}
    </Paper>
  )
}
