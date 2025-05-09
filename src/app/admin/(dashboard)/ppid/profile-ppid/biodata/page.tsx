'use client'
import { Box, Text } from '@mantine/core';
import React from 'react';

import { useProxy } from 'valtio/utils';
import stateProfilePPID from '../../../_state/ppid/profile_ppid/profile_PPID';
import { PPIDEditor } from '../../_com/ppid_Editor';

function Biodata() {
  const biodataState = useProxy(stateProfilePPID.profilePPID)
  return (<Box>
    <Text fw={"bold"}>Biodata</Text>
    <PPIDEditor
    showSubmit={false}
    onChange={(val) => {
      biodataState.create.form.biodata = val
    }}
    />
  </Box>
    
  );
}

export default Biodata;
