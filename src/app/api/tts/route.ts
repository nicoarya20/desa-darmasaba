// app/api/tts/route.ts
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text || text.length > 500) {
    return new Response('Teks terlalu panjang atau kosong', { status: 400 });
  }

  const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': process.env.ELEVENLABS_API_KEY!, // Simpan di .env.local
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.7,
        similarity_boost: 0.8,
      },
    }),
  });

  if (!res.ok) {
    return new Response('Gagal generate suara', { status: 500 });
  }

  const audioBuffer = await res.arrayBuffer();
  return new Response(audioBuffer, {
    headers: { 'Content-Type': 'audio/mpeg' },
  });
}