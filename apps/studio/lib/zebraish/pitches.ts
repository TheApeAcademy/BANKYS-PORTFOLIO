// Personal pitch pages at /p/<slug>. Each one is a proposal for a single
// business: a concept of their site, what it would do for them, and the work
// we've already shipped in their sector. Written in the prospect's language.

export type Sample = { name: string; what: string; host: string; shot: string };

export type Pitch = {
  slug: string;
  lang: "es" | "en";
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
  shadowz: { name: "Shadowz", what: "Plataforma de arte urbano", host: "shadow-rho-three.vercel.app", shot: "/zb/assets/sites/shadowz.webp" },
  doberman: { name: "Doberman", what: "Marca de alto impacto", host: "doberman-kappa.vercel.app", shot: "/zb/assets/b78ad4f230a4015d24a420fce2a7d53b.jpg" },
};

const S_EN = {
  reverie: { ...S.reverie, what: "Luxury salon with online booking" },
  hotChef: { ...S.hotChef, what: "Restaurant with menu and ordering" },
  ember: { ...S.ember, what: "Wood-fired restaurant with reservations" },
  aaura: { ...S.aaura, what: "Luxury perfume house" },
};

export const PITCHES: Pitch[] = [
  {
    slug: "peluqueria-maria-jesus",
    lang: "es",
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
      { t: "Reserva en pocos clics", d: "Botón de cita en cada pantalla. Puede conectar con vuestra agenda actual, sin cambiar de sistema." },
      { t: "Servicios y precios claros", d: "Color, mechas, keratina, trenzas y cortes, con fotos reales de vuestro trabajo." },
      { t: "Galería desde Instagram", d: "Vuestras últimas fotos aparecen solas en la web. Cero trabajo extra." },
      { t: "Aparecer en Google", d: "Preparada para búsquedas como \"peluquería en Vallecas\" y con vuestra ficha de Google Maps." },
    ],
    samples: [S.reverie, S.aaura],
  },
  {
    slug: "restaurante-de-triana",
    lang: "es",
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
    slug: "chef-alex-trim",
    lang: "en",
    business: "Chef Alex Trim",
    brand: "Alex Trim",
    city: "Naples, Florida",
    accent: "#c8a165",
    date: "October 2026",
    greeting: "Hi Alex",
    today: [
      "Right now, people find you on Instagram, where hundreds of thousands follow your cooking.",
      "But when someone in Naples wants to book you for a dinner, there's nowhere to send them: no menus to browse, no experiences to compare, just a DM or an email address.",
      "A site of your own turns that audience into bookings, and gives brands like Mowi and Kikuichi one place to see everything you do.",
    ],
    promise: "A home for your private dining: menus, experiences and bookings, built to the standard of your food.",
    features: [
      { t: "Enquiries that convert", d: "A short form for date, guests, occasion and dietary needs. It lands in your inbox ready to quote." },
      { t: "Experiences and menus", d: "Tasting menus, dinner parties and events, each with photos, so guests know what they're booking." },
      { t: "Press and partners", d: "Your story from Alinea and Tru, plus your brand work, in one place for clients and sponsors." },
      { t: "Found in Naples", d: "Built to show up when someone searches for a private chef in Naples or Southwest Florida." },
    ],
    samples: [S_EN.ember, S_EN.hotChef],
  },
  {
    slug: "lavishleestyled",
    lang: "en",
    business: "Lavishleestyled",
    brand: "Lavishleestyled",
    city: "Downtown Atlanta",
    accent: "#b4746a",
    date: "October 2026",
    greeting: "Hi there",
    today: [
      "Right now, clients find you on Instagram, where over 20,000 people follow your work.",
      "Booking means a DM, a call or your Yelp page, and every new client asks the same questions about styles, prices and hair.",
      "A site of your own answers all of that up front and lets clients book a slot straight away, under your name.",
    ],
    promise: "Your own booking site: every style, every price, one tap to book.",
    features: [
      { t: "Book in a few taps", d: "Clients pick a style and a time and they're booked. It can connect to the calendar you already use." },
      { t: "Styles and prices up front", d: "Every style with photos, price and time, with hair included made clear, so the questions stop." },
      { t: "Your Instagram, built in", d: "Your latest posts appear on the site automatically. No extra work." },
      { t: "Found in Atlanta", d: "Built to show up when someone searches for a protective style braider in Downtown Atlanta." },
    ],
    samples: [S_EN.reverie, S_EN.aaura],
  },
  {
    slug: "barbercar",
    lang: "es",
    business: "Barbercar",
    brand: "Barbercar",
    city: "Ensanche, Valencia",
    accent: "#d4a24c",
    date: "Octubre 2026",
    greeting: "Hola, equipo de Barbercar",
    today: [
      "Más de cuarenta años en Valencia dicen mucho de vuestro oficio.",
      "Hoy las citas se piden por teléfono, y quien os busca en Google solo encuentra fichas de directorios.",
      "Una web propia enseña vuestro trabajo y deja reservar a cualquier hora, también mientras estáis cortando.",
    ],
    promise: "Una web a la altura de 40 años de oficio, con reservas online para no perder ni una cita.",
    features: [
      { t: "Reserva en pocos clics", d: "El cliente elige servicio y hora, y listo. Sin llamadas mientras tenéis las manos ocupadas." },
      { t: "Servicios y precios claros", d: "Corte, barba y todo lo que hacéis, con fotos de vuestro trabajo." },
      { t: "Galería desde Instagram", d: "Vuestras últimas fotos aparecen solas en la web. Cero trabajo extra." },
      { t: "Aparecer en Google", d: "Preparada para búsquedas como \"barbería en el Ensanche\" y conectada con Google Maps." },
    ],
    samples: [S.reverie, S.doberman],
  },
  {
    slug: "trenzas-africanas-madrid",
    lang: "es",
    business: "Trenzas Africanas Madrid",
    brand: "Trenzas Africanas Madrid",
    city: "Madrid",
    accent: "#d39a5c",
    date: "Octubre 2026",
    greeting: "Hola, equipo de Trenzas Africanas Madrid",
    today: [
      "Más de 14.000 personas siguen vuestro trabajo en Instagram.",
      "Pero para reservar hay que escribir por mensaje o llamar, y cada clienta pregunta lo mismo: estilos, precios y tiempos.",
      "Una web propia responde a todo eso antes de que pregunten y convierte a esos seguidores en citas.",
    ],
    promise: "Vuestra propia web de reservas: cada estilo, cada precio y la cita en pocos clics.",
    features: [
      { t: "Reserva en pocos clics", d: "La clienta elige estilo y hora, y reserva. Puede conectar con vuestra agenda actual." },
      { t: "Estilos y precios claros", d: "Box braids, knotless, trenzas de raíz: cada estilo con fotos, precio y tiempo." },
      { t: "Galería desde Instagram", d: "Vuestras últimas fotos aparecen solas en la web. Cero trabajo extra." },
      { t: "Aparecer en Google", d: "Preparada para búsquedas como \"trenzas africanas en Madrid\" y conectada con Google Maps." },
    ],
    samples: [S.reverie, S.aaura],
  },
  {
    slug: "delola",
    lang: "es",
    business: "Delola",
    brand: "Delola",
    city: "El Carmen, Valencia",
    accent: "#b0683f",
    date: "Octubre 2026",
    greeting: "Hola, Lola",
    today: [
      "Hoy Delola vive en la calle Quart, en Facebook y en Instagram.",
      "Tus piezas son únicas, pero quien no pasa por El Carmen no tiene dónde verlas todas juntas.",
      "Una web propia enseña cada vestido, bolso y joya, y deja reservarlos antes de venir a la tienda.",
    ],
    promise: "Tu escaparate de piezas únicas, abierto las 24 horas.",
    features: [
      { t: "Catálogo de piezas únicas", d: "Cada vestido, bolso, pañuelo y joya con fotos y precio. Las novedades arriba, siempre." },
      { t: "Reserva y recoge en tienda", d: "La clienta reserva la pieza online y la recoge en la calle Quart." },
      { t: "Fácil de actualizar", d: "Subes una pieza nueva desde el móvil en un minuto." },
      { t: "Aparecer en Google", d: "Preparada para búsquedas como \"tiendas en El Carmen\" y conectada con Google Maps." },
    ],
    samples: [S.malaak, S.noir],
  },
  {
    slug: "estetica-vanessa",
    lang: "es",
    business: "Estética Vanessa",
    brand: "Estética Vanessa",
    city: "Bilbao",
    accent: "#9c7b6b",
    date: "Octubre 2026",
    greeting: "Hola, equipo de Estética Vanessa",
    today: [
      "Desde 2006 en el centro de Bilbao, con la radiofrecuencia INDIBA y la depilación integral masculina como especialidades.",
      "Esa experiencia merece una web a su altura, que explique cada tratamiento y deje reservar sin llamar.",
      "Así, quien os busque en Google ve vuestro trabajo, vuestros precios y un botón de cita, todo en el móvil.",
    ],
    promise: "Una web a la altura de 20 años de experiencia, con reservas en pocos clics.",
    features: [
      { t: "Reserva en pocos clics", d: "La clienta o el cliente elige tratamiento y hora, y listo. Puede conectar con vuestra agenda actual." },
      { t: "Cada tratamiento explicado", d: "INDIBA, depilación masculina, faciales y corporales, con lo que incluye, cuánto dura y su precio." },
      { t: "Sección para hombre", d: "Una página propia para el cliente masculino, que hoy busca estos servicios más que nunca." },
      { t: "Aparecer en Google", d: "Preparada para búsquedas como \"INDIBA en Bilbao\" y conectada con Google Maps." },
    ],
    samples: [S.reverie, S.aaura],
  },
  {
    slug: "jg-tattoo-studio",
    lang: "es",
    business: "JG Tattoo Studio",
    brand: "JG Tattoo Studio",
    city: "Vallecas, Madrid",
    accent: "#e04a3a",
    date: "Octubre 2026",
    greeting: "Hola, Javi y Alex",
    today: [
      "Hoy vuestros clientes os encuentran por Instagram, Facebook y Fresha, donde tenéis un 4,9.",
      "Pero el trabajo de cada artista queda repartido entre perfiles, y pedir presupuesto con una idea concreta no es fácil.",
      "Una web propia reúne el portfolio de los dos, explica tatuajes, piercing y eliminación, y deja pedir presupuesto con la idea y una foto.",
    ],
    promise: "Vuestro portfolio en un solo sitio, con presupuestos que llegan con la idea ya clara.",
    features: [
      { t: "Portfolio por artista", d: "Los trabajos de Javi y de Alex, cada uno con su estilo, siempre al día." },
      { t: "Presupuesto con tu idea", d: "El cliente sube su referencia, la zona y el tamaño. Os llega listo para responder." },
      { t: "Piercing y eliminación", d: "Cada servicio explicado, con cuidados y preguntas frecuentes, para ahorrar mensajes." },
      { t: "Aparecer en Google", d: "Preparada para búsquedas como \"tatuajes en Vallecas\" y conectada con Google Maps." },
    ],
    samples: [S.shadowz, S.doberman],
  },
];

export const getPitch = (slug: string) => PITCHES.find((p) => p.slug === slug);
