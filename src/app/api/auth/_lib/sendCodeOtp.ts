// app/api/auth/_lib/sendCodeOtp.ts

const sendCodeOtp = async ({
  nomor,
  codeOtp,
  newMessage,
}: {
  nomor: string;
  codeOtp?: string | number;
  newMessage?: string;
}) => {
  const msg =
    newMessage ||
    `Website Desa Darmasaba - Kode ini bersifat RAHASIA dan JANGAN DI BAGIKAN KEPADA SIAPAPUN, termasuk anggota ataupun Admin lainnya.\n\n>> Kode OTP anda: ${codeOtp}.`;
  const enCode = msg;

  const res = await fetch(`https://otp.wibudev.com/api/wa/send-text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.WA_SERVER_TOKEN}`,
    },
    body: JSON.stringify({
      number: nomor,
      text: enCode,
    }),
  });

  return res;
};

export { sendCodeOtp };
