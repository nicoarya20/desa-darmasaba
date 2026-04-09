/* eslint-disable @typescript-eslint/no-explicit-any */
import { Paper, Title, Box, Text, Stack, Group, rem } from '@mantine/core'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { APBDes, APBDesItem } from '../types/apbdes'

interface ComparisonChartProps {
  apbdesData: APBDes
}

export default function ComparisonChart({ apbdesData }: ComparisonChartProps) {
  const items = apbdesData?.items || []
  const tahun = apbdesData?.tahun || new Date().getFullYear()

  const pendapatan = items.filter((i: APBDesItem) => i.tipe === 'pendapatan')
  const belanja = items.filter((i: APBDesItem) => i.tipe === 'belanja')
  const pembiayaan = items.filter((i: APBDesItem) => i.tipe === 'pembiayaan')

  const totalPendapatan = pendapatan.reduce((sum, i) => sum + i.anggaran, 0)
  const totalBelanja = belanja.reduce((sum, i) => sum + i.anggaran, 0)
  const totalPembiayaan = pembiayaan.reduce((sum, i) => sum + i.anggaran, 0)

  // Hitung total realisasi dari realisasiItems (konsisten dengan RealisasiTable)
  const totalPendapatanRealisasi = pendapatan.reduce(
    (sum, i) => {
      if (i.realisasiItems && i.realisasiItems.length > 0) {
        return sum + i.realisasiItems.reduce((sumReal, real) => sumReal + (real.jumlah || 0), 0)
      }
      return sum
    },
    0
  )
  const totalBelanjaRealisasi = belanja.reduce(
    (sum, i) => {
      if (i.realisasiItems && i.realisasiItems.length > 0) {
        return sum + i.realisasiItems.reduce((sumReal, real) => sumReal + (real.jumlah || 0), 0)
      }
      return sum
    },
    0
  )
  const totalPembiayaanRealisasi = pembiayaan.reduce(
    (sum, i) => {
      if (i.realisasiItems && i.realisasiItems.length > 0) {
        return sum + i.realisasiItems.reduce((sumReal, real) => sumReal + (real.jumlah || 0), 0)
      }
      return sum
    },
    0
  )

  const formatRupiah = (value: number) => {
    if (value >= 1000000000) {
      return `Rp ${(value / 1000000000).toFixed(1)}B`
    }
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)}Jt`
    }
    if (value >= 1000) {
      return `Rp ${(value / 1000).toFixed(0)}Rb`
    }
    return `Rp ${value.toFixed(0)}`
  }

  const data = [
    {
      name: 'Pendapatan',
      pagu: totalPendapatan,
      realisasi: totalPendapatanRealisasi,
      fill: '#40c057',
    },
    {
      name: 'Belanja',
      pagu: totalBelanja,
      realisasi: totalBelanjaRealisasi,
      fill: '#fa5252',
    },
    {
      name: 'Pembiayaan',
      pagu: totalPembiayaan,
      realisasi: totalPembiayaanRealisasi,
      fill: '#fd7e14',
    },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <Box
          bg="white"
          p="md"
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Stack gap="xs">
            <Text fw={700} c="gray.8" fz="sm">
              {data.name}
            </Text>
            <Group justify="space-between" gap="lg">
              <Text fz="xs" c="gray.6">
                Pagu:
              </Text>
              <Text fz="xs" fw={700} c="blue.9">
                {formatRupiah(data.pagu)}
              </Text>
            </Group>
            <Group justify="space-between" gap="lg">
              <Text fz="xs" c="gray.6">
                Realisasi:
              </Text>
              <Text fz="xs" fw={700} c="green.9">
                {formatRupiah(data.realisasi)}
              </Text>
            </Group>
            {data.pagu > 0 && (
              <Group justify="space-between" gap="lg">
                <Text fz="xs" c="gray.6">
                  Persentase:
                </Text>
                <Text 
                  fz="xs" 
                  fw={700} 
                  c={data.realisasi >= data.pagu ? 'teal' : 'blue'}
                >
                  {((data.realisasi / data.pagu) * 100).toFixed(1)}%
                </Text>
              </Group>
            )}
          </Stack>
        </Box>
      )
    }
    return null
  }

  return (
    <Paper
      withBorder
      p="lg"
      radius="lg"
      shadow="sm"
      style={{
        transition: 'box-shadow 0.3s ease',
        ':hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Title
        order={5}
        mb="lg"
        c="blue.9"
        fz={{ base: '1rem', md: '1.1rem' }}
        fw={700}
      >
        Perbandingan Pagu vs Realisasi {tahun}
      </Title>

      <Box style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            barSize={60}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tickFormatter={formatRupiah}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={{ stroke: '#e5e7eb' }}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ 
                paddingTop: rem(20),
                fontSize: 12,
              }}
            />
            <Bar
              name="Pagu"
              dataKey="pagu"
              fill="#228be6"
              radius={[8, 8, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-pagu-${index}`} 
                  fill={entry.fill}
                  opacity={0.7}
                />
              ))}
            </Bar>
            <Bar
              name="Realisasi"
              dataKey="realisasi"
              fill="#40c057"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box mt="md">
        <Text fz="xs" c="dimmed" ta="center">
          *Geser cursor pada bar untuk melihat detail
        </Text>
      </Box>
    </Paper>
  )
}
