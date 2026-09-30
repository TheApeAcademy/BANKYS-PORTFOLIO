// The founder's live sites, shown in the device carousel on the Home and World
// pages. Each gets its own device and shows its cover (never the live page, so
// the section stays light): a screenshot where we have one, otherwise the cover
// photo the old work page used. The poster in the accent colour is the
// fallback for a site with no image. Text is English; Spanish lives in es.ts.
export type DeviceKind = "imac" | "iphone" | "laptop" | "ipadL" | "tv" | "android" | "monitor" | "iphoneL" | "browser" | "ipadP" | "ultrawide" | "fold" | "watch" | "ipadMini";

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
  /** object-position for the cover when its top isn't the best crop. */
  pos?: string;
  /** Show the whole cover (a logo, say) on a plain screen instead of filling it. */
  fit?: "contain";
  /** Screen colour behind a contained cover. */
  screenBg?: string;
};

export const SITES: Site[] = [
  { name: "MALAAK", tagline: "Modest Luxury Abayas", category: "Modest Fashion", host: "malaak-abaya.vercel.app", shot: "/zb/assets/a3eb67a33eb96ed907adcdd7619cb9d5.jpg", cta: "Shop now", accent: "#b08d57", device: "imac",
    blurb: "Minimal editorial fashion site with a hover-reveal product grid and WhatsApp ordering, built for Snapchat-native buyers." },
  { name: "DOBERMAN", tagline: "Bold Brand Experience", category: "Brand", host: "doberman-kappa.vercel.app", shot: "/zb/assets/b78ad4f230a4015d24a420fce2a7d53b.jpg", cta: "Enter", accent: "#c8102e", device: "iphone",
    blurb: "High-impact brand site. Aggressive typography, a dramatic dark palette and a conversion-focused layout." },
  { name: "THIS OR THAT", tagline: "Decide in one tap", category: "Product", host: "this-or-that-fawn-rho.vercel.app", shot: "/zb/assets/thisorthat-icon.png", cta: "Try it", accent: "#1f7aff", device: "watch", fit: "contain", screenBg: "#07080c",
    blurb: "A quick-fire decision product: two options, one tap, and you see what everyone else picked." },
  { name: "CHRTT.PRIETO", tagline: "Fashion & Lifestyle Creator", category: "Creator", host: "christain-theapeacademys-projects.vercel.app", shot: "/zb/assets/sites/chrtt-prieto.webp", cta: "Collab", accent: "#c9a27e", device: "android",
    blurb: "Creator portfolio for a Barcelona-based fashion and lifestyle creator. Stats-forward, TikTok-native, with a brand collab flow." },
  { name: "AAURA", tagline: "Arabian Luxury Perfumery", category: "Fragrance", host: "aaura-perfume.vercel.app", shot: "/zb/assets/ae7685b3f6993315e423325f7889a7f4.jpg", cta: "Order", accent: "#b8860b", device: "ipadL",
    blurb: "Arabian luxury perfumery. Animated gold particle field, arabesque typography and WhatsApp ordering." },
  { name: "HOT CHEF", tagline: "Culinary Excellence", category: "Food & Drink", host: "hot-chef.vercel.app", shot: "/zb/assets/sites/hot-chef.webp", cta: "Menu", accent: "#e8562a", device: "laptop",
    blurb: "A Nigerian kitchen where customers browse the menu and order food online." },
  { name: "APE ACADEMY", tagline: "Academic Excellence", category: "Education", host: "deploy-1-p1ke.vercel.app", shot: "/zb/assets/sites/ape-academy.webp", cta: "Enrol", accent: "#1f7a4d", device: "tv",
    blurb: "Bold educational platform with a strong identity, structured content and a no-nonsense conversion flow." },
  { name: "MFM", tagline: "Mountain of Fire and Miracles", category: "Children’s Ministry", host: "cct-rho.vercel.app", shot: "/zb/assets/sites/mfm.webp", cta: "View", accent: "#7b2d8e", device: "ipadMini", fit: "contain", screenBg: "#ffffff",
    blurb: "Website for the MFM children’s ministry." },
  { name: "REVERIE", tagline: "Luxury Beauty Salon", category: "Beauty", host: "reverie-salon.vercel.app", shot: "/zb/assets/4c7faa2cf965371c0d8c790e9d5f61a1.jpg", cta: "Book", accent: "#d98fa6", device: "ultrawide", pos: "center 42%",
    blurb: "Soft marble luxury salon site. Services grid, team showcase and WhatsApp booking." },
  { name: "NOIR ATELIER", tagline: "Luxury Ready-to-Wear", category: "Apparel", host: "noir-atelier-clothing.vercel.app", shot: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1400&h=875&fit=crop&auto=format&q=75", cta: "Shop", accent: "#8a8a8f", device: "monitor",
    blurb: "A ready-to-wear label with a quiet, editorial storefront." },
  { name: "EMBER & SALT", tagline: "Wood-Fired Restaurant", category: "Food & Drink", host: "ember-salt-restaurant.vercel.app", shot: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&h=875&fit=crop&auto=format&q=75", cta: "Reserve", accent: "#d9772b", device: "iphoneL",
    blurb: "A wood-fired restaurant with its menus, atmosphere and reservations." },
  { name: "PADI", tagline: "Stories That Talk Back", category: "Entertainment", host: "padi-three.vercel.app", shot: "/zb/assets/sites/padi.webp", cta: "Play", accent: "#8b5cf6", device: "fold",
    blurb: "Interactive stories that talk back to the reader." },
  { name: "SHADOWZ", tagline: "Urban Art Intelligence", category: "Urban Tech", host: "shadow-rho-three.vercel.app", shot: "/zb/assets/sites/shadowz.webp", cta: "Explore", accent: "#17c98d", device: "ipadP",
    blurb: "An urban art platform with a layer of intelligence on top." },
  { name: "PM PORTFOLIO", tagline: "Product & Frontend Builder", category: "Tech", host: "pm-portfolio-steel-rho.vercel.app", shot: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1400&h=875&fit=crop&auto=format&q=75", cta: "View", accent: "#3d7ef0", device: "browser",
    blurb: "The portfolio of a product and frontend builder." },
];
