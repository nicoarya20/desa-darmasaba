import {
  desaMenu,
  ekonomiMenu,
  inovasiMenu,
  keamananMenu,
  kependudukanMenu,
  kesehatanMenu,
  landingPageMenu,
  lingkunganMenu,
  musikMenu,
  pendidikanMenu,
  pengaturanMenu,
  ppidMenu,
  userRoleMenu,
} from "./domains"

export { pengaturanMenu, userRoleMenu }

// Section domain sidebar sesuai urutan tampil; juga urutan kelompok di Pengaturan → Sampah.
export const allDomains = [
  landingPageMenu,
  ppidMenu,
  desaMenu,
  kesehatanMenu,
  keamananMenu,
  ekonomiMenu,
  inovasiMenu,
  lingkunganMenu,
  pendidikanMenu,
  kependudukanMenu,
  musikMenu,
]

export const navBar = [...allDomains, userRoleMenu]

export const devBar = [...allDomains, userRoleMenu]

export const role1 = [
  landingPageMenu,
  ppidMenu,
  desaMenu,
  keamananMenu,
  ekonomiMenu,
  inovasiMenu,
  lingkunganMenu,
  kependudukanMenu,
  musikMenu,
]

export const role2 = [kesehatanMenu, musikMenu]

export const role3 = [pendidikanMenu, musikMenu]
