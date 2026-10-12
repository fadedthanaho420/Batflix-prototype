import express from "express";
import path from "path";
import os from "os";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

console.log("NODE_ENV:", process.env.NODE_ENV);

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


console.log("NODE_ENV:", process.env.NODE_ENV);

// In-memory data store for the Jellyseerr simulation
interface MediaRequest {
  id: number;
  title: string;
  type: 'movie' | 'tv';
  posterUrl: string;
  status: 'pending' | 'downloading' | 'processing' | 'available';
  progress: number;
  requestedAt: string;
}

let mediaRequests: MediaRequest[] = [
  {
    id: 1,
    title: "Gladiator II",
    type: "movie",
    posterUrl: "https://images.unsplash.com/photo-1559893088-c0787ebfc084?auto=format&fit=crop&q=80&w=300",
    status: "available",
    progress: 100,
    requestedAt: "2026-07-06T14:30:00Z"
  },
  {
    id: 2,
    title: "The Last of Us - Season 2",
    type: "tv",
    posterUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=300",
    status: "downloading",
    progress: 45,
    requestedAt: "2026-07-07T08:15:00Z"
  },
  {
    id: 3,
    title: "Dune: Part Two",
    type: "movie",
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=300",
    status: "processing",
    progress: 90,
    requestedAt: "2026-07-07T09:45:00Z"
  }
];

// Lazy Gemini API initialization
let aiClient: any = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Jellyseerr mock/proxy request endpoint
app.get("/api/jellyseerr/requests", (req, res) => {
  res.json(mediaRequests);
});

app.post("/api/jellyseerr/request", (req, res) => {
  const { title, type, posterUrl } = req.body;
  if (!title || !type) {
    return res.status(400).json({ error: "Title and Type are required" });
  }

  const newRequest: MediaRequest = {
    id: mediaRequests.length + 1,
    title,
    type,
    posterUrl: posterUrl || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=300",
    status: "pending",
    progress: 0,
    requestedAt: new Date().toISOString()
  };

  mediaRequests.unshift(newRequest);

  // Simulate progress in the background for realism
  setTimeout(() => {
    const reqIndex = mediaRequests.findIndex(r => r.id === newRequest.id);
    if (reqIndex !== -1) {
      mediaRequests[reqIndex].status = "downloading";
      mediaRequests[reqIndex].progress = 12;
    }
  }, 10000);

  res.json({ success: true, request: newRequest });
});

// Reset simulation requests
app.post("/api/jellyseerr/reset", (req, res) => {
  mediaRequests = [
    {
      id: 1,
      title: "Gladiator II",
      type: "movie",
      posterUrl: "https://images.unsplash.com/photo-1559893088-c0787ebfc084?auto=format&fit=crop&q=80&w=300",
      status: "available",
      progress: 100,
      requestedAt: "2026-07-06T14:30:00Z"
    },
    {
      id: 2,
      title: "The Last of Us - Season 2",
      type: "tv",
      posterUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=300",
      status: "downloading",
      progress: 45,
      requestedAt: "2026-07-07T08:15:00Z"
    },
    {
      id: 3,
      title: "Dune: Part Two",
      type: "movie",
      posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=300",
      status: "processing",
      progress: 90,
      requestedAt: "2026-07-07T09:45:00Z"
    }
  ];
  res.json({ success: true, requests: mediaRequests });
});

// Configure files generator (returns config files based on user variables)
app.post("/api/generate-configs", (req, res) => {
  const {
    username = "default",
    localSubnet = "192.168.1.0/24",
    wgPrivateKey = "WIREGUARD_PRIVATE_KEY_GOES_HERE",
    wgAddress = "10.0.0.2/32",
    timezone = "America/New_York",
    qbPassword = Math.random().toString(36).substring(2, 10) + "!",
    aiostreamsSecret = Math.random().toString(36).substring(2, 12),
    mediaflowPassword = Math.random().toString(36).substring(2, 10) + "@",
    customRules = []
  } = req.body;

  // Render docker-compose.yml
  const dockerCompose = `networks:
  media-network:
    driver: bridge

services:
  # VPN Network Gateway & DNS Killswitch
  gluetun:
    image: qmcgaw/gluetun:latest
    container_name: gluetun
    networks:
      - media-network
    cap_add:
      - NET_ADMIN
    devices:
      - /dev/net/tun:/dev/net/tun
    ports:
      - 8080:8080       # qBittorrent Web UI
      - 9696:9696       # Prowlarr UI
      - 7000:7000       # AIOStreams Stremio Manifest
      - 8888:8888       # MediaFlow Proxy
      - 58812:58812/tcp # Incoming P2P connections
      - 58812:58812/udp
    environment:
      - VPN_SERVICE_PROVIDER=custom
      - VPN_TYPE=wireguard
      - WIREGUARD_PRIVATE_KEY=${wgPrivateKey}
      - WIREGUARD_ADDRESSES=${wgAddress}
      - VPN_DNS_ADDRESS=1.1.1.1,1.0.0.1
      - DNS_KEEP_NAMESERVERS=off
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /run

  # All P2P and indexer scrapers run inside the Gluetun VPN namespace
  qbittorrent:
    image: cr.hotio.dev/hotio/qbittorrent:release
    container_name: qbittorrent
    network_mode: "service:gluetun"
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=${timezone}
      - WEBUI_PORT=8080
    volumes:
      - /home/${username}/.config/media-stack/qbittorrent:/config
      - /home/${username}/media-data/torrents:/data/torrents
    user: "1000:1000"
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /run

  prowlarr:
    image: cr.hotio.dev/hotio/prowlarr:release
    container_name: prowlarr
    network_mode: "service:gluetun"
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=${timezone}
    volumes:
      - /home/${username}/.config/media-stack/prowlarr:/config
    user: "1000:1000"
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /run

  aiostreams:
    image: viren070/aiostreams:latest
    container_name: aiostreams
    network_mode: "service:gluetun"
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=${timezone}
      - SECRET_KEY=${aiostreamsSecret}
    volumes:
      - /home/${username}/.config/media-stack/aiostreams:/app/config
    user: "1000:1000"
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp

  mediaflow:
    image: ghcr.io/mhdzumair/mediaflow-proxy-light:latest
    container_name: mediaflow
    network_mode: "service:gluetun"
    environment:
      - APP__AUTH__API_PASSWORD=${mediaflowPassword}
      - APP__SERVER__PORT=8888
      - APP__SERVER__HOST=0.0.0.0
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true

  # Media automation runs on the standard bridge network
  radarr:
    image: cr.hotio.dev/hotio/radarr:release
    container_name: radarr
    networks:
      - media-network
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=${timezone}
    volumes:
      - /home/${username}/.config/media-stack/radarr:/config
      - /home/${username}/media-data:/data
    user: "1000:1000"
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /run

  sonarr:
    image: cr.hotio.dev/hotio/sonarr:release
    container_name: sonarr
    networks:
      - media-network
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=${timezone}
    volumes:
      - /home/${username}/.config/media-stack/sonarr:/config
      - /home/${username}/media-data:/data
    user: "1000:1000"
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /run

  unpackerr:
    image: ghcr.io/unpackerr/unpackerr:latest
    container_name: unpackerr
    networks:
      - media-network
    environment:
      - UN_QBITTORRENT_0_URL=http://gluetun:8080
      - UN_QBITTORRENT_0_USER=admin
      - UN_QBITTORRENT_0_PASS=${qbPassword}
      - UN_QBITTORRENT_0_PATHS_0=/data/torrents
    volumes:
      - /home/${username}/.config/media-stack/unpackerr:/config
      - /home/${username}/media-data/torrents:/data/torrents
    user: "1000:1000"
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp

  bazarr:
    image: cr.hotio.dev/hotio/bazarr:release
    container_name: bazarr
    networks:
      - media-network
    ports:
      - 6767:6767
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=${timezone}
    volumes:
      - /home/${username}/.config/media-stack/bazarr:/config
      - /home/${username}/media-data/media:/data/media
    user: "1000:1000"
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /run

  jellyseerr:
    image: fallenbagel/jellyseerr:latest
    container_name: jellyseerr
    networks:
      - media-network
    ports:
      - 5055:5055
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=${timezone}
    volumes:
      - /home/${username}/.config/media-stack/jellyseerr:/app/config
    user: "1000:1000"
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp

  jellyfin:
    image: jellyfin/jellyfin:latest
    container_name: jellyfin
    networks:
      - media-network
    ports:
      - 8096:8096
    environment:
      - JELLYFIN_LOG_DIR=/config/log
      - JELLYFIN_CACHE_DIR=/cache
    volumes:
      - /home/${username}/.config/media-stack/jellyfin:/config
      - /home/${username}/media-data/jellyfin-cache:/cache
      - /home/${username}/media-data/media:/data/media
    user: "1000:1000"
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp

  caddy:
    image: caddy:latest
    container_name: caddy
    networks:
      - media-network
    ports:
      - 80:80
    volumes:
      - /home/${username}/.config/media-stack/caddy/Caddyfile:/etc/caddy/Caddyfile
      - /home/${username}/.config/media-stack/caddy/data:/data
      - /home/${username}/.config/media-stack/caddy/config:/config
    restart: unless-stopped`;

  // Render Caddyfile
  const caddyfile = `:80 {
    # Jellyseerr acts as our root dashboard
    reverse_proxy jellyseerr:5055

    # Jellyfin serves on /jellyfin subpath
    handle_path /jellyfin* {
        reverse_proxy jellyfin:8096
    }
}`;

  // Render desktop shortcut file
  const desktopFile = `[Desktop Entry]
Name=Zero-Trust Media Control Center
Comment=Secure local zero-trust media docker stack dashboard
Exec=bash -c "docker-compose -f /home/${username}/.config/media-stack/docker-compose.yml up -d && xdg-open http://localhost"
Icon=utilities-system-monitor
Terminal=false
Type=Application
Categories=System;Utility;
`;

  // Render UFW Hardening commands
  const customRulesOutput = Array.isArray(customRules) && customRules.length > 0
    ? "\n# --- User Custom Firewall Rules ---\n" + customRules.map((rule: any) => {
        const protoStr = rule.protocol && rule.protocol !== 'both' ? ` proto ${rule.protocol}` : '';
        const srcStr = rule.source && rule.source !== 'any' ? `from ${rule.source}` : '';
        const portStr = rule.port && rule.port !== 'any' ? ` to any port ${rule.port}` : '';
        const actionStr = rule.action || 'allow';
        const commentStr = rule.comment ? ` comment '${rule.comment.replace(/'/g, "")}'` : '';
        
        if (srcStr) {
          return `sudo ufw ${actionStr} ${srcStr}${portStr}${protoStr}${commentStr}`;
        } else {
          return `sudo ufw ${actionStr} ${rule.port || 'any'}${protoStr}${commentStr}`;
        }
      }).join('\n') + "\n"
    : "";

  const ufwScript = `#!/bin/bash
# Apply Zero-Trust Media Control Center Firewall hardening
# This blocks non-LAN/non-VPN traffic to admin pages, and restricts streaming to your LAN.

echo "Applying UFW Rules..."
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow your Google TV on the home Wi-Fi/LAN (${localSubnet}) to access Media Streaming ONLY
sudo ufw allow from ${localSubnet} to any port 8096 proto tcp comment 'Jellyfin Client Access'
sudo ufw allow from ${localSubnet} to any port 7000 proto tcp comment 'AIOStreams Client Access'
sudo ufw allow from ${localSubnet} to any port 8888 proto tcp comment 'MediaFlow Client Access'

# Allow Tailscale interface full access (Admin panels like Jellyseerr, Prowlarr, qBittorrent, etc.)
sudo ufw allow in on tailscale0 comment 'Full Admin Access via Tailscale'

# Allow local loopback (essential for Caddy reverse proxies on host)
sudo ufw allow from 127.0.0.1 comment 'Local Loopback'
${customRulesOutput}
# Enable firewall
sudo ufw --force enable
echo "UFW Firewall Hardened successfully!"
`;

  // Directory mapping command
  const dirCreationCommand = `mkdir -p /home/${username}/.config/media-stack/{jellyfin,qbittorrent,prowlarr,radarr,sonarr,jellyseerr,aiostreams,recyclarr,maintainerr,mediaflow,ntfy-cache,ntfy-config,bazarr,unpackerr,caddy} /home/${username}/media-data/{torrents/{movies,tv},media/{movies,tv},jellyfin-cache}`;

  res.json({
    dockerCompose,
    caddyfile,
    desktopFile,
    ufwScript,
    dirCreationCommand,
    passwords: {
      qbPassword,
      aiostreamsSecret,
      mediaflowPassword
    }
  });
});

// Gemini Assistant Endpoint
app.post("/api/gemini/assist", async (req, res) => {
  const { prompt, history = [] } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    const ai = getGeminiClient();

    // Format chat history for the standard Google Gen AI SDK
    const formattedContents = history.map((h: any) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content }]
    }));

    // Append the new prompt
    formattedContents.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    const systemInstruction = `You are Alfred, the ultimate subservient and polite butler (modeled on Michael Caine's portrayal in Batman Begins), and a master of DevOps, Cybersecurity, Docker namespaces, WireGuard VPNs, and Linux networking.
You MUST address the user as "Master" or "Master Wayne" or similar. Speak with impeccable butler-like politeness, subservience, and dedication.
Your core expertise lies in configuring the self-hosted Zero-Trust Media Stack (Gluetun VPN gateway, Caddy reverse proxy routing, qBittorrent, Prowlarr indexers, Radarr, Sonarr, Jellyseerr, and Jellyfin) inside ChromeOS Crostini (Debian partition) and locking it down using Uncomplicated Firewall (UFW) rules.
Always maintain your polite butler role while dispensing deeply technical DevOps wisdom, explaining port isolation, diagnosing Gluetun MTU handshakes, Crostini storage sliders, or raw UFW shell scripts. Make all advice highly precise, formatting Linux terminal snippets clearly. Avoid self-praise or generic AI templates.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ response: response.text });
  } catch (error: any) {
    console.error("Gemini assistant error:", error);
    res.status(500).json({ error: error.message || "Failed to communicate with Gemini." });
  }
});

// Serve frontend assets in production; hook up Vite in dev
async function initializeServer() {
  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/system/metrics", (req, res) => {
    console.log("DEBUG: Metrics endpoint called");
    const cpus = os.cpus();
    const cpuLoad = cpus.reduce((acc, cpu) => acc + cpu.times.user + cpu.times.nice + cpu.times.sys, 0) / cpus.length;
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const ramUsage = (totalMem - freeMem) / totalMem;
    res.json({ cpuLoad, ramUsage });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

initializeServer().catch(err => {
  console.error("Failed to start server:", err);
});
