'use client'
import { Box, Text } from '@mantine/core';
import React from 'react';
import { useProxy } from 'valtio/utils';
import stateProfilePPID from '../../../_state/ppid/profile_ppid/profile_PPID';
import { PPIDTextEditor } from '../../_com/PPIDTextEditor';

function PengalamanOrganisasi() {
  const pengalamanOrganisasiState = useProxy(stateProfilePPID)
  return (<Box>
    <Text fw={"bold"}>Pengalaman Organisasi</Text>
    <PPIDTextEditor
    key={pengalamanOrganisasiState.findById.data?.id ?? 'new'}
    showSubmit={false}
    onChange={(val) => {
      if (pengalamanOrganisasiState.findById.data) {
        pengalamanOrganisasiState.findById.data.pengalaman = val;
      }
    }}
    initialContent={pengalamanOrganisasiState.findById.data?.pengalaman ?? ''}
    />
  </Box>
  );
}

export default PengalamanOrganisasi;
