// ============================================
// Real-time sync layer
// Bridges public site ↔ admin dashboard
// - BroadcastChannel: instant cross-tab sync (modern browsers)
// - storage events: fallback for older browsers
// - In-page event emitter: same-tab subscribers
// ============================================

export type SyncEvent =
  | { type: "booking:created"; payload: { id: string; reference: string; customerName: string; carModel: string; total: number } }
  | { type: "booking:updated"; payload: { id: string; status: string } }
  | { type: "booking:deleted"; payload: { id: string } }
  | { type: "contact:received"; payload: { id: string; name: string; subject: string } }
  | { type: "review:submitted"; payload: { id: string; name: string; rating: number } }
  | { type: "car:status-changed"; payload: { id: string; status: string } }
  | { type: "settings:updated"; payload: { section: string } }
  | { type: "pricing:updated"; payload: {} }
  | { type: "data:refresh"; payload: { keys?: string[] } };

type Listener = (evt: SyncEvent) => void;

const CHANNEL_NAME = "velox-sync";
const SIGNAL_KEY = "velox-admin-__signal";

let channel: BroadcastChannel | null = null;
const listeners = new Set<Listener>();

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (channel) return channel;
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (e: MessageEvent<SyncEvent>) => {
      listeners.forEach((l) => {
        try { l(e.data); } catch (err) { console.error(err); }
      });
    };
  } catch {
    channel = null;
  }
  return channel;
}

// Storage event fallback (cross-tab, older browsers / Safari private mode)
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === SIGNAL_KEY && e.newValue) {
      try {
        const evt: SyncEvent = JSON.parse(e.newValue);
        listeners.forEach((l) => l(evt));
      } catch {}
    }
  });
}

/** Emit a sync event to all listeners (same tab + other tabs). */
export function emit(evt: SyncEvent): void {
  // Same-tab subscribers
  listeners.forEach((l) => {
    try { l(evt); } catch (err) { console.error(err); }
  });
  // Cross-tab via BroadcastChannel
  const ch = getChannel();
  if (ch) {
    try { ch.postMessage(evt); } catch {}
  }
  // Storage event fallback (always set so older browsers receive it)
  try {
    localStorage.setItem(SIGNAL_KEY, JSON.stringify({ ...evt, _ts: Date.now() }));
  } catch {}
}

/** Subscribe to all sync events. Returns an unsubscribe function. */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  // Touch channel to initialize it lazily
  getChannel();
  return () => { listeners.delete(listener); };
}

/** React hook for sync events */
import { useEffect, useState, useCallback } from "react";

export function useSync(filter?: SyncEvent["type"][]): SyncEvent | null {
  const [last, setLast] = useState<SyncEvent | null>(null);
  useEffect(() => {
    return subscribe((evt) => {
      if (!filter || filter.includes(evt.type)) setLast(evt);
    });
  }, [filter?.join("|")]);
  return last;
}

/** Force a component to re-render when any matching sync event fires. */
export function useSyncRefresh(filter?: SyncEvent["type"][]): number {
  const [tick, setTick] = useState(0);
  const bump = useCallback(() => setTick((t) => t + 1), []);
  useEffect(() => {
    return subscribe((evt) => {
      if (!filter || filter.includes(evt.type)) bump();
    });
  }, [filter?.join("|"), bump]);
  return tick;
}
