export interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  emoji: string;
  bg: string;
  followUp: string;
  image?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
  type?: 'text' | 'catalog' | 'booking' | 'handoff';
  metadata?: any;
}

export interface Lead {
  name: string;
  phone: string;
  email?: string;
  service?: string;
  timestamp: string;
  source: string;
}
