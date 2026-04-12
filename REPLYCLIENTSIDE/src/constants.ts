import { Product } from "./types";

export const CATALOG: Product[] = [
  { 
    id: '1', 
    title: 'Imprimerie', 
    description: 'Impression haute qualité sur tous supports : flyers, cartes de visite, affiches.', 
    price: 'Sur devis', 
    emoji: '🖨️', 
    bg: 'linear-gradient(135deg,#0d1f3c,#1a3a6b)', 
    followUp: "Quel type de support souhaitez-vous imprimer et en quelle quantité ?" 
  },
  { 
    id: '2', 
    title: 'Packaging', 
    description: 'Conception et fabrication d\'emballages personnalisés pour vos produits.', 
    price: 'Sur devis', 
    emoji: '📦', 
    bg: 'linear-gradient(135deg,#1f0d1a,#4a1535)', 
    followUp: "Pour quel type de produit cherchez-vous un packaging ? Avez-vous déjà un design ?" 
  },
  { 
    id: '3', 
    title: 'Serigraphie', 
    description: 'Marquage textile et objets publicitaires : t-shirts, casquettes, sacs.', 
    price: 'Sur devis', 
    emoji: '👕', 
    bg: 'linear-gradient(135deg,#0d2a1a,#1a5c3a)', 
    followUp: "Sur quel support souhaitez-vous faire de la sérigraphie ? Combien de pièces ?" 
  },
  { 
    id: '4', 
    title: 'Digital Content', 
    description: 'Création de contenus visuels et vidéos pour vos réseaux sociaux.', 
    price: 'À partir de 50,000 FCFA', 
    emoji: '📱', 
    bg: 'linear-gradient(135deg,#1a1a0d,#3a3a1a)', 
    followUp: "Cherchez-vous du contenu pour Instagram, Facebook ou LinkedIn ?" 
  },
  { 
    id: '5', 
    title: 'Formations', 
    description: 'Apprenez le design, le marketing digital et la gestion d\'entreprise.', 
    price: 'À partir de 100,000 FCFA', 
    emoji: '🎓', 
    bg: 'linear-gradient(135deg,#222,#444)', 
    followUp: "Quel domaine de formation vous intéresse particulièrement ?" 
  },
];

export const KNOWLEDGE_BASE = `
COMPANY: Ayo Media — Digital Agency, West Africa.
SERVICES:
- Website Creation: Starter (150,000 FCFA) 5 pages, mobile-ready. Business (350,000 FCFA) CMS + SEO. Premium (600,000+ FCFA) full e-commerce.
- Brand Identity: Logo only (80,000 FCFA). Full package (150,000 FCFA) logo + colors + typography + brand guide.
- Social Media: Basic (50,000 FCFA/mo) 8 posts, 2 platforms. Pro (100,000 FCFA/mo) 20 posts, 4 platforms + community management.
- SEO & Marketing: Local SEO (70,000 FCFA/mo). Full digital (150,000 FCFA/mo) ads + reporting.
PROCESS: Discovery → Proposal → 50% deposit → Delivery → Revisions → Final payment.
PAYMENT: MTN/Orange Mobile Money or bank transfer. 50% upfront, 50% on delivery.
TIMELINE: Websites 2–4 weeks. Branding 1–2 weeks. Social media starts within 5 days.
CONSULTATION: Free. WhatsApp quotes available instantly.
CONTACT: WhatsApp +237 6XX XXX XXX. Phone +237 6XX XXX XXX.
`;

export const SYSTEM_INSTRUCTION = `You are a professional, warm, and persuasive AI sales assistant for Ayo Media.

BUSINESS KNOWLEDGE (ONLY source of truth — never invent):
${KNOWLEDGE_BASE}

SERVICES:
${CATALOG.map(s => `• ${s.title}: ${s.description} | ${s.price}`).join('\n')}

SALES RULES:
1. Never invent services, prices, timelines, or facts not listed above.
2. Never reveal you are an AI unless directly asked.
3. Auto-detect language: reply French if user writes French, English if English.
4. Goal chain: understand need → recommend service → ask 1 qualifying question → collect name + WhatsApp → close.
5. To collect contact: say naturally "To send you a personalised quote, could I get your name and WhatsApp number?" (French: "Pour vous envoyer un devis personnalisé, puis-je avoir votre nom et votre numéro WhatsApp ?")
6. NEVER dump a full list as text — the visual catalog handles that automatically.
7. Keep responses SHORT: 1–3 sentences MAX unless explaining a package in detail.
8. Max 1 emoji per message. Be warm and professional, not robotic.
9. Always move the conversation forward — every response should have a next step.
10. If user asks about booking, offer the booking form naturally.
11. If the user asks for "personalized recommendations", analyze their needs and suggest the most relevant service from the catalog.
`;
