import {
  desaMenu,
  developerMenu,
  ekonomiMenu,
  indeksDesaMenu,
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

export { developerMenu, pengaturanMenu, userRoleMenu }

const allDomains = [
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
  indeksDesaMenu,
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
  indeksDesaMenu,
  musikMenu,
]

export const role2 = [kesehatanMenu, musikMenu]

export const role3 = [pendidikanMenu, musikMenu]
