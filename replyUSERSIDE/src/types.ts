export interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  emoji: string;
  bg: string;
  followUp?: string;
  image?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  serviceInterest?: string;
  status: 'Hot' | 'Warm' | 'Cold';
  timestamp: string;
  source: 'chat' | 'booking';
  sessionId: string;
}

export interface KBDocument {
  id: string;
  name: string;
  type: 'txt' | 'pdf' | 'md';
  size: string;
  content: string;
}

export interface AppConfig {
  businessName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  bookingUrl: string;
  primaryColor: string;
  language: 'auto' | 'en' | 'fr';
  leadWebhook: string;
  clientId: string;
  aiActive: boolean;
  theme: 'dark' | 'light' | 'custom';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  uiAction?: 'show_catalog' | 'show_booking' | 'human_handoff' | 'none';
  timestamp: string;
}

export interface AIResponse {
  response_text: string;
  ui_action: 'show_catalog' | 'show_booking' | 'human_handoff' | 'none';
  lead_extraction: {
    is_new_lead: boolean;
    name: string | null;
    phone_or_email: string | null;
    service_interest: string | null;
  };
}
