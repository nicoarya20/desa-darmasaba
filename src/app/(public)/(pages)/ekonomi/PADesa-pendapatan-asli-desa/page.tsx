'use client'
import PendapatanAsliDesa from '@/app/admin/(dashboard)/_state/ekonomi/PADesa';
import colors from '@/con/colors';
import { Box, Flex, Group, Paper, SimpleGrid, Stack, Table, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';

function Page() {
  const state = useProxy(PendapatanAsliDesa.ApbDesa);

  useShallowEffect(() => {
    state.findMany.load();
  }, []);

  useShallowEffect(() => {
    PendapatanAsliDesa.pembiayaan.findMany.load();
    PendapatanAsliDesa.belanja.findMany.load();
    PendapatanAsliDesa.pendapatan.findMany.load();
  }, []);

  // Get the latest APB data
  const latestApb = state.findMany.data?.[0];

  // Calculate totals
  const totalPendapatan = latestApb?.pendapatan?.reduce((sum, item) => sum + (item?.value || 0), 0) || 0;
  const totalBelanja = latestApb?.belanja?.reduce((sum, item) => sum + (item?.value || 0), 0) || 0;
  const totalPembiayaan = latestApb?.pembiayaan?.reduce((sum, item) => sum + (item?.value || 0), 0) || 0;

  // Hasil akhir
  const sisaAnggaran = totalPendapatan - totalBelanja - totalPembiayaan;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="lg">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      {/* Page Title */}
      <Title
        ta="center"
        c={colors["blue-button"]}
        fw="bold"
        order={1}
        fz={{ base: 28, md: 36 }}
      >
        Pendapatan Asli Desa
      </Title>

      <Box px={{ base: "md", md: 100 }}>
        <Stack gap="lg" justify="center">
          <Paper bg={colors['white-1']} p={{ base: 'md', md: 'xl' }}>
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
              {/* Pendapatan Card */}
              <Box
                p="md"
                style={{
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  height: '100%'
                }}
              >
                <Stack gap="md">
                  <Title order={3} fz={{ base: 18, md: 20 }} c={colors['blue-button']}>
                    Pendapatan
                  </Title>

                  <Stack gap="sm">
                    {latestApb?.pendapatan?.map((item) => (
                      <Box key={item.id}>
                        <Flex gap={1}>
                          <Text
                            fz={{ base: 13, md: 14 }}
                            fw={500}
                            lh={1.4}
                            c="black"
                            style={{ wordBreak: 'break-word' }}
                          >
                            {item.name} {formatCurrency(item.value)}
                          </Text>
                        </Flex>
                      </Box>
                    ))}
                  </Stack>

                  <Box
                    pt="sm"
                    mt="auto"
                    style={{
                      borderTop: `2px solid ${colors['blue-button']}`
                    }}
                  >
                    <Flex direction="column" gap={4}>
                      <Text fz={{ base: 14, md: 16 }} fw={600} lh={1.4}>
                        Total Pendapatan
                      </Text>
                      <Text
                        fz={{ base: 18, md: 22 }}
                        fw={700}
                        c={colors['blue-button']}
                        lh={1.4}
                      >
                        {formatCurrency(totalPendapatan)}
                      </Text>
                    </Flex>
                  </Box>
                </Stack>
              </Box>

              {/* Belanja Card */}
              <Box
                p="md"
                style={{
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  height: '100%'
                }}
              >
                <Stack gap="md">
                  <Title order={3} fz={{ base: 18, md: 20 }} c="orange">
                    Belanja
                  </Title>

                  <Stack gap="sm">
                    {latestApb?.belanja?.map((item) => (
                      <Box key={item.id}>
                        <Group gap={1}>
                          <Text
                            fz={{ base: 13, md: 14 }}
                            fw={500}
                            lh={1.4}
                            c="black"
                            style={{ wordBreak: 'break-word' }}
                          >
                            {item.name} {formatCurrency(item.value)}
                          </Text>
                        </Group>
                      </Box>
                    ))}
                  </Stack>

                  <Box
                    pt="sm"
                    mt="auto"
                    style={{
                      borderTop: '2px solid orange'
                    }}
                  >
                    <Flex direction="column" gap={4}>
                      <Text fz={{ base: 14, md: 16 }} fw={600} lh={1.4}>
                        Total Belanja
                      </Text>
                      <Text
                        fz={{ base: 18, md: 22 }}
                        fw={700}
                        c="orange"
                        lh={1.4}
                      >
                        {formatCurrency(totalBelanja)}
                      </Text>
                    </Flex>
                  </Box>
                </Stack>
              </Box>

              {/* Pembiayaan Card */}
              <Box
                p="md"
                style={{
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  height: '100%'
                }}
              >
                <Stack gap="md">
                  <Title order={3} fz={{ base: 18, md: 20 }} c="green">
                    Pembiayaan
                  </Title>

                  <Stack gap="sm">
                    {latestApb?.pembiayaan?.map((item) => (
                      <Box key={item.id}>
                        <Group gap={1}>
                          <Text
                            fz={{ base: 13, md: 14 }}
                            fw={500}
                            lh={1.4}
                            c="black"
                            style={{ wordBreak: 'break-word' }}
                          >
                            {item.name} {formatCurrency(item.value)}
                          </Text>
                        </Group>
                      </Box>
                    ))}
                  </Stack>

                  <Box
                    pt="sm"
                    mt="auto"
                    style={{
                      borderTop: '2px solid green'
                    }}
                  >
                    <Flex direction="column" gap={4}>
                      <Text fz={{ base: 14, md: 16 }} fw={600} lh={1.4}>
                        Total Pembiayaan
                      </Text>
                      <Text
                        fz={{ base: 18, md: 22 }}
                        fw={700}
                        c="green"
                        lh={1.4}
                      >
                        {formatCurrency(totalPembiayaan)}
                      </Text>
                    </Flex>
                  </Box>
                </Stack>
              </Box>
            </SimpleGrid>
          </Paper>

          {/* Ringkasan Anggaran */}
          <Paper bg={colors['white-1']} p={{ base: 'md', md: 'xl' }} shadow="sm" withBorder>
            <Title order={3} mb="md" fz={{ base: 18, md: 20 }}>
              Ringkasan Anggaran
            </Title>
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>
                    <Text fz={{ base: 13, md: 14 }} fw={600}>Keterangan</Text>
                  </Table.Th>
                  <Table.Th ta="right">
                    <Text fz={{ base: 13, md: 14 }} fw={600}>Jumlah</Text>
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>
                    <Text fz={{ base: 13, md: 14 }} lh={1.4}>Total Pendapatan</Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text fz={{ base: 13, md: 14 }} fw={600} lh={1.4}>
                      {formatCurrency(totalPendapatan)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>
                    <Text fz={{ base: 13, md: 14 }} lh={1.4} c="orange">Total Belanja</Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text fz={{ base: 13, md: 14 }} fw={600} lh={1.4} c="orange">
                      {formatCurrency(totalBelanja)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>
                    <Text fz={{ base: 13, md: 14 }} lh={1.4} c="green">Total Pembiayaan</Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text fz={{ base: 13, md: 14 }} fw={600} lh={1.4} c="green">
                      {formatCurrency(totalPembiayaan)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
                  <Table.Td>
                    <Text fz={{ base: 14, md: 15 }} fw={700} lh={1.4}>Sisa Anggaran</Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text
                      fz={{ base: 14, md: 15 }}
                      fw={700}
                      c={sisaAnggaran >= 0 ? colors['blue-button'] : "red"}
                      lh={1.4}
                    >
                      {formatCurrency(sisaAnggaran)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;