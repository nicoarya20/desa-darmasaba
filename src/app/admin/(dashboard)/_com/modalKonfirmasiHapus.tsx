// components/modal/ModalKonfirmasiHapus.tsx
import { Modal, Text, Button, Flex } from "@mantine/core"

interface ModalKonfirmasiHapusProps {
  opened: boolean
  loading?: boolean
  onClose: () => void
  onConfirm: () => void
  text: string
}

export function ModalKonfirmasiHapus({
  opened,
  loading = false,
  onClose,
  onConfirm,
  text,
}: ModalKonfirmasiHapusProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Konfirmasi Hapus"
      centered
    >
      <Text mb="md">{text}</Text>
      <Flex justify="flex-end" gap="sm">
        <Button variant="default" onClick={onClose}>Batal</Button>
        <Button color="red" onClick={onConfirm} loading={loading}>
          Yakin Hapus
        </Button>
      </Flex>
    </Modal>
  )
}
