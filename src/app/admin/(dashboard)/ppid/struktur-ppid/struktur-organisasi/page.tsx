/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { Box, Center, Image, Loader, Paper, Stack, Text, Tooltip } from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';
import { OrganizationChart } from 'primereact/organizationchart';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';
import stateStrukturPPID from '../../../_state/ppid/struktur_ppid/struktur_PPID';

function StrukturOrganisasiPPID() {
  return (
    <Box py="md">
      <ListStrukturOrganisasiPPID />
    </Box>
  );
}

function ListStrukturOrganisasiPPID() {
  const stateOrganisasi = useProxy(stateStrukturPPID.pegawai);

  useEffect(() => {
    stateOrganisasi.findMany.load();
  }, []);

  if (stateOrganisasi.findMany.loading) {
    return (
      <Center py={40}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!stateOrganisasi.findMany.data || stateOrganisasi.findMany.data.length === 0) {
    return (
      <Stack align="center" py={60} gap="sm">
        <IconUsers size={60} stroke={1.5} color="var(--mantine-color-gray-6)" />
        <Text fw={500} c="dimmed">Belum ada struktur organisasi yang ditambahkan</Text>
      </Stack>
    );
  }

  const posisiMap = new Map<string, any>();

  const aktifPegawai = stateOrganisasi.findMany.data.filter(p => p.isActive);

  for (const pegawai of aktifPegawai) {
    const posisiId = pegawai.posisi.id;
    if (!posisiMap.has(posisiId)) {
      posisiMap.set(posisiId, {
        ...pegawai.posisi,
        pegawaiList: [],
        children: [],
      });
    }
    posisiMap.get(posisiId)!.pegawaiList.push(pegawai);
  }

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

  function toOrgChartFormat(node: any): any {
    return {
      expanded: true,
      type: 'person',
      styleClass: 'p-person',
      data: {
        name: node.pegawaiList?.[0]?.namaLengkap || 'Belum ada pegawai',
        status: node.nama,
        image: node.pegawaiList?.[0]?.image?.link || '/img/default.png',
      },
      children: node.children.map(toOrgChartFormat),
    };
  }

  const chartData = root.map(toOrgChartFormat);

  return (
    <Box py={10}>
      <Paper
        p="md"
        radius="lg"
        shadow="md"
        withBorder
        style={{
          overflowX: 'auto',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        }}
      >
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
    <Stack align="center" gap={6} p="sm" style={{ minWidth: 160 }}>
      <Tooltip label={name} position="top" withArrow>
        <Image
          src={imageSrc}
          alt={name}
          radius="xl"
          w={100}
          h={100}
          fit="cover"
          style={{
            border: '1px solid #D3D1D1FF',
          }}
          loading='lazy'
        />
      </Tooltip>
      <Text fw={600} ta="center" size="sm">{name}</Text>
      <Text size="xs" c="dimmed" ta="center">{status}</Text>
    </Stack>
  );
}

export default StrukturOrganisasiPPID;
