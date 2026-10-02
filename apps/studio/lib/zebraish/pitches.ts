// Personal pitch pages at /p/<slug>. Each one is a proposal for a single
// business: a concept of their site, what it would do for them, and the work
// we've already shipped in their sector. Written in the prospect's language.

export type Sample = { name: string; what: string; host: string; shot: string };

export type Pitch = {
  slug: string;
  business: string;
  brand: string;
  city: string;
  accent: string;
  date: string;
  greeting: string;
  /** What we noticed about how they work online today. */
  today: string[];
  /** One-line promise under the hero. */
  promise: string;
  features: { t: string; d: string }[];
  samples: Sample[];
};

const S = {
  reverie: { name: "Reverie", what: "Salón de belleza con reservas online", host: "reverie-salon.vercel.app", shot: "/zb/assets/sites/reverie.webp" },
  hotChef: { name: "Hot Chef", what: "Restaurante con carta y pedidos", host: "hot-chef.vercel.app", shot: "/zb/assets/sites/hot-chef.webp" },
  ember: { name: "Ember & Salt", what: "Restaurante a la brasa con reservas", host: "ember-salt-restaurant.vercel.app", shot: "/zb/assets/sites/ember.webp" },
  malaak: { name: "Malaak", what: "Moda con pedidos por WhatsApp", host: "malaak-abaya.vercel.app", shot: "/zb/assets/sites/malaak.webp" },
  noir: { name: "Noir Atelier", what: "Tienda de ropa editorial", host: "noir-atelier-clothing.vercel.app", shot: "/zb/assets/sites/noir.webp" },
  aaura: { name: "Aaura", what: "Perfumería de lujo", host: "aaura-perfume.vercel.app", shot: "/zb/assets/sites/aaura.webp" },
};

export const PITCHES: Pitch[] = [
  {
    slug: "peluqueria-maria-jesus",
    business: "Peluquería María Jesús",
    brand: "María Jesús",
    city: "Vallecas, Madrid",
    accent: "#c27a8a",
    date: "Octubre 2026",
    greeting: "Hola, María Jesús",
    today: [
      "Hoy vuestras clientas os encuentran por Instagram y reservan por Fresha o por teléfono.",
      "Funciona, pero la marca que ven al reservar es la de Fresha, no la vuestra.",
      "Una web propia hace que quien os busque en Google vea vuestro trabajo, vuestros precios y un botón de reservar, todo con vuestro nombre.",
    ],
    promise: "Una web propia, rápida en el móvil, que convierte cada visita en una cita.",
    features: [
      { t: "Reserva en 30 segundos", d: "Botón de cita en cada pantalla. Puede conectar con vuestra agenda actual, sin cambiar de sistema." },
      { t: "Servicios y precios claros", d: "Color, mechas, keratina, trenzas y cortes, con fotos reales de vuestro trabajo." },
      { t: "Galería desde Instagram", d: "Vuestras últimas fotos aparecen solas en la web. Cero trabajo extra." },
      { t: "Aparecer en Google", d: "Preparada para búsquedas como \"peluquería en Vallecas\" y con vuestra ficha de Google Maps." },
    ],
    samples: [S.reverie, S.aaura],
  },
  {
    slug: "restaurante-de-triana",
    business: "Restaurante De Triana",
    brand: "De Triana",
    city: "Triana, Sevilla",
    accent: "#d9772b",
    date: "Octubre 2026",
    greeting: "Hola, equipo de De Triana",
    today: [
      "Hoy la mayoría de la gente decide dónde comer desde el móvil, en menos de un minuto.",
      "Lo que más miran: fotos de los platos, la carta y si pueden reservar sin llamar.",
      "Una web que enseñe eso en la primera pantalla llena mesas, también con turistas que no hablan español.",
    ],
    promise: "Una web que abre el apetito y llena la terraza, en español e inglés.",
    features: [
      { t: "Carta siempre al día", d: "La editáis vosotros en un minuto. También en QR para la mesa." },
      { t: "Reservas sin llamadas", d: "Formulario o WhatsApp directo, con aviso al momento para el equipo." },
      { t: "Español e inglés", d: "Triana recibe turistas cada día. La web les habla en su idioma." },
      { t: "Aparecer en Google", d: "Preparada para \"dónde comer en Triana\" y conectada con Google Maps." },
    ],
    samples: [S.ember, S.hotChef],
  },
  {
    slug: "la-bella-moda",
    business: "La Bella Moda",
    brand: "La Bella Moda",
    city: "Sevilla",
    accent: "#c9a27e",
    date: "Octubre 2026",
    greeting: "Hola, La Bella Moda",
    today: [
      "Hoy vendéis por Instagram, WhatsApp y en tienda en la calle Romana.",
      "Es cercano y funciona, pero cada prenda se pierde en el feed a los pocos días.",
      "Una web con vuestra colección hace que cualquier clienta vea todo lo nuevo y os escriba ya con la prenda elegida.",
    ],
    promise: "Vuestro escaparate abierto 24 horas, con pedidos directos por WhatsApp.",
    features: [
      { t: "Catálogo que vende", d: "Cada prenda con fotos, tallas y precio. Las novedades arriba, siempre." },
      { t: "Pedido por WhatsApp", d: "Un toque y os llega el mensaje con la prenda y la talla. Sin pasarela complicada." },
      { t: "Apartar en tienda", d: "La clienta reserva online y la recoge en la calle Romana." },
      { t: "Fácil de actualizar", d: "Subís una prenda nueva desde el móvil en un minuto." },
    ],
    samples: [S.malaak, S.noir],
  },
];

export const getPitch = (slug: string) => PITCHES.find((p) => p.slug === slug);
