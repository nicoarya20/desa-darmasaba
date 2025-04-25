import { Box, Text } from '@mantine/core';
import { BeritaEditor } from '@/app/admin/(dashboard)/desa/berita/_com/BeritaEditor';
import stateKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/kesehatan';
import { useProxy } from 'valtio/utils';

function ProsedurPendaftaran() {
  const prosedurpendaftaranState = useProxy(stateKesehatan.prosedurpendaftaran)
  return <Box>
      <Text fw={"bold"}>Prosedur Pendaftaran</Text>
      <BeritaEditor onSubmit={(val) => {
        prosedurpendaftaranState.create.form.content = val
        prosedurpendaftaranState.create.create()
      }} />
    </Box>
  
}

export default ProsedurPendaftaran;
