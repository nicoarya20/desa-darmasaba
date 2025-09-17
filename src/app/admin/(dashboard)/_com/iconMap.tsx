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
} from '@tabler/icons-react'

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
  | 'polisi'
  | 'ambulans'
  | 'pemadam'
  | 'rumahSakit'
  | 'bangunan'
  | 'darurat'


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
  polisi: IconShieldFilled,
  ambulans: IconAmbulance,
  pemadam: IconFiretruck,
  rumahSakit: IconHospital,
  bangunan: IconBuilding,
  darurat: IconAlertTriangle
}

type Props = {
  name: IconKey
  size?: number
  color?: string
}

export const IconMapper: React.FC<Props> = ({ name, size = 24, color }) => {
  const IconComponent = iconMap[name]
  if (!IconComponent) return null
  return <IconComponent size={size} color={color} />
}
