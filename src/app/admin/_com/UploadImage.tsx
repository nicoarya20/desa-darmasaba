"use client";
import ApiFetch from "@/lib/api-fetch";
import stateListImage from "@/state/state-list-image";
import { Stack, Text } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useState } from "react";

export default function UploadImage() {
  const [loading, setLoading] = useState(false);
  return (
    <Stack p={"md"}>
      <Dropzone
        loading={loading}
        accept={IMAGE_MIME_TYPE} // Hanya menerima tipe file gambar
        onDrop={async (droppedFiles) => {
          setLoading(true);
          for (const file of droppedFiles) {
            await ApiFetch.api["upl-img-single"].post({
              file: file,
              name: file.name,
            });
          }

          setLoading(false);
          stateListImage.load();
        }}
      >
        <Stack align="center">
          <Text ta="center">Drop images here</Text>
        </Stack>
      </Dropzone>
    </Stack>
  );
}
