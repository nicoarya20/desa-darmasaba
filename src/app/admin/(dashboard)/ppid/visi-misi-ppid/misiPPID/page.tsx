'use client'
import { Box, Text } from '@mantine/core';
import { useProxy } from 'valtio/utils';
import { PPIDTextEditor } from '../../_com/PPIDTextEditor';
import stateVisiMisiPPID from '../../../_state/ppid/visi_misi_ppid/visimisiPPID';

function MisiPPID() {
  const misiState = useProxy(stateVisiMisiPPID)
  return (
    <Box>
      <Text fw={"bold"}>Misi PPID</Text>
      <PPIDTextEditor
      key={misiState.findById.data?.id ?? 'new'}
      showSubmit={false}
      onChange={(val) => {
        if(misiState.findById.data){
          misiState.findById.data.misi = val
        }
      }}
      initialContent={misiState.findById.data?.misi ?? ''}
      />
    </Box>
  );
}

export default MisiPPID;
