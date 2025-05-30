'use client';

import { Box, Text } from '@mantine/core';
import React from 'react';
import { useProxy } from 'valtio/utils';
import dynamic from 'next/dynamic';
import stateProfilePPID from '../../../_state/ppid/profile_ppid/profile_PPID';

// ini penting
const PPIDTextEditor = dynamic(() => import('../../_com/PPIDTextEditor').then(mod => mod.PPIDTextEditor), {
  ssr: false, // disable server side rendering
});
function RiwayatKarir() {
  const riwayatKarirState = useProxy(stateProfilePPID);

  return (
    <Box>
      <Text fw={"bold"}>Riwayat Karir</Text>
      <PPIDTextEditor
      key={riwayatKarirState.findById.data?.id ?? 'new'}
        showSubmit={false}
        onChange={(val) => {
          if (riwayatKarirState.findById.data) {
            riwayatKarirState.findById.data.riwayat = val;
          }
        }}
        initialContent={riwayatKarirState.findById.data?.riwayat ?? ''}
      />
    </Box>
  );
}

export default RiwayatKarir;
