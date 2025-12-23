// components/modal/ModalKonfirmasiHapus.tsx
import colors from "@/con/colors"
import { Modal, Text, Button, Flex } from "@mantine/core"

interface ModalKonfirmasiNonAktifProps {
  opened: boolean
  loading?: boolean
  onClose: () => void
  onConfirm: () => void
  text: string
}

export function ModalKonfirmasiNonAktif({
  opened,
  loading = false,
  onClose,
  onConfirm,
  text,
}: ModalKonfirmasiNonAktifProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={"bold"} fz={"xl"}>Konfirmasi Non Aktif</Text>}
      centered
    >
      <Text mb="md">{text}</Text>
      <Flex justify="flex-end" gap="sm">
        <Button style={{color: "white"}} bg={colors['blue-button']} variant="default" onClick={onClose}>Batal</Button>
        <Button color="red" onClick={onConfirm} loading={loading}>
          Yakin Non Aktif
        </Button>
      </Flex>
    </Modal>
  )
}
