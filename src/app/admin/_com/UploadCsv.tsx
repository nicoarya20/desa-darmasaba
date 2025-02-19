"use client";
import ApiFetch from "@/lib/api-fetch";
import { Group, Stack, Text } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { useState } from "react";
import toast from "react-simple-toasts";

export default function UploadCsv() {
  return (
    <Stack p={"md"}>
      <DropUpload />
    </Stack>
  );
}

function DropUpload() {
  const [loading, setLoading] = useState(false);

  return (
    <Stack justify="center" align="center">
      <Group>
        <Dropzone
          loading={loading}
          miw={460}
          // accept csv
          accept={["text/csv"]}
          onDrop={async (droppedFiles) => {
            if (droppedFiles.length < 0) {
              return toast("Tidak ada file yang diunggah");
            }

            setLoading(true);
            for (const file of droppedFiles) {
              await ApiFetch.api["upl-csv-single"].post({
                name: file.name,
                file,
              });
            }
            setLoading(false);
          }}
        >
          <Stack>
            <Text ta="center">Drop Csv here</Text>
          </Stack>
        </Dropzone>
      </Group>
    </Stack>
  );
}
