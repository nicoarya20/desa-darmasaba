/**
 * Admin Module States
 * 
 * State management untuk modul-modul admin
 * Menggunakan Valtio untuk reactive state
 */

import { proxy } from "valtio";

// Keamanan Module State
export const adminKeamananState = proxy<{
  selectedLayanan: string | null;
  setSelectedLayanan: (layanan: string | null) => void;
}>({
  selectedLayanan: null,
  setSelectedLayanan(layanan: string | null) {
    adminKeamananState.selectedLayanan = layanan;
  },
});

// PPID Module State
export const adminPpidState = proxy<{
  selectedPermohonan: string | null;
  setSelectedPermohonan: (permohonan: string | null) => void;
}>({
  selectedPermohonan: null,
  setSelectedPermohonan(permohonan: string | null) {
    adminPpidState.selectedPermohonan = permohonan;
  },
});

// Musik Module State
export const adminMusikState = proxy<{
  selectedMusik: string | null;
  setSelectedMusik: (musik: string | null) => void;
}>({
  selectedMusik: null,
  setSelectedMusik(musik: string | null) {
    adminMusikState.selectedMusik = musik;
  },
});

export default adminKeamananState;
