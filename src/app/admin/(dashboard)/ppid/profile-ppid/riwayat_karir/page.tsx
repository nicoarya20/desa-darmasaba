'use client';

import { Box, Text } from '@mantine/core';
import React from 'react';
import { useProxy } from 'valtio/utils';
import dynamic from 'next/dynamic';
import stateProfilePPID from '../../../_state/ppid/profile_ppid/profile_PPID';

// ini penting
const PPIDEditor = dynamic(() => import('../../_com/ppid_Editor').then(mod => mod.PPIDEditor), {
  ssr: false, // disable server side rendering
});

function RiwayatKarir() {
  const biodataState = useProxy(stateProfilePPID.profilePPID);

  return (
    <Box>
      <Text fw={"bold"}>Riwayat Karir</Text>
      <PPIDEditor
        showSubmit={false}
        onChange={(val) => {
          biodataState.create.form.riwayat = val;
        }}
      />
    </Box>
  );
}

export default RiwayatKarir;
