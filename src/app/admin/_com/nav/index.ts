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
  ppidMenu,
  userRoleMenu,
} from "./domains"

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
