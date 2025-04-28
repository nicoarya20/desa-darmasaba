import stateFasilitasKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/fasilitasKesehatan';
import { Box, Text } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import { KesehatanEditor } from '../../../_com/kesehatanEditor';

function ProsedurPendaftaran() {
  const prosedurpendaftaranState = useProxy(stateFasilitasKesehatan.prosedurpendaftaran)
  return <Box>
      <Text fw={"bold"}>Prosedur Pendaftaran</Text>
      <KesehatanEditor 
          showSubmit={false}
          onChange={(val) => {
            prosedurpendaftaranState.create.form.content = val;
          }} />
    </Box>
  
}

export default ProsedurPendaftaran;
