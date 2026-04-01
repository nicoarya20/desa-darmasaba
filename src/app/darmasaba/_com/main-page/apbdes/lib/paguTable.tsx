import { Paper, Table, Title, Box, ScrollArea, Badge } from '@mantine/core'
import { APBDes, APBDesItem } from '../types/apbdes'

interface SectionProps {
  title: string
  data: APBDesItem[]
  badgeColor?: string
}

function Section({ title, data, badgeColor = 'blue' }: SectionProps) {
  if (!data || data.length === 0) return null

  return (
    <>
      <Table.Tr bg="gray.0">
        <Table.Td colSpan={2}>
          <Badge color={badgeColor} variant="light" size="lg" fw={600}>
            {title}
          </Badge>
        </Table.Td>
      </Table.Tr>

      {data.map((item, index) => (
        <Table.Tr 
          key={item.id} 
          bg={index % 2 === 1 ? 'gray.50' : 'white'}
          style={{ 
            transition: 'background-color 0.2s ease',
            ':hover': {
              backgroundColor: 'var(--mantine-color-blue-0)',
            },
          }}
        >
          <Table.Td style={{ borderBottom: '1px solid #e5e7eb' }}>
            <Box style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ 
                fontWeight: 500, 
                color: 'var(--mantine-color-gray-7)',
                minWidth: 80,
              }}>
                {item.kode}
              </span>
              <span style={{ 
                color: 'var(--mantine-color-gray-6)',
                fontSize: '0.9rem',
              }}>
                {item.uraian}
              </span>
            </Box>
          </Table.Td>
          <Table.Td 
            ta="right" 
            style={{ 
              borderBottom: '1px solid #e5e7eb',
              fontWeight: 600,
              color: 'var(--mantine-color-blue-7)',
            }}
          >
            Rp {item.anggaran.toLocaleString('id-ID')}
          </Table.Td>
        </Table.Tr>
      ))}
    </>
  )
}

interface PaguTableProps {
  apbdesData: APBDes
}

export default function PaguTable({ apbdesData }: PaguTableProps) {
  const items = apbdesData.items || []

  const title = apbdesData.tahun
    ? `PAGU APBDes Tahun ${apbdesData.tahun}`
    : 'PAGU APBDes'

  const pendapatan = items.filter((i: APBDesItem) => i.tipe === 'pendapatan')
  const belanja = items.filter((i: APBDesItem) => i.tipe === 'belanja')
  const pembiayaan = items.filter((i: APBDesItem) => i.tipe === 'pembiayaan')

  // Calculate totals
  const totalPendapatan = pendapatan.reduce((sum, i) => sum + i.anggaran, 0)
  const totalBelanja = belanja.reduce((sum, i) => sum + i.anggaran, 0)
  const totalPembiayaan = pembiayaan.reduce((sum, i) => sum + i.anggaran, 0)

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

      <ScrollArea offsetScrollbars type="hover">
        <Table 
          horizontalSpacing="md"
          verticalSpacing="xs"
          layout="fixed"
        >
          <Table.Thead>
            <Table.Tr bg="blue.9">
              <Table.Th c="white" fw={600} style={{ minWidth: '60%' }}>
                Uraian
              </Table.Th>
              <Table.Th 
                c="white" 
                fw={600} 
                ta="right"
                style={{ minWidth: '40%' }}
              >
                Anggaran (Rp)
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Section 
              title="1) PENDAPATAN" 
              data={pendapatan} 
              badgeColor="green"
            />
            {totalPendapatan > 0 && (
              <Table.Tr bg="green.0" fw={700}>
                <Table.Td>Total Pendapatan</Table.Td>
                <Table.Td ta="right">
                  Rp {totalPendapatan.toLocaleString('id-ID')}
                </Table.Td>
              </Table.Tr>
            )}
            
            <Section 
              title="2) BELANJA" 
              data={belanja} 
              badgeColor="red"
            />
            {totalBelanja > 0 && (
              <Table.Tr bg="red.0" fw={700}>
                <Table.Td>Total Belanja</Table.Td>
                <Table.Td ta="right">
                  Rp {totalBelanja.toLocaleString('id-ID')}
                </Table.Td>
              </Table.Tr>
            )}
            
            <Section 
              title="3) PEMBIAYAAN" 
              data={pembiayaan} 
              badgeColor="orange"
            />
            {totalPembiayaan > 0 && (
              <Table.Tr bg="orange.0" fw={700}>
                <Table.Td>Total Pembiayaan</Table.Td>
                <Table.Td ta="right">
                  Rp {totalPembiayaan.toLocaleString('id-ID')}
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  )
}
