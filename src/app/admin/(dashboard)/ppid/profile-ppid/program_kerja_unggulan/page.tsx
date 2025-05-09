'use client'
import { Box, Text } from '@mantine/core';
import React from 'react';
import { useProxy } from 'valtio/utils';
import stateProfilePPID from '../../../_state/ppid/profile_ppid/profile_PPID';
import { PPIDEditor } from '../../_com/ppid_Editor';

function ProgramKerjaUnggulan() {
  const programKerjaUnggulanState = useProxy(stateProfilePPID.profilePPID)
  return (<Box>
    <Text fw={"bold"}>Program Kerja Unggulan</Text>
    <PPIDEditor
    showSubmit={false}
    onChange={(val) => {
      programKerjaUnggulanState.create.form.unggulan = val
    }}
    />
  </Box>
  );
}

export default ProgramKerjaUnggulan;
