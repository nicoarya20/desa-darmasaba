'use client';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import { labelKategoriEvent, warnaKategoriEvent } from '@/lib/agenda-desa';
import { Modal } from '@mantine/core';
import { IconCalendarEvent, IconMapPin } from '@tabler/icons-react';
import { varWarnaKategori } from './agenda.meta';
import { AGENDA_TEXT } from './agenda.text';
import { AgendaHitungPil } from './agenda-hitung';
import { BaliHariIsi } from './kalender-bali-hari';
import { hitungMundur, teksTanggalAcara, type AgendaItem } from './kalender.logic';
import s from './agenda-panel.module.css';

/**
 * Isi yang sedang dibuka: satu acara, atau satu hari (dari tanggal / "+N lainnya") — `hari` terisi →
 * semua acara hari itu + rerainan + wariga.
 */
export type AgendaDetail = { judul: string | null; items: AgendaItem[]; hari?: number };

/** Rincian acara (kategori, nama, hitung mundur, tanggal, lokasi, deskripsi) atau rincian satu hari. */
export function AgendaDetailModal({
  detail,
  now,
  tampilRerainan,
  onClose,
}: {
  detail: AgendaDetail | null;
  now: Date;
  tampilRerainan: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      opened={detail !== null}
      onClose={onClose}
      title={detail?.judul ?? undefined}
      withCloseButton
      closeButtonProps={{ 'aria-label': AGENDA_TEXT.detail.tutup }}
      centered
      radius={18}
      size={560}
      styles={{ content: KABAR_BRAND_VARS }}
      classNames={{ content: s.modalContent, title: s.modalTitle, header: s.modalHeader, body: s.modalBody }}
    >
      {detail?.items.map((item) => (
        <AgendaDetailIsi key={item.id} item={item} now={now} />
      ))}
      {detail?.hari !== undefined && (
        <>
          {detail.items.length === 0 && <p className={s.tanpaAgenda}>{AGENDA_TEXT.detail.tanpaAgenda}</p>}
          <BaliHariIsi hari={detail.hari} agenda={detail.items} tampilRerainan={tampilRerainan} />
        </>
      )}
    </Modal>
  );
}

/** Satu blok rincian acara (dipakai modal; juga bisa diuji tanpa portal). */
export function AgendaDetailIsi({ item, now }: { item: AgendaItem; now: Date }) {
  const hitung = hitungMundur(item, now);
  return (
    <article className={s.detail} style={varWarnaKategori(warnaKategoriEvent(item.kategori))}>
      <p className={s.detailKategori}>{labelKategoriEvent(item.kategori)}</p>
      <h2 className={s.detailNama}>{item.nama}</h2>
      <AgendaHitungPil hitung={hitung} />
      <dl className={s.detailInfo}>
        <div>
          <dt>
            <IconCalendarEvent size={18} stroke={1.75} aria-hidden />
            <span className={s.srOnly}>{AGENDA_TEXT.detail.tanggal}</span>
          </dt>
          <dd>{teksTanggalAcara(item)}</dd>
        </div>
        {item.lokasi && (
          <div>
            <dt>
              <IconMapPin size={18} stroke={1.75} aria-hidden />
              <span className={s.srOnly}>{AGENDA_TEXT.detail.lokasi}</span>
            </dt>
            <dd>{item.lokasi}</dd>
          </div>
        )}
      </dl>
      {item.deskripsi && <p className={s.detailDeskripsi}>{item.deskripsi}</p>}
    </article>
  );
}
