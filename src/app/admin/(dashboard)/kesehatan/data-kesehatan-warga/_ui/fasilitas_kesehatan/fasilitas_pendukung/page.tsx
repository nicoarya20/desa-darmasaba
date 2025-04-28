import stateFasilitasKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/fasilitasKesehatan';
import { Box, Text } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import { KesehatanEditor } from '../../../_com/kesehatanEditor';

function FasilitasPendukung() {
  const fasilitaspendukungState = useProxy(stateFasilitasKesehatan.fasilitaspendukung)
  return <Box>
    <Text fw={"bold"}>Fasilitas Pendukung</Text>
    <KesehatanEditor 
        showSubmit={false}
        onChange={(val) => {
          fasilitaspendukungState.create.form.content = val;
        }} />
  </Box>
}

export default FasilitasPendukung;
