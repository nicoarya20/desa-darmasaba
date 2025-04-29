import stateFasilitasKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import { Box, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';

function ListProsedurPendaftaran() {
  const prosedurpendaftaranState = useProxy(stateFasilitasKesehatan.prosedurpendaftaran)
  useShallowEffect(() => {
    prosedurpendaftaranState.findMany.load()
  }, [])

  if (!prosedurpendaftaranState.findMany.data)return<Stack>
    {Array.from({ length: 10 }).map((v, k) => <Skeleton key={k} h={40} />)}
  </Stack>
  
  return <Stack>
    {prosedurpendaftaranState.findMany.data?.map((item) => (
      <Box key={item.id}>
        <Text dangerouslySetInnerHTML={{__html: item.content}}/>
      </Box>
    ))}
  </Stack>
}

export default ListProsedurPendaftaran;
