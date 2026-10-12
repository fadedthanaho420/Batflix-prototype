export interface MediaRequest {
  id: number;
  title: string;
  type: 'movie' | 'tv';
  posterUrl: string;
  status: 'pending' | 'downloading' | 'processing' | 'available';
  progress: number;
  requestedAt: string;
}

export interface CustomRule {
  id: string;
  port: string;
  protocol: 'tcp' | 'udp' | 'both';
  action: 'allow' | 'deny';
  source: string;
  comment: string;
}

export interface ContainerStatus {
  name: string;
  image: string;
  status: string;
  cpu: string;
  ram: string;
  uptime: string;
  port: string;
}

export interface SpeedTestData {
  ping: number | null;
  download: number | null;
  upload: number | null;
  step: 'idle' | 'pinging' | 'download' | 'upload' | 'complete';
}

export interface CatalogItem {
  id: string;
  title: string;
  type: 'movie' | 'tv';
  year: string;
  service: string;
  genre: string;
  rating: string;
  posterUrl: string;
}
