'use client'
import { Box, Text } from '@mantine/core';
import React from 'react';
import { useProxy } from 'valtio/utils';
import stateProfilePPID from '../../../_state/ppid/profile_ppid/profile_PPID';
import { PPIDEditor } from '../../_com/ppid_Editor';

function PengalamanOrganisasi() {
  const pengalamanOrganisasiState = useProxy(stateProfilePPID.profilePPID)
  return (<Box>
    <Text fw={"bold"}>Pengalaman Organisasi</Text>
    <PPIDEditor
    showSubmit={false}
    onChange={(val) => {
      pengalamanOrganisasiState.create.form.pengalaman = val
    }}
    />
  </Box>
  );
}

export default PengalamanOrganisasi;
