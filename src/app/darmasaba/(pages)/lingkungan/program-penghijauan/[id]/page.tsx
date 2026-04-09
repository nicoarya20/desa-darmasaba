/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import programPenghijauanState from '@/app/admin/(dashboard)/_state/lingkungan/program-penghijauan';
import { Box, Button, Paper, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import {
  IconAlertTriangle,
  IconAmbulance,
  IconArrowLeft, IconBook, IconBuilding, IconBuildingCommunity, IconCash, IconChartLine, IconChristmasTreeFilled, IconClipboard,
  IconDroplet,
  IconFileText,
  IconFiretruck,
  IconFirstAidKit,
  IconHome,
  IconHomeEco, IconHospital, IconInfoCircle, IconLeaf, IconLifebuoy, IconMessageReport, IconPhoneCall, IconRecycle, IconRun, IconScale,
  IconSchool,
  IconShield,
  IconShieldFilled, IconShoppingCart, IconStethoscope, IconTent, IconTrash,
  IconTree,
  IconTrendingUp, IconTrophy, IconTruck,
  IconUsers
} from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import type React from 'react';
import { useProxy } from 'valtio/utils';

function Page() {
  const stateProgramPenghijauan = useProxy(programPenghijauanState);
  const router = useRouter();
  const params = useParams();

  const iconMap: Record<string, React.FC<any>> = {
    ekowisata: IconLeaf,
    kompetisi: IconTrophy,
    wisata: IconTent,
    ekonomi: IconChartLine,
    sampah: IconRecycle,
    truck: IconTruck,
    scale: IconScale,
    clipboard: IconClipboard,
    trash: IconTrash,
    lingkunganSehat: IconHomeEco,
    sumberOksigen: IconChristmasTreeFilled,
    ekonomiBerkelanjutan: IconTrendingUp,
    mencegahBencana: IconShieldFilled,
    rumah: IconHome,
    pohon: IconTree,
    air: IconDroplet,
    bantuan: IconCash,
    pelatihan: IconSchool,
    subsidi: IconShoppingCart,
    layananKesehatan: IconHospital,
  
    // ===== Keamanan & Darurat =====
    polisi: IconShieldFilled,
    ambulans: IconAmbulance,
    pemadam: IconFiretruck,
    darurat: IconAlertTriangle,
    sar: IconLifebuoy,
    evakuasi: IconRun,
    keamanan: IconShield,
    teleponDarurat: IconPhoneCall,
  
    // ===== Kesehatan =====
    rumahSakit: IconHospital,
    puskesmas: IconFirstAidKit,
    klinik: IconStethoscope,
  
    // ===== Pemerintahan =====
    bangunan: IconBuilding,
    kantorDesa: IconBuildingCommunity,
    administrasi: IconFileText,
    informasi: IconInfoCircle,
    pengaduan: IconMessageReport,
    layananPublik: IconUsers,
    book: IconBook
  };

  useShallowEffect(() => {
    stateProgramPenghijauan.findUnique.load(params?.id as string);
  }, [params?.id]);

  if (!stateProgramPenghijauan.findUnique.data) {
    return (
      <Stack py="xl" align="center">
        <Skeleton height={300} radius="lg" w="100%" />
        <Text c="dimmed" fz="sm">Sedang memuat detail program...</Text>
      </Stack>
    );
  }

  const data = stateProgramPenghijauan.findUnique.data;
  const IconComponent = data?.icon ? iconMap[data.icon] : null;

  return (
    <Box py="md" px={{  base: 'md', md: 100  }}>
      <Button
        variant="light"
        color="blue"
        onClick={() => router.back()}
        leftSection={<IconArrowLeft size={20} />}
        mb="lg"
        radius="xl"
      >
        Kembali ke daftar
      </Button>

      <Paper
        w={{ base: '100%', md: '75%' }}
        mx="auto"
        p="xl"
        radius="xl"
        shadow="md"
        withBorder
      >
        <Stack gap="md" align="center" ta="center">
          {IconComponent && (
            <ThemeIcon
              size={72}
              radius="xl"
              variant="light"
              color="blue"
              mb="sm"
              style={{ boxShadow: '0 0 15px rgba(0, 123, 255, 0.3)' }}
            >
              <IconComponent size={40} />
            </ThemeIcon>
          )}

          <Text fz="xl" fw={700} c="blue">
            {data?.name || 'Nama program tidak tersedia'}
          </Text>

          <Text fz="lg" fw={600}>
            {data?.judul || 'Judul belum tersedia'}
          </Text>

          <Box w="100%" mt="sm">
            {data?.deskripsi ? (
              <Text
                fz="md"
                lh={1.7}
                ta="justify"
                dangerouslySetInnerHTML={{ __html: data.deskripsi }}
                style={{wordBreak: "break-word", whiteSpace: "normal"}}
              />
            ) : (
              <Text c="dimmed" fz="sm" ta="center">
                Tidak ada deskripsi yang tersedia untuk program ini.
              </Text>
            )}
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

export default Page;
