/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/auth/_lib/api_fetch_auth.ts

// app/api/auth/_lib/api_fetch_auth.ts

export const apiFetchLogin = async ({ nomor }: { nomor: string }) => {
  if (!nomor || nomor.replace(/\D/g, '').length < 10) {
    throw new Error('Nomor tidak valid');
  }

  const cleanPhone = nomor.replace(/\D/g, '');

  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nomor: cleanPhone }),
  });

  // Pastikan respons bisa di-parse sebagai JSON
  let data;
  try {
    data = await response.json();
  } catch (e) {
    console.error("Non-JSON response from /api/auth/login:", await response.text());
    throw new Error('Respons server tidak valid');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Gagal memproses login');
  }

  // Validasi minimal respons
  if (typeof data.success !== 'boolean' || typeof data.isRegistered !== 'boolean') {
    throw new Error('Respons tidak sesuai format');
  }

  if (data.success) {
    if (data.isRegistered && !data.kodeId) {
      throw new Error('Kode verifikasi tidak ditemukan untuk user terdaftar');
    }
    return data; // { success, isRegistered, kodeId? }
  } else {
    throw new Error(data.message || 'Login gagal');
  }
};

export const apiFetchRegister = async ({
  username,
  nomor,
}: {
  username: string;
  nomor: string;
}) => {
  const cleanPhone = nomor.replace(/\D/g, '');
  if (cleanPhone.length < 10) throw new Error('Nomor tidak valid');

  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username.trim(), nomor: cleanPhone }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Gagal mengirim OTP');

  return data;
};

export const apiFetchOtpData = async ({ kodeId }: { kodeId: string }) => {
  if (!kodeId) {
    throw new Error('Kode ID tidak valid');
  }

  const response = await fetch("/api/auth/otp-data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kodeId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Gagal memuat data OTP');
  }

  return data;
};

export const apiFetchVerifyOtp = async ({
  nomor,
  otp,
  kodeId
}: {
  nomor: string;
  otp: string;
  kodeId: string;
}) => {
  if (!nomor || !otp || !kodeId) {
    throw new Error('Data verifikasi tidak lengkap');
  }

  if (!/^\d{4,6}$/.test(otp)) {
    throw new Error('Kode OTP harus 4-6 digit angka');
  }

  const response = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nomor, otp, kodeId }),
  });

  const data = await response.json();

  // ✅ Jangan throw error untuk status 4xx — biarkan frontend handle
  return {
    success: response.ok,
    ...data,
    status: response.status,
  };
};