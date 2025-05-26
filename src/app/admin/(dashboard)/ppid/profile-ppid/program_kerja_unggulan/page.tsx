'use client'
import { Box, Text } from '@mantine/core';
import React from 'react';
import { useProxy } from 'valtio/utils';
import stateProfilePPID from '../../../_state/ppid/profile_ppid/profile_PPID';
import { PPIDTextEditor } from '../../_com/PPIDTextEditor';

function ProgramKerjaUnggulan() {
  const programKerjaUnggulanState = useProxy(stateProfilePPID)
  return (<Box>
    <Text fw={"bold"}>Program Kerja Unggulan</Text>
    <PPIDTextEditor
    key={programKerjaUnggulanState.findById.data?.id ?? 'new'}
    showSubmit={false}
    onChange={(val) => {
      if (programKerjaUnggulanState.findById.data) {
        programKerjaUnggulanState.findById.data.unggulan = val;
      }
    }}
    initialContent={programKerjaUnggulanState.findById.data?.unggulan ?? ''}
    />
  </Box>
  );
}

export default ProgramKerjaUnggulan;
