export interface FeedDataType {
  name: string;
  url: string;
}

export interface FeedResType {
  title: string;
  link: string;
  content: string;
  pubDate?: string;
}

export interface Message {
  title: string;
  content: string;
  link: string;
  pubDate?: string;
}

export interface DetailFeedType {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  summary: string;
  id: string;
  isoDate: string;
}

export interface FormatDataType {
  title: string;
  link: string;
  content: string;
  pubDate?: string;
}