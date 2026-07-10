/**
 * Client adapters for the RGS. The store depends only on the `RgsClient`
 * interface, so the app runs standalone in the browser (LocalRgsClient wraps
 * RgsService directly) or against the Express backend (HttpRgsClient) with no
 * other code change.
 */
import type { GameConfig } from '../../engine/config';
import { RgsService, type RgsOptions } from '../../server/rgs';
import type {
  RgsClient,
  FairnessCommitment,
  PlaceBetRequest,
  PlaceBetResponse,
  RoundView,
  TickResponse,
  HistoryEntry,
} from './protocol';

/** In-browser mock — zero backend required. Great for demos and `npm run dev`. */
export class LocalRgsClient implements RgsClient {
  private readonly rgs: RgsService;
  constructor(opts?: RgsOptions) {
    this.rgs = new RgsService(opts);
  }
  async getConfig(): Promise<GameConfig> {
    return this.rgs.getConfig();
  }
  async getBalance(): Promise<number> {
    return this.rgs.getBalance();
  }
  async getCommitment(): Promise<FairnessCommitment> {
    return this.rgs.getCommitment();
  }
  async setClientSeed(seed: string): Promise<FairnessCommitment> {
    return this.rgs.setClientSeed(seed);
  }
  async placeBet(req: PlaceBetRequest): Promise<PlaceBetResponse> {
    return this.rgs.placeBet(req);
  }
  async tick(roundId: string): Promise<TickResponse> {
    return this.rgs.tick(roundId);
  }
  async setPace(roundId: string, pace: 'push' | 'coast' | 'tend'): Promise<RoundView> {
    return this.rgs.setPace(roundId, pace);
  }
  async reDeclare(roundId: string, target: number): Promise<RoundView> {
    return this.rgs.reDeclare(roundId, target);
  }
  async rest(roundId: string): Promise<TickResponse> {
    return this.rgs.rest(roundId);
  }
  async getHistory(): Promise<HistoryEntry[]> {
    return this.rgs.getHistory();
  }
}

/** Talks to the Express reference backend (server/index.ts). */
export class HttpRgsClient implements RgsClient {
  constructor(private readonly base: string) {}
  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.base}${path}`);
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? res.statusText);
    return res.json() as Promise<T>;
  }
  private async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? res.statusText);
    return res.json() as Promise<T>;
  }
  getConfig() {
    return this.get<GameConfig>('/api/config');
  }
  async getBalance() {
    return (await this.get<{ balance: number }>('/api/balance')).balance;
  }
  getCommitment() {
    return this.get<FairnessCommitment>('/api/fairness');
  }
  setClientSeed(seed: string) {
    return this.post<FairnessCommitment>('/api/fairness/client-seed', { clientSeed: seed });
  }
  placeBet(req: PlaceBetRequest) {
    return this.post<PlaceBetResponse>('/api/bet', req);
  }
  tick(roundId: string) {
    return this.post<TickResponse>(`/api/round/${roundId}/tick`);
  }
  setPace(roundId: string, pace: 'push' | 'coast' | 'tend') {
    return this.post<RoundView>(`/api/round/${roundId}/pace`, { pace });
  }
  reDeclare(roundId: string, target: number) {
    return this.post<RoundView>(`/api/round/${roundId}/redeclare`, { target });
  }
  rest(roundId: string) {
    return this.post<TickResponse>(`/api/round/${roundId}/rest`);
  }
  getHistory() {
    return this.get<HistoryEntry[]>('/api/history');
  }
}
