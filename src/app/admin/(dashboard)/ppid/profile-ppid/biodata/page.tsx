'use client'
import { Box, Group, Text } from '@mantine/core';
import { useState } from 'react';

import ApiFetch from '@/lib/api-fetch';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useProxy } from 'valtio/utils';
import stateProfilePPID from '../../../_state/ppid/profile_ppid/profile_PPID';
import { PPIDTextEditor } from '../../_com/PPIDTextEditor';

function Biodata() {
  const biodataState = useProxy(stateProfilePPID)
  const [loading, setLoading] = useState(false);
  
  return (<Box>
    <Text fw={"bold"}>Biodata</Text>
    <Dropzone
    mb={20}
      onDrop={async (droppedFiles) => {
        setLoading(true);
        for (const file of droppedFiles) {
          await ApiFetch.api.ppid.profileppid["edit-img"].post({
            file: file,
            id: biodataState.findById.data?.id,
          });
        }

        setLoading(false);
        if (biodataState.findById.data?.id) {
          biodataState.findById.load(biodataState.findById.data.id);
        }
      }}
      accept={[MIME_TYPES.jpeg, MIME_TYPES.png, MIME_TYPES.webp]}
      loading={loading}
    >
      <Group justify="center" gap="md" mih={150} style={{ pointerEvents: 'none' }}>
        <Dropzone.Accept>
          <IconUpload size={50} stroke={1.5} />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX size={50} stroke={1.5} />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconPhoto size={50} stroke={1.5} />
        </Dropzone.Idle>

        <div>
          <Text size="xl" inline>
            Drag & drop gambar di sini atau klik untuk pilih file
          </Text>
          <Text size="sm" c="dimmed" inline mt={7}>
            Maksimal ukuran file 5MB. Format: JPG, PNG, WebP
          </Text>
        </div>
      </Group>
    </Dropzone>
    
    
    
    <PPIDTextEditor
      key={biodataState.findById.data?.id ?? 'new'}
      showSubmit={false}
      onChange={(val) => {
        if (biodataState.findById.data) {
          biodataState.findById.data.biodata = val;
        }
      }}
      initialContent={biodataState.findById.data?.biodata ?? ''}
    />
   
  </Box>
  );
}

export default Biodata;