
import { Participant } from '../types';

// const KV_REST_API_URL = "https://climbing-mollusk-58447.upstash.io";
// const KV_REST_API_TOKEN = "AeRPAAIncDIzMzdjY2VjODcwMWY0NDZmOTgyNWRiNzhlMmY3ZmI0Y3AyNTg0NDc";
const DB_KEY = "SP_DB_V2";

// const KV_REST_API_URL = process.env.KV_REST_API_URL;
// const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

const KV_REST_API_URL = import.meta.env.VITE_KV_REST_API_URL;
const KV_REST_API_TOKEN = import.meta.env.VITE_KV_REST_API_TOKEN;



/**
 * Communicates with Upstash Redis REST API
 */
async function kvFetch(command: string[]) {
  try {

    if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
      throw new Error("Missing Upstash Environment Variables");
    } // newly added

    const response = await fetch(`${KV_REST_API_URL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      throw new Error(`KV Error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.result;
  } catch (err) {
    console.error("KV Fetch failed:", err);
    throw err;
  }
}

export const storageService = {
  getParticipants: async (): Promise<Participant[]> => {
    try {
      const data = await kvFetch(['GET', DB_KEY]);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to fetch from KV:", e);
      return [];
    }
  },

  getParticipantById: async (id: string): Promise<Participant | null> => {
    if (!id) return null;
    const participants = await storageService.getParticipants();
    return participants.find(p => {
      const pId = p.id || '';
      const shortId = pId.split('-')[0]?.toLowerCase();
      const targetId = id.toLowerCase();
      return pId.toLowerCase() === targetId || shortId === targetId;
    }) || null;
  },

  saveParticipant: async (participant: Participant): Promise<void> => {
    const participants = await storageService.getParticipants();
    participants.push(participant);
    await kvFetch(['SET', DB_KEY, JSON.stringify(participants)]);
  },

  updateParticipant: async (updated: Participant): Promise<void> => {
    const participants = await storageService.getParticipants();
    const index = participants.findIndex(p => p.id === updated.id);
    if (index !== -1) {
      participants[index] = updated;
      await kvFetch(['SET', DB_KEY, JSON.stringify(participants)]);
    }
  },

  deleteParticipant: async (id: string): Promise<void> => {
    const participants = await storageService.getParticipants();
    const filtered = participants.filter(p => p.id !== id);
    await kvFetch(['SET', DB_KEY, JSON.stringify(filtered)]);
  }
};
