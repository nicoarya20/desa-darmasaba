/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React from 'react'
import {
  IconLeaf,
  IconTrophy,
  IconTent,
  IconChartLine,
  IconRecycle,
  IconTruck,
  IconScale,
  IconClipboard,
  IconTrash,
  IconHomeEco,
  IconChristmasTreeFilled,
  IconTrendingUp,
  IconShieldFilled,
  IconHome,
  IconTree,
  IconDroplet,
  IconCash,
  IconSchool,
  IconShoppingCart,
  IconHospital,
  IconAmbulance,
  IconFiretruck,
  IconBuilding,
  IconAlertTriangle,

  // ===== Tambahan =====
  IconLifebuoy,
  IconRun,
  IconShield,
  IconPhoneCall,
  IconFirstAidKit,
  IconStethoscope,
  IconBuildingCommunity,
  IconFileText,
  IconInfoCircle,
  IconMessageReport,
  IconUsers,
  IconQuestionMark,
} from '@tabler/icons-react'

/* =======================
   Icon Keys (DB Safe)
======================= */
export type IconKey =
  | 'ekowisata'
  | 'kompetisi'
  | 'wisata'
  | 'ekonomi'
  | 'sampah'
  | 'truck'
  | 'scale'
  | 'clipboard'
  | 'trash'
  | 'lingkunganSehat'
  | 'sumberOksigen'
  | 'ekonomiBerkelanjutan'
  | 'mencegahBencana'
  | 'rumah'
  | 'pohon'
  | 'air'
  | 'bantuan'
  | 'pelatihan'
  | 'subsidi'
  | 'layananKesehatan'

  // ===== Keamanan & Darurat =====
  | 'polisi'
  | 'ambulans'
  | 'pemadam'
  | 'darurat'
  | 'sar'
  | 'evakuasi'
  | 'keamanan'
  | 'teleponDarurat'

  // ===== Kesehatan =====
  | 'rumahSakit'
  | 'puskesmas'
  | 'klinik'

  // ===== Pemerintahan =====
  | 'bangunan'
  | 'kantorDesa'
  | 'administrasi'
  | 'informasi'
  | 'pengaduan'
  | 'layananPublik'

/* =======================
   Icon Map
======================= */
const iconMap: Record<IconKey, React.FC<any>> = {
  ekowisata: IconLeaf,
  kompetisi: IconTrophy,
  wisata: IconTent,
  ekonomi: IconChartLine,
  sampah: IconRecycle,
  truck: IconTruck,
  scale: IconScale,
  clipboard: IconClipboard,
  trash: IconTrash,
  lingkunganSehat: IconHomeEco,
  sumberOksigen: IconChristmasTreeFilled,
  ekonomiBerkelanjutan: IconTrendingUp,
  mencegahBencana: IconShieldFilled,
  rumah: IconHome,
  pohon: IconTree,
  air: IconDroplet,
  bantuan: IconCash,
  pelatihan: IconSchool,
  subsidi: IconShoppingCart,
  layananKesehatan: IconHospital,

  // ===== Keamanan & Darurat =====
  polisi: IconShieldFilled,
  ambulans: IconAmbulance,
  pemadam: IconFiretruck,
  darurat: IconAlertTriangle,
  sar: IconLifebuoy,
  evakuasi: IconRun,
  keamanan: IconShield,
  teleponDarurat: IconPhoneCall,

  // ===== Kesehatan =====
  rumahSakit: IconHospital,
  puskesmas: IconFirstAidKit,
  klinik: IconStethoscope,

  // ===== Pemerintahan =====
  bangunan: IconBuilding,
  kantorDesa: IconBuildingCommunity,
  administrasi: IconFileText,
  informasi: IconInfoCircle,
  pengaduan: IconMessageReport,
  layananPublik: IconUsers,
}

/* =======================
   Icon Mapper Component
======================= */
type Props = {
  name: IconKey
  size?: number
  color?: string
}

export const IconMapper: React.FC<Props> = ({
  name,
  size = 24,
  color,
}) => {
  const IconComponent = iconMap[name] ?? IconQuestionMark
  return <IconComponent size={size} color={color} />
}
