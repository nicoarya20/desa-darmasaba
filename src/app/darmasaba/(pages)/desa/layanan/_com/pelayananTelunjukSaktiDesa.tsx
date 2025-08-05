/* eslint-disable react-hooks/exhaustive-deps */
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import { Box, Flex, Skeleton, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';

interface ServiceItem {
  name: string;
  deskripsi: string;
  link: string;
}

function PelayananTelunjukSaktiDesa() {
  const state = useProxy(stateLayananDesa)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        await state.pelayananTelunjukSaktiDesa.findMany.load()
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const data = (state.pelayananTelunjukSaktiDesa.findMany.data || []) as Array<{
    name: string;
    id: string;
    deskripsi: string;
    link: string;
    items: ServiceItem[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }>
  return (
    <Box>
      <Title fz="h2" py={10} mb="md">Terwujudnya Layanan umum bertajuk Sistim administrasi Kependudukan Terintegrasi di Desa berbasi Elektronik, Smart dan Aman. Layanan Telunjuk Sakti Desa meliputi :</Title>
      {loading ? (
        <Skeleton h={500} />
      ) : (
        data.map((v, k) => {
          return (
            <Box key={k}>
              <Box py={10}>
                <Flex gap={"3"} align={"center"}>
                  <Text fz={{ base: "h4", md: "h3" }} fw={"bold"}>{v.name}
                  </Text>
                  <Text span fz={{ base: "h4", md: "h3" }}>
                    <a href={v.link} target="_blank" rel="noopener noreferrer" style={{ color: '#228be6' }}>{v.deskripsi}</a>
                  </Text>
                </Flex>
              </Box>
            </Box>
          )
        })
      )}
    </Box>
  );
}

export default PelayananTelunjukSaktiDesa;
