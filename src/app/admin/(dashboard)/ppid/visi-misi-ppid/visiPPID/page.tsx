'use client'
import { Box, Text } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import { PPIDTextEditor } from '../../_com/PPIDTextEditor';
import stateVisiMisiPPID from '../../../_state/ppid/visi_misi_ppid/visimisiPPID';

function VisiPPID() {
  const visiState = useProxy(stateVisiMisiPPID)
  return (
    <Box>
      <Text fw={"bold"}>Visi PPID</Text>
      <PPIDTextEditor
      key={visiState.findById.data?.id ?? 'new'}
      showSubmit={false}
      onChange={(val) => {
        if(visiState.findById.data){
          visiState.findById.data.visi = val
        }
      }}
      initialContent={visiState.findById.data?.visi ?? ''}
      />
    </Box>
  );
}

export default VisiPPID;
