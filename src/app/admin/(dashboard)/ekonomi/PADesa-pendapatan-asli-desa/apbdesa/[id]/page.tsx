'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import PendapatanAsliDesa from '@/app/admin/(dashboard)/_state/ekonomi/PADesa';
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';



function DetailAPBDesa() {
  const apbState = useProxy(PendapatanAsliDesa.ApbDesa)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()

  useShallowEffect(() => {
    console.log("PARAM ID:", params?.id)
    apbState.findUnique.load(params?.id as string)
  }, [])

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleHapus = () => {
    if (selectedId) {
      apbState.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/ekonomi/PADesa-pendapatan-asli-desa/apbdesa")
    }
  }

  if (!apbState.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton h={40} />
      </Stack>
    )
  }

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Paper bg={colors['white-1']} w={{ base: "100%", md: "100%", lg: "50%" }} p={'md'}>
        <Stack>
          <Text fz={"xl"} fw={"bold"}>Detail APB Desa</Text>
          {apbState.findUnique.data ? (
            <Paper key={apbState.findUnique.data.id} bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fw={"bold"} fz={"lg"}>Tahun</Text>
                  <Text fz={"lg"}>{apbState.findUnique.data?.tahun}</Text>
                </Box>
                <Box>
                  <Stack gap={"xs"}>
                    <Text fw={"bold"} fz={"lg"}>Detail Pembiayaan</Text>
                    {(apbState.findUnique.data?.pembiayaan || []).map((item) => (
                      <Text fz={"lg"} key={item.id}>
                        {item.name}: {formatRupiah(Number(item.value))}
                      </Text>
                    ))}
                    <Text fz={"lg"} fw={"bold"}>
                      Total: {formatRupiah((apbState.findUnique.data?.pembiayaan || [])
                        .reduce((sum, item) => sum + Number(item.value), 0))}
                    </Text>
                  </Stack>
                </Box>
                <Box>
                  <Stack gap={"xs"}>
                    <Text fw={"bold"} fz={"lg"}>Detail Belanja</Text>
                    {(apbState.findUnique.data?.belanja || []).map((item) => (
                      <Text fz={"lg"} key={item.id}>
                        {item.name}: {formatRupiah(Number(item.value))}
                      </Text>
                    ))}
                    <Text fz={"lg"} fw={"bold"}>
                      Total: {formatRupiah((apbState.findUnique.data?.belanja || [])
                        .reduce((sum, item) => sum + Number(item.value), 0))}
                    </Text>
                  </Stack>
                </Box>
                <Box>
                  <Stack gap={"xs"}>
                    <Text fw={"bold"} fz={"lg"}>Detail Pendapatan</Text>
                    {(apbState.findUnique.data?.pendapatan || []).map((item) => (
                      <Text fz={"lg"} key={item.id}>
                        {item.name}: {formatRupiah(Number(item.value))}
                      </Text>
                    ))}
                    <Text fz={"lg"} fw={"bold"}>
                      Total: {formatRupiah((apbState.findUnique.data?.pendapatan || [])
                        .reduce((sum, item) => sum + Number(item.value), 0))}
                    </Text>
                  </Stack>
                </Box>
                <Flex gap={"xs"} mt={10}>
                  <Button
                    onClick={() => {
                      if (apbState.findUnique.data) {
                        setSelectedId(apbState.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={apbState.delete.loading || !apbState.findUnique.data}
                    color={"red"}
                  >
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (apbState.findUnique.data) {
                        router.push(`/admin/ekonomi/PADesa-pendapatan-asli-desa/apbdesa/${apbState.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!apbState.findUnique.data}
                    color={"green"}
                  >
                    <IconEdit size={20} />
                  </Button>
                </Flex>
              </Stack>
            </Paper>
          ) : null}
        </Stack>
      </Paper>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text='Apakah anda yakin ingin menghapus APB Desa ini?'
      />
    </Box>
  );
}

export default DetailAPBDesa;
