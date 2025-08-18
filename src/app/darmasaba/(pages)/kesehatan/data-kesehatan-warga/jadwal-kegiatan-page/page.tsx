'use client'
import jadwalkegiatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
import colors from '@/con/colors';
import { Anchor, Box, Divider, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';

function JadwalKegiatanPage() {
  const state = useProxy(jadwalkegiatanState)
  const router = useRouter();

  useShallowEffect(()=> {
    state.findMany.load()
  }, [])

  if(!state.findMany.data){
    return (
      <Box py={10}>
        <Skeleton h={500} />
      </Box>
    )
  }
  return (
    <Box>
      <Paper p={'xl'} h={'112vh'} bg={colors['white-trans-1']}>
        <Stack gap={'xs'}>
          <Text ta={'center'} fw={"bold"} fz={'h3'} c={colors['blue-button']}>Jadwal Kegiatan</Text>
          {state.findMany.data.map((item) => (
            <Box key={item.id}>
              <Text fz={'h4'} fw={'bold'}>
                {item.informasijadwalkegiatan.name}
              </Text>
              <Text fz={'h4'}>
                {item.informasijadwalkegiatan.waktu}
              </Text>
              <Text fz={'h4'}>
                {item.informasijadwalkegiatan.lokasi}
              </Text>
              <Text fz={'h6'} fw={'bold'} c={colors['blue-button']}>
                {item.informasijadwalkegiatan.tanggal}
              </Text>
              <Anchor onClick={()=> router.push(`/darmasaba/kesehatan/data-kesehatan-warga/jadwal-kegiatan-page/${item.id}`)} c={colors['blue-button']} variant='transparent'>
                <Text c={colors['blue-button']} fz={'h4'} >
                  Detail & Pendaftaran
                </Text>
              </Anchor>
            </Box>
          ))}
          <Divider color={colors['blue-button']} px={'xl'} />
        </Stack>
      </Paper>
    </Box>
  );
}

export default JadwalKegiatanPage;
