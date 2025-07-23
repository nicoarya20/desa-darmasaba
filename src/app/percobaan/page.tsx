'use client'
import ApiFetch from '@/lib/api-fetch';
import { Button, Card, Container, FileInput, Flex, Image, SimpleGrid, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';
import { toast } from 'react-toastify';

function Page() {

  const [gambar, setGambar] = useState<string | null>(null);
  const [listFile, setListFile] = useState<string[]>([])
  const [fileNya, setFileNya] = useState<File | null>(null)


  const loadListFile = async () => {
    const { data } = await ApiFetch.api.fileStorage.findMany.get()
    setListFile(data?.data?.map((item) => item.link) || [])
  }
  useShallowEffect(() => {
    loadListFile()
  }, [])  

  const submit = async () => {
    console.log("kirim gamabar")
    const file = fileNya
    if (!file) return toast.warn("file dibutuhkan");
  
    const { data } = await ApiFetch.api.fileStorage.create.post({
      file: file,
      name: file.name
    })

    console.log(data?.data)
    setGambar(data?.data?.link || null)
    toast.success("berhasil upload")
    loadListFile()
    setGambar(null)

  }
  return (
    <Container w={"90%"} >
      <Stack>
        <Text>Uoload gambar</Text>
        <Card withBorder>
          <Flex gap={"lg"} >
            <FileInput label={"upload gambar"} onChange={async (e) => {
              console.log(e?.name)
              setGambar(e ? "data:image/png;base64," + Buffer.from(await e.arrayBuffer()).toString("base64") : null)
              setFileNya(e)
            }} />
            <Button onClick={submit}>submit</Button>
          </Flex>
          {gambar && <Image w={400} src={gambar || null} alt="gambar" />}
        </Card>


        <SimpleGrid cols={6} p={"lg"}>
          {listFile.map((v) => (
            <Image key={v} src={v} alt="gambar" />
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}

export default Page;