// The founder's live sites, shown in the device carousel on the Home and World
// pages. Each gets its own device and shows a screenshot (never the live page,
// so the section stays light); a site without one shows a poster in its accent
// colour. Text is English; Spanish lives in es.ts.
export type DeviceKind = "imac" | "iphone" | "laptop" | "ipadL" | "tv" | "android" | "monitor" | "iphoneL" | "browser" | "ipadP" | "ultrawide" | "fold";

export type Site = {
  name: string;
  tagline: string;
  category: string;
  host: string;
  shot: string;
  cta: string;
  accent: string;
  blurb: string;
  device: DeviceKind;
};

export const SITES: Site[] = [
  { name: "MALAAK", tagline: "Modest Luxury Abayas", category: "Modest Fashion", host: "malaak-abaya.vercel.app", shot: "/zb/assets/a3eb67a33eb96ed907adcdd7619cb9d5.jpg", cta: "Shop now", accent: "#b08d57", device: "imac",
    blurb: "An online boutique for modest luxury abayas, from collection to checkout." },
  { name: "DOBERMAN", tagline: "Bold Brand Experience", category: "Brand", host: "doberman-kappa.vercel.app", shot: "/zb/assets/b78ad4f230a4015d24a420fce2a7d53b.jpg", cta: "Enter", accent: "#c8102e", device: "iphone",
    blurb: "A bold, dark brand world built to make a first impression stick." },
  { name: "CHRTT.PRIETO", tagline: "Fashion & Lifestyle Creator", category: "Creator", host: "christain-theapeacademys-projects.vercel.app", shot: "", cta: "Collab", accent: "#c9a27e", device: "laptop",
    blurb: "Portfolio and collab hub for a fashion and lifestyle creator." },
  { name: "AAURA", tagline: "Arabian Luxury Perfumery", category: "Fragrance", host: "aaura-perfume.vercel.app", shot: "/zb/assets/ae7685b3f6993315e423325f7889a7f4.jpg", cta: "Order", accent: "#b8860b", device: "ipadL",
    blurb: "An Arabian perfume house presented like a luxury flagship store." },
  { name: "HOT CHEF", tagline: "Culinary Excellence", category: "Food & Drink", host: "hot-chef.vercel.app", shot: "", cta: "Menu", accent: "#e8562a", device: "android",
    blurb: "A restaurant site where the menu and the story lead the way." },
  { name: "APE ACADEMY", tagline: "Academic Excellence", category: "Education", host: "deploy-1-p1ke.vercel.app", shot: "/zb/assets/Screenshot_20260412-220250_Chrome.png", cta: "Enrol", accent: "#1f7a4d", device: "tv",
    blurb: "An academic help platform: submit a task, pay, and get the documents delivered." },
  { name: "REVERIE", tagline: "Luxury Beauty Salon", category: "Beauty", host: "reverie-salon.vercel.app", shot: "/zb/assets/4c7faa2cf965371c0d8c790e9d5f61a1.jpg", cta: "Book", accent: "#d98fa6", device: "ipadP",
    blurb: "A luxury beauty salon site made for browsing services and booking." },
  { name: "NOIR ATELIER", tagline: "Luxury Ready-to-Wear", category: "Apparel", host: "noir-atelier-clothing.vercel.app", shot: "", cta: "Shop", accent: "#8a8a8f", device: "monitor",
    blurb: "A ready-to-wear label with a quiet, editorial storefront." },
  { name: "EMBER & SALT", tagline: "Wood-Fired Restaurant", category: "Food & Drink", host: "ember-salt-restaurant.vercel.app", shot: "", cta: "Reserve", accent: "#d9772b", device: "iphoneL",
    blurb: "A wood-fired restaurant with its menus, atmosphere and reservations." },
  { name: "PADI", tagline: "Stories That Talk Back", category: "Entertainment", host: "padi-three.vercel.app", shot: "", cta: "Play", accent: "#8b5cf6", device: "fold",
    blurb: "Interactive stories that talk back to the reader." },
  { name: "SHADOWZ", tagline: "Urban Art Intelligence", category: "Urban Tech", host: "shadow-rho-three.vercel.app", shot: "", cta: "Explore", accent: "#17c98d", device: "ultrawide",
    blurb: "An urban art platform with a layer of intelligence on top." },
  { name: "PM PORTFOLIO", tagline: "Product & Frontend Builder", category: "Tech", host: "pm-portfolio-steel-rho.vercel.app", shot: "", cta: "View", accent: "#3d7ef0", device: "browser",
    blurb: "The portfolio of a product and frontend builder." },
];
