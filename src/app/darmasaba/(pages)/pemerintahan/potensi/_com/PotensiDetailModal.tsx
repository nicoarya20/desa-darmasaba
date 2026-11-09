import { Image, Modal } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { PotensiDetailInfo } from "./PotensiDetailInfo";
import { sanitizePotensiHtml, type PotensiItem } from "./potensi.logic";
import s from "./potensi-detail.module.css";
import { POTENSI_TEXT } from "./potensi.text";

type Props = { item: PotensiItem | null; opened: boolean; onClose: () => void };

/** Isi overlay: hero foto (kategori + judul), deskripsi lengkap, info (lokasi/pengelola/status) + dokumentasi. Modal.Title/Body memberi nama & deskripsi dialog. */
function DetailContent({ item, onClose }: { item: PotensiItem; onClose: () => void }) {
  const content = sanitizePotensiHtml(item.content);
  const kategori = item.kategori?.nama;

  return (
    <>
      <div className={s.hero}>
        {item.image?.link ? <Image src={item.image.link} alt="" className={s.heroImage} /> : null}
        <span className={s.heroShade} aria-hidden />
        <button type="button" className={s.closeButton} aria-label={POTENSI_TEXT.close} onClick={onClose}>
          <IconX size={22} stroke={2.2} aria-hidden />
        </button>
        <div className={s.heroText}>
          {kategori ? <span className={s.heroBadge}>{kategori}</span> : null}
          <Modal.Title className={s.heroTitle}>{item.name}</Modal.Title>
        </div>
      </div>
      {/* Padding di div dalam: padding bawaan Modal.Body (selector :not(:only-child)) sulit ditimpa dari CSS module. */}
      <Modal.Body>
        <div className={s.detailBody}>
          {content ? (
            <div className={s.richText} dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <p className={s.richText}>{POTENSI_TEXT.emptyDescription}</p>
          )}
          <PotensiDetailInfo item={item} />
        </div>
      </Modal.Body>
    </>
  );
}

/** Overlay detail potensi di atas halaman yang di-blur; tutup lewat tombol ×, Escape, atau klik di luar kartu. */
export function PotensiDetailModal({ item, opened, onClose }: Props) {
  return (
    <Modal.Root
      opened={opened && item !== null}
      onClose={onClose}
      centered
      size={760}
      radius={28}
      padding={0}
      transitionProps={{ transition: "pop", duration: 220 }}
      classNames={{ content: s.modalContent }}
    >
      <Modal.Overlay backgroundOpacity={0.45} blur={10} />
      <Modal.Content>
        {item ? <DetailContent item={item} onClose={onClose} /> : null}
      </Modal.Content>
    </Modal.Root>
  );
}
