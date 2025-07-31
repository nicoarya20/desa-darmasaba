/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { OrganizationChart } from 'primereact/organizationchart';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';
import stateStrukturPPID from '../../../_state/ppid/struktur_ppid/struktur_PPID';

function StrukturOrganisasiPPID() {
  return (
    <Box >
      <ListStrukturOrganisasiPPID />
    </Box>
  );
}

function ListStrukturOrganisasiPPID() {
  const stateOrganisasi = useProxy(stateStrukturPPID.pegawai)

  useEffect(() => {
    stateOrganisasi.findMany.load()
  }, [])

  if (!stateOrganisasi.findMany.data || stateOrganisasi.findMany.data.length === 0) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    );
  }

  // Step 1: Group pegawai berdasarkan posisiId
  const posisiMap = new Map<string, any>();

  for (const pegawai of stateOrganisasi.findMany.data) {
    const posisiId = pegawai.posisi.id;
    if (!posisiMap.has(posisiId)) {
      posisiMap.set(posisiId, {
        ...pegawai.posisi,
        pegawaiList: [],
        children: []
      });
    }
    posisiMap.get(posisiId)!.pegawaiList.push(pegawai);
  }
  

  // Step 2: Buat struktur pohon berdasarkan parentId
  let root: any[] = [];

  posisiMap.forEach((posisi) => {
    if (posisi.parentId) {
      const parent = posisiMap.get(posisi.parentId);
      if (parent) {
        parent.children.push(posisi);
      }
    } else {
      root.push(posisi);
    }
  });

  // Step 3: Ubah struktur ke format OrganizationChart
  function toOrgChartFormat(node: any): any {
    return {
      expanded: true,
      type: 'person',
      styleClass: 'p-person',
      data: {
        name: node.pegawaiList?.[0]?.namaLengkap || 'Tidak ada pegawai',
        status: node.nama,
        image: node.pegawaiList?.[0]?.image?.link || '/img/default.png'
      },
      children: node.children.map(toOrgChartFormat)
    };
  }
  

  const chartData = root.map(toOrgChartFormat);

  return (
    <Box py={10}>
      <Paper bg={colors.grey} p="md" style={{overflowX: 'auto'}}>
        <OrganizationChart value={chartData} nodeTemplate={nodeTemplate} />
      </Paper>
    </Box>
  );
}


function nodeTemplate(node: any) {
  const imageSrc = node?.data?.image || '/img/default.png';
  const name = node?.data?.name || 'Tanpa Nama';
  const status = node?.data?.status || 'Tidak ada deskripsi';

  return (
    <Stack align="center" gap={4}>
      <Image
        src={imageSrc}
        alt={name}
        radius="xl"
        w={120}
        h={120}
        fit="cover"
      />
      <Text fw={600} ta="center">{name}</Text>
      <Text size="sm" c="dimmed" ta="center">{status}</Text>
    </Stack>
  );
}




export default StrukturOrganisasiPPID;
