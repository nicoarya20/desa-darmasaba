// Koneksi WebRTC ke gateway: mikrofon keluar, data channel `oai-events`, audio jawaban masuk.

export interface PeerOptions {
  mic: MediaStream;
  /** Tukar SDP offer dengan answer lewat server. */
  exchange(offerSdp: string): Promise<string>;
  onEvent(event: Record<string, unknown>): void;
  onClose(reason: string): void;
  onRemoteStream(stream: MediaStream): void;
}

export interface Peer {
  send(event: Record<string, unknown>): boolean;
  close(): void;
}

const CHANNEL_OPEN_TIMEOUT_MS = 15_000;
const EVENTS_CHANNEL = "oai-events";

export async function openPeer(opts: PeerOptions): Promise<Peer> {
  const pc = new RTCPeerConnection();
  let closed = false;
  const close = (reason: string) => {
    if (closed) return;
    closed = true;
    pc.close();
    opts.onClose(reason);
  };

  for (const track of opts.mic.getAudioTracks()) pc.addTrack(track, opts.mic);
  pc.ontrack = (e) => {
    // Sebagian browser (Safari lama) mengirim track tanpa stream.
    opts.onRemoteStream(e.streams[0] ?? new MediaStream([e.track]));
  };
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
      close(`peer ${pc.connectionState}`);
    }
  };

  const channel = pc.createDataChannel(EVENTS_CHANNEL);
  channel.onmessage = (e) => {
    let event: unknown;
    try {
      event = JSON.parse(String(e.data));
    } catch {
      return; // Frame yang bukan JSON diabaikan.
    }
    if (event && typeof event === "object") opts.onEvent(event as Record<string, unknown>);
  };
  channel.onclose = () => close("channel closed");

  let timer: ReturnType<typeof setTimeout> | undefined;
  const opened = new Promise<void>((resolve, reject) => {
    timer = setTimeout(() => reject(new Error("Data channel tidak terbuka tepat waktu")), CHANNEL_OPEN_TIMEOUT_MS);
    channel.onopen = () => {
      clearTimeout(timer);
      resolve();
    };
  });

  try {
    await pc.setLocalDescription(await pc.createOffer());
    const answer = await opts.exchange(pc.localDescription?.sdp ?? "");
    await pc.setRemoteDescription({ type: "answer", sdp: answer });
    await opened;
  } catch (err) {
    clearTimeout(timer);
    closed = true;
    pc.close();
    throw err;
  }

  return {
    send(event) {
      if (channel.readyState !== "open") return false;
      channel.send(JSON.stringify(event));
      return true;
    },
    close: () => close("closed"),
  };
}
