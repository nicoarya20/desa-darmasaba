'use client'
import colors from '@/con/colors';
import { Box, Paper, Text } from '@mantine/core';
import { KesehatanEditor } from '../../_com/kesehatanEditor';
import stateArtikelKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
import { useProxy } from 'valtio/utils';

function DoctorSignUI() {
  const doctorSign = useProxy(stateArtikelKesehatan.doctorSign)
  return (
    <Box>
      <Paper bg={colors['white-1']} p={'md'}>
        <Text fw={"bold"}>Kapan Harus ke Dokter</Text>
        <KesehatanEditor
          showSubmit={false}
          onChange={(val) => {
            doctorSign.create.form.content = val
          }}
        />
      </Paper>
    </Box>
  );
}

export default DoctorSignUI;
