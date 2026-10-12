import { CatalogItem } from './types';

export const BROWSE_CATALOG: CatalogItem[] = [
  {
    id: 'm1',
    title: "Blade Runner 2049",
    type: "movie",
    year: "2017",
    service: "HBO Max",
    genre: "Neo-Noir, Cyberpunk, Sci-Fi",
    rating: "8.4",
    posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 'm2',
    title: "Se7en",
    type: "movie",
    year: "1995",
    service: "Netflix",
    genre: "Gritty Crime, Psychological Thriller, Mystery",
    rating: "8.6",
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 'm3',
    title: "Prisoners",
    type: "movie",
    year: "2013",
    service: "Prime Video",
    genre: "Psychological Thriller, Gritty Crime, Suspense",
    rating: "8.1",
    posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 'm4',
    title: "Inception",
    type: "movie",
    year: "2010",
    service: "HBO Max",
    genre: "Psychological Thriller, Sci-Fi, Heist",
    rating: "8.8",
    posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 'm5',
    title: "The Batman",
    type: "movie",
    year: "2022",
    service: "HBO Max",
    genre: "Neo-Noir, Gritty Crime, Action",
    rating: "7.8",
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 'm6',
    title: "Memento",
    type: "movie",
    year: "2000",
    service: "Apple TV+",
    genre: "Psychological Thriller, Neo-Noir, Mystery",
    rating: "8.4",
    posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 'm7',
    title: "Zodiac",
    type: "movie",
    year: "2007",
    service: "Netflix",
    genre: "Gritty Crime, Mystery, Drama",
    rating: "7.7",
    posterUrl: "https://images.unsplash.com/photo-1559893088-c0787ebfc084?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 'm8',
    title: "Nightcrawler",
    type: "movie",
    year: "2014",
    service: "Prime Video",
    genre: "Neo-Noir, Gritty Crime, Psychological Thriller",
    rating: "7.8",
    posterUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 't1',
    title: "True Detective (Season 1)",
    type: "tv",
    year: "2014",
    service: "HBO Max",
    genre: "Gritty Crime, Psychological Thriller, Neo-Noir",
    rating: "9.3",
    posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 't2',
    title: "Mindhunter",
    type: "tv",
    year: "2017",
    service: "Netflix",
    genre: "Gritty Crime, Psychological Thriller, Drama",
    rating: "8.6",
    posterUrl: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 't3',
    title: "Severance",
    type: "tv",
    year: "2022",
    service: "Apple TV+",
    genre: "Psychological Thriller, Sci-Fi, Mystery",
    rating: "8.7",
    posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 't4',
    title: "Fargo",
    type: "tv",
    year: "2014",
    service: "Hulu",
    genre: "Gritty Crime, Drama, Thriller",
    rating: "8.9",
    posterUrl: "https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?auto=format&fit=crop&q=80&w=300"
  }
];

export const SERVICE_LAUNCHERS = [
  { id: 'jellyseerr', name: "Find your next watch", iconName: "LockKeyhole", port: 80, path: "/", desc: "Automated films and show request coordinator." },
  { id: 'jellyfin', name: "Jellyfin Player", iconName: "Tv", port: 8096, path: "/", desc: "Watch high-definition movie & TV streams." },
  { id: 'qbittorrent', name: "qBittorrent UI", iconName: "Download", port: 8080, path: "/", desc: "Monitor torrent downloads & seed rates." },
  { id: 'prowlarr', name: "Prowlarr Indexer", iconName: "Search", port: 9696, path: "/", desc: "Manage indexer proxy search configurations." },
  { id: 'radarr', name: "Radarr Movies", iconName: "Play", port: 7878, path: "/", desc: "Automate movie download libraries." },
  { id: 'sonarr', name: "Sonarr TV Shows", iconName: "Tv", port: 8989, path: "/", desc: "Automate TV season schedules & indexers." },
  { id: 'bazarr', name: "Bazarr Subtitles", iconName: "FileCode", port: 6767, path: "/", desc: "Manage automated multi-language subtitle fetches." },
  { id: 'aiostreams', name: "AIOStreams Server", iconName: "Server", port: 7000, path: "/", desc: "Stremio proxy and torrent parser configuration." },
  { id: 'mediaflow', name: "MediaFlow Proxy", iconName: "Wifi", port: 8888, path: "/", desc: "Proxy streaming flow traffic inside VPN." },
  { id: 'firefox', name: "Firefox", iconName: "Globe", port: 0, path: "https://www.mozilla.org/en-US/firefox/", desc: "Web browser" },
  { id: 'chrome', name: "Google Chrome", iconName: "Globe", port: 0, path: "https://www.google.com/chrome/", desc: "Web browser" },
  { id: 'github', name: "GitHub", iconName: "Github", port: 0, path: "https://github.com", desc: "Code management" },
  { id: 'appflowly', name: "AppFlowly", iconName: "Layout", port: 0, path: "https://www.appflowly.com", desc: "Productivity application" }
];
