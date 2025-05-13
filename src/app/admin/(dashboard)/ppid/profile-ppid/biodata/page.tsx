'use client'
import { Box, Group, Text } from '@mantine/core';
import React from 'react';

import { useProxy } from 'valtio/utils';
import stateProfilePPID from '../../../_state/ppid/profile_ppid/profile_PPID';
import { PPIDTextEditor } from '../../_com/PPIDTextEditor';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { IconUpload, IconX, IconPhoto } from '@tabler/icons-react';


function Biodata() {
  const biodataState = useProxy(stateProfilePPID)
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("id", biodataState.findById.data?.id ?? ''); // pastikan ID-nya sesuai
  
    const res = await fetch("/api/ppid/profileppid/edit-img", {
      method: "POST",
      body: formData,
    });
  
    const result = await res.json();
  
    if (result.success && biodataState.findById.data) {
      biodataState.findById.data.imageUrl = result.url;
    }
  };
  return (<Box>
    <Text fw={"bold"}>Biodata</Text>
    <Dropzone
    mb={20}
      onDrop={(files) => {
        const file = files[0];
        const currentId = biodataState.findById.data?.id;
        if (file && currentId) {
          handleUpload(file);
        }
      }}
      onReject={() => console.log('File rejected')}
      maxSize={5 * 1024 ** 2} // 5MB
      accept={[MIME_TYPES.jpeg, MIME_TYPES.png, MIME_TYPES.webp]}
      loading={stateProfilePPID.uploadImage.loading}
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
