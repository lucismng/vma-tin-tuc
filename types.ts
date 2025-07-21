

export interface RssItem {
  title: string;
  description: string;
  // Other properties are available but not used in this app
}

export interface RssResponse {
  status: string;
  items: RssItem[];
}

export interface WeatherData {
  city: string;
  tempMin: number;
  tempMax: number;
  humidity: number;
  rainChance: number;
  weatherCode: number;
}

export type NewsMode = 'rss' | 'custom' | 'breaking';

export type InfoType = 'weather';

export interface NewsSource {
  uri: string;
  title: string;
}

export interface AiNewsItem {
  headline: string;
  summary: string;
}