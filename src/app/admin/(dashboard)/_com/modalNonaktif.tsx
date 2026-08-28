// components/modal/ModalKonfirmasiHapus.tsx
import colors from "@/con/colors"
import { Modal, Text, Button, Flex } from "@mantine/core"

interface ModalKonfirmasiNonAktifProps {
  opened: boolean
  loading?: boolean
  onClose: () => void
  onConfirm: () => void
  text: string
  title?: string
  confirmLabel?: string
  confirmColor?: string
}

export function ModalKonfirmasiNonAktif({
  opened,
  loading = false,
  onClose,
  onConfirm,
  text,
  title = "Konfirmasi Non Aktif",
  confirmLabel = "Yakin Non Aktif",
  confirmColor = "red",
}: ModalKonfirmasiNonAktifProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={"bold"} fz={"xl"}>{title}</Text>}
      centered
    >
      <Text mb="md">{text}</Text>
      <Flex justify="flex-end" gap="sm">
        <Button style={{color: "white"}} bg={colors['blue-button']} variant="default" onClick={onClose}>Batal</Button>
        <Button color={confirmColor} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </Flex>
    </Modal>
  )
}
