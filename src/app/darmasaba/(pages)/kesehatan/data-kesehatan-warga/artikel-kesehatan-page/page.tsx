'use client'
import artikelKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
import colors from '@/con/colors';
import { Anchor, Box, Divider, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';

function ArtikelKesehatanPage() {
  const state = useProxy(artikelKesehatanState)
  const router = useRouter()

  useShallowEffect(()=> {
    state.findMany.load()
  }, [])

  if(!state.findMany.data){
    return (
      <Box py={10}>
        <Skeleton h={500}/>
      </Box>
    )
  }
  return (
    <Box>
      <Paper p={'xl'} h={'112vh'} bg={colors['white-trans-1']}>
        <Stack gap={'xs'}>
          {state.findMany.data.map((item) => (
            <Box key={item.id}>
              <Text ta={'center'} fw={"bold"} fz={'h3'} c={colors['blue-button']}>Artikel Kesehatan</Text>
              <Image pt={5} src={'/api/img/dbd.png'} alt="" />
              <Text fz={'h4'} fw={'bold'} >
                {item.title}
              </Text>
            <Text fz={'h6'} pb={10}>
              Diposting: {new Date(item.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })} | Dinas Kesehatan
            </Text>
            <Text fz={'h4'} pb={10} lineClamp={2}>
              {item.content}
            </Text>
            <Anchor c={'black'} onClick={()=> router.push(`/darmasaba/kesehatan/data-kesehatan-warga/artikel-kesehatan-page/${item.id}`)} variant='transparent'>
              <Text c={colors['blue-button']} fz={'h4'} >
                Baca Selengkapnya {'>>'}
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

export default ArtikelKesehatanPage;
