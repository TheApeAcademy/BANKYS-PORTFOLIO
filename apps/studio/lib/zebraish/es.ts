// English to Spanish (Spain) for the Zebraish design pages. Keys are the exact
// English text as rendered (surrounding whitespace is ignored). Spanish here is
// peninsular and addresses the reader as tú.
import { PROJECT_TYPES, FLOWS } from "@/lib/catalogue/catalogue";
import { GRADES } from "@/lib/catalogue/grade";

const PAGES: Record<string, string> = {
  // Nav, shared chrome
  "Build": "Construir",
  "Work": "Trabajos",
  "Process": "Proceso",
  "Ecosystem": "Ecosistema",
  "Collaborate": "Colabora",
  "Partner": "Socio",
  "Track": "Seguimiento",
  "Start a Project": "Empieza un proyecto",
  "Start a Project →": "Empieza un proyecto →",
  "Start a project": "Empieza un proyecto",
  "Start a project →": "Empieza un proyecto →",
  "Switch theme": "Cambiar tema",
  "Light mode": "Modo claro",
  "Toggle sound": "Activar o desactivar el sonido",
  "Switch to Spanish": "Cambiar a español",
  "Switch to English": "Cambiar a inglés",
  "Call Me": "Llámame",
  "Close": "Cerrar",
  "Open menu": "Abrir menú",

  // Home: hero
  "Zebraish Studio · Founder-Led · Building Now": "Zebraish Studio · Dirigido por su fundador · Creando ahora",
  "you have the idea.": "tú tienes la idea.",
  "WE BUILD": "CONSTRUIMOS",
  "WHAT'S NEXT": "LO QUE VIENE",
  "Idea  ·": "Idea  ·",
  "·  Launch": "·  Lanzar",
  "I'm the founder behind": "Soy el fundador de",
  ", the build layer of the Zebraish ecosystem. I turn ideas into real, hand-built digital products. No templates. No agency bloat.":
    ", la capa de construcción del ecosistema Zebraish. Convierto ideas en productos digitales reales, hechos a mano. Sin plantillas. Sin burocracia de agencia.",
  "Tell Us What You're Building →": "Cuéntanos qué estás creando →",
  "Message Directly": "Escríbeme directamente",
  "Sites Shipped": "Webs lanzadas",
  "Industries": "Sectores",
  "Rating": "Valoración",
  "5–10 Day Delivery": "Entrega en 5–10 días",
  "100% Hand-Built": "100% hecho a mano",
  "Drag to turn": "Arrastra para girar",

  // Ticker and marquees
  "Intelligence": "Inteligencia",
  "Automate": "Automatizar",
  "Brand": "Marca",
  "Grow": "Crecer",
  "Idea → Product": "Idea → Producto",
  "Zebraish Ecosystem": "Ecosistema Zebraish",
  "Founder-Led": "Dirigido por su fundador",
  "Automation": "Automatización",
  "Typography": "Tipografía",
  "Brand Systems": "Sistemas de marca",
  "Dark Editorial": "Editorial oscuro",
  "Motion Design": "Diseño en movimiento",
  "Custom Cursor": "Cursor personalizado",

  // Home: philosophy
  "The Philosophy": "La filosofía",
  "every idea deserves to become": "toda idea merece convertirse en",
  "SOMETHING": "ALGO",
  "REAL.": "REAL.",
  "no two businesses are the same,": "no hay dos negocios iguales,",
  "NEITHER ARE WE.": "NOSOTROS TAMPOCO.",

  // Home: what we build
  "01 · What We Build": "01 · Qué construimos",
  "IDEAS BECOME INFRASTRUCTURE": "LAS IDEAS SE CONVIERTEN EN INFRAESTRUCTURA",
  "Website or full software system, Zebraish Studio figures out what your idea actually needs to become real.":
    "Ya sea una web o un sistema de software completo, Zebraish Studio descubre lo que tu idea necesita de verdad para hacerse realidad.",
  "Speed": "Velocidad",
  "Delivery": "Entrega",
  "Web Development": "Desarrollo web",
  "Websites · Web Apps · Software": "Webs · Apps web · Software",
  "Brand & Identity": "Marca e identidad",
  "Identity · Typography · Design Systems": "Identidad · Tipografía · Sistemas de diseño",
  "Motion & 3D": "Movimiento y 3D",
  "three.js · WebGL · Scroll Storytelling": "three.js · WebGL · Narrativa con scroll",
  "E-commerce": "E-commerce",
  "Stores · Flutterwave · WhatsApp Orders": "Tiendas · Flutterwave · Pedidos por WhatsApp",
  "Workflows · Integrations · CRM": "Flujos de trabajo · Integraciones · CRM",
  "Security": "Seguridad",
  "Auth · Row-Level Security · Audit Logs": "Autenticación · Seguridad a nivel de fila · Registros de auditoría",
  "Growth": "Crecimiento",
  "Launch Strategy · SEO · Analytics": "Estrategia de lanzamiento · SEO · Analítica",
  "Mobile Apps": "Apps móviles",
  "PWA · Capacitor · iOS & Android": "PWA · Capacitor · iOS y Android",
  "AI Integration": "Integración de IA",
  "AI Assistants · Claude API · Agents": "Asistentes de IA · Claude API · Agentes",
  "Live Deployment": "Despliegue en vivo",
  "Vercel · Custom Domain · SSL": "Vercel · Dominio propio · SSL",
  "AI & Analytics · Available on Request": "IA y analítica · Disponible bajo petición",
  "Launch Strategy · The Board (Coming)": "Estrategia de lanzamiento · The Board (próximamente)",

  // Home: work
  "02 · Selected Work": "02 · Trabajos seleccionados",
  "REAL WORK. REAL PROOF.": "TRABAJO REAL. PRUEBAS REALES.",
  "Twelve live sites, twelve different worlds, built by the founder before and during the formation of Zebraish Studio. This is the capability the Studio is built on.":
    "Doce webs en vivo, doce mundos distintos, creadas por el fundador antes y durante la formación de Zebraish Studio. Esta es la capacidad sobre la que se construye el Studio.",
  "These projects were built by the founder, some before Zebraish Studio existed as a name. They're shown here as honest proof of capability, not as claimed Zebraish Studio client work.":
    "Estos proyectos los creó el fundador, algunos antes de que Zebraish Studio existiera como nombre. Se muestran como prueba honesta de capacidad, no como trabajos de clientes de Zebraish Studio.",
  "View All Work": "Ver todos los trabajos",
  "PM Portfolio: Product & Frontend Builder": "PM Portfolio: producto y frontend",
  "Personal product portfolio. PM thinking meets frontend execution: real products shipped to production, presented in a clean dark interface.":
    "Portfolio personal de producto. Pensamiento de PM y ejecución frontend: productos reales en producción, presentados en una interfaz oscura y limpia.",
  "Portfolio": "Portfolio",
  "Tech & Product": "Tecnología y producto",
  "MALAAK: Modest Luxury Abayas": "MALAAK: abayas de lujo discreto",
  "Minimal editorial fashion site. Split-hero layout, hover-reveal product grid, seamless WhatsApp order flow. Built for Snapchat-native buyers.":
    "Web de moda editorial y minimalista. Portada dividida, cuadrícula de productos que se revela al pasar el ratón y pedidos por WhatsApp sin fricción. Pensada para compradores que viven en Snapchat.",
  "Doberman: Bold Brand Experience": "Doberman: experiencia de marca atrevida",
  "High-impact brand site. Aggressive typography, dramatic dark palette, and a conversion-focused layout that commands attention and demands action.":
    "Web de marca de alto impacto. Tipografía agresiva, una paleta oscura y dramática y una maquetación orientada a la conversión que capta la atención y exige acción.",
  "Dark Bold": "Oscuro y atrevido",
  "Interactive": "Interactivo",
  "Christian Prieto: Digital Creator": "Christian Prieto: creador digital",
  "Sleek creator portfolio built for a Barcelona-based fashion and lifestyle creator. Stats-forward layout, TikTok-native aesthetic, and a seamless brand collab flow, with 9.6M likes and counting.":
    "Portfolio elegante para un creador de moda y estilo de vida con base en Barcelona. Maquetación centrada en las cifras, estética nativa de TikTok y un flujo de colaboraciones con marcas sin fricción, con 9,6 M de likes y subiendo.",
  "Creator Economy": "Economía de creadores",
  "Ape Academy: Academic Excellence": "Ape Academy: excelencia académica",
  "Clean, bold educational platform. Strong brand identity, structured content layout, and a no-nonsense conversion flow built for serious learners.":
    "Plataforma educativa limpia y contundente. Identidad de marca sólida, contenido bien estructurado y un flujo de conversión directo para estudiantes que van en serio.",
  "Dark Theme": "Tema oscuro",
  "Bold": "Atrevido",
  "AAURA: Arabian Luxury Perfumery": "AAURA: perfumería árabe de lujo",
  "Animated gold particle field, arabesque typography, WhatsApp ordering. Every pixel drips with money.":
    "Campo de partículas doradas animado, tipografía arabesca y pedidos por WhatsApp. Cada píxel respira lujo.",
  "Luxury": "Lujo",
  "Arabic": "Árabe",
  "NOIR ATELIER: Luxury Ready-to-Wear": "NOIR ATELIER: prêt-à-porter de lujo",
  "Custom magnetic cursor, scrolling marquee, French-named product grid. Bold. Cold. Unforgettable.":
    "Cursor magnético personalizado, marquesina en movimiento y cuadrícula de productos con nombres franceses. Atrevido. Frío. Inolvidable.",
  "High Fashion": "Alta moda",
  "Ember & Salt: Wood-Fired Restaurant": "Ember & Salt: restaurante de horno de leña",
  "CSS animated flame, warm ember palette, seasonal menu tabs, reservation CTA. You can almost smell the smoke.":
    "Llama animada con CSS, paleta cálida de brasas, pestañas de carta de temporada y botón de reserva. Casi se huele el humo.",
  "Restaurant": "Restaurante",
  "Animation": "Animación",
  "Reverie: Luxury Beauty Salon": "Reverie: salón de belleza de lujo",
  "Soft marble luxury aesthetic. Services grid, team showcase, WhatsApp booking integration.":
    "Estética de lujo con mármol suave. Cuadrícula de servicios, presentación del equipo y reservas por WhatsApp.",
  "Marble": "Mármol",

  // Home: process
  "03 · How We Work": "03 · Cómo trabajamos",
  "FROM IDEA": "DE LA IDEA",
  "TO LIVE.": "A LA REALIDAD.",
  "Four steps. No bloat, no bureaucracy, just a founder who ships.": "Cuatro pasos. Sin relleno, sin burocracia, solo un fundador que entrega.",
  "Tell Us What You're Building": "Cuéntanos qué estás creando",
  "Fill out the Start a Project flow or message directly. Tell us what your idea or business needs. Takes 5 minutes.":
    "Completa el formulario de Empieza un proyecto o escríbeme directamente. Cuéntanos qué necesita tu idea o tu negocio. Son 5 minutos.",
  "We Shape a Direction": "Definimos una dirección",
  "Within 48 hours you get a visual direction, structure, and a flat project price.":
    "En menos de 48 horas recibes una dirección visual, una estructura y un precio cerrado del proyecto.",
  "We Build It": "Lo construimos",
  "The full product gets built and sent to you as a live preview link. You review, we refine until it's exactly right.":
    "Construimos el producto completo y te lo enviamos como enlace de vista previa en vivo. Tú lo revisas y lo afinamos hasta que quede exactamente como quieres.",
  "You Launch": "Lo lanzas",
  "Once you're happy, it goes live. From there, the wider Zebraish ecosystem is there to help you keep growing.":
    "Cuando te guste el resultado, se publica. A partir de ahí, el ecosistema Zebraish te acompaña para que sigas creciendo.",
  "04 · The Bigger Picture": "04 · La visión global",
  "04 · The Ecosystem": "04 · El ecosistema",
  "05 · Start a Project": "05 · Empieza un proyecto",

  // Home: collaborate
  "06 · Collaborate": "06 · Colabora",
  "BRING US": "TRÁENOS",
  "CLIENTS.": "CLIENTES.",
  "Refer businesses to Zebraish Studio and earn a commission on every project you bring in.":
    "Recomienda empresas a Zebraish Studio y gana una comisión por cada proyecto que traigas.",
  "New Collaborator?": "¿Nuevo colaborador?",
  "Apply to become an official Zebraish collaborator. Tell us a bit about yourself and we'll follow up.":
    "Solicita ser colaborador oficial de Zebraish. Cuéntanos un poco sobre ti y te contactaremos.",
  "Apply to Collaborate →": "Solicita colaborar →",
  "Already a Collaborator?": "¿Ya eres colaborador?",
  "Enter your access code to check your dashboard: commissions, payouts, everything.":
    "Introduce tu código de acceso para ver tu panel: comisiones, pagos, todo.",
  "Enter Your Code": "Introduce tu código",

  // Home: about
  "07 · About": "07 · Sobre nosotros",
  "ABOUT": "SOBRE",
  ", the build layer of the wider Zebraish ecosystem. Today, that means one person, hand-building real digital products for real businesses.":
    ", la capa de construcción del ecosistema Zebraish. Hoy eso significa una persona creando a mano productos digitales reales para negocios reales.",
  "Most agencies are slow, overpriced, and generic. I started building because good ideas kept getting undersold online. Zebraish Studio is the opposite:":
    "La mayoría de las agencias son lentas, caras y genéricas. Empecé a construir porque veía buenas ideas infravaloradas en internet. Zebraish Studio es lo contrario:",
  "fast, direct, custom": "rápido, directo, a medida",
  ", and built around what a business actually needs to become real.": ", y pensado en lo que un negocio necesita de verdad para hacerse realidad.",
  "the difference is simple:": "la diferencia es sencilla:",
  "\"I deliver in days,": "\"Entrego en días,",
  "not months.\"": "no en meses.\"",
  "Based in": "Con base en",
  ". Building for founders and businesses worldwide.": ". Creando para fundadores y empresas de todo el mundo.",
  "Days Max": "Días máx.",
  "Custom Built": "A medida",
  "Revisions": "Revisiones",
  "Clear Communication": "Comunicación clara",
  "You'll always know exactly what's being worked on. No chasing, no going dark, no surprises.":
    "Siempre sabrás exactamente en qué se está trabajando. Sin tener que perseguir a nadie, sin silencios, sin sorpresas.",
  "Purpose-Built Design": "Diseño con propósito",
  "Every font, colour, layout, and interaction serves one goal: making your idea look and work undeniable.":
    "Cada tipografía, color, maquetación e interacción persigue un objetivo: que tu idea luzca y funcione de forma innegable.",
  "You Own Everything": "Todo es tuyo",
  "All code, all files, all assets are yours forever. No subscriptions, no lock-in.":
    "Todo el código, los archivos y los recursos son tuyos para siempre. Sin suscripciones, sin ataduras.",
  "Worldwide Delivery": "Entregas en todo el mundo",
  "Founders and businesses in Nigeria, the Gulf, the UK, Europe. Wherever you are, we deliver.":
    "Fundadores y empresas en Nigeria, el Golfo, Reino Unido y Europa. Estés donde estés, entregamos.",
  "08 · Official AI Partner": "08 · Socio oficial de IA",

  // Home: contact
  "LET'S BUILD": "CONSTRUYAMOS",
  "SOMETHING REAL.": "ALGO REAL.",
  "Every idea deserves infrastructure that does it justice. Start the project flow above, or message directly. No commitment, no pressure.":
    "Toda idea merece una infraestructura a su altura. Empieza el proyecto arriba o escríbeme directamente. Sin compromiso, sin presión.",

  // World intro
  "Constructing the pattern…": "Construyendo el patrón…",
  "Establishing signal…": "Estableciendo la señal…",
  "Entering Zebraish…": "Entrando en Zebraish…",
  "Ideas have patterns.": "Las ideas tienen patrones.",
  "We give them form.": "Nosotros les damos forma.",

  // Experience
  "Minimal editorial fashion site with a hover-reveal product grid and WhatsApp ordering, built for Snapchat-native buyers.":
    "Web de moda editorial y minimalista con una cuadrícula de productos que se revela al pasar el ratón y pedidos por WhatsApp, pensada para compradores de Snapchat.",
  "High-impact brand site. Aggressive typography, a dramatic dark palette and a conversion-focused layout.":
    "Web de marca de alto impacto. Tipografía agresiva, una paleta oscura y dramática y una maquetación orientada a la conversión.",
  "A quick-fire decision product: two options, one tap, and you see what everyone else picked.":
    "Un producto de decisiones rápidas: dos opciones, un toque y ves lo que eligieron los demás.",
  "Arabian luxury perfumery. Animated gold particle field, arabesque typography and WhatsApp ordering.":
    "Perfumería árabe de lujo. Campo de partículas doradas animado, tipografía arabesca y pedidos por WhatsApp.",
  "Creator portfolio for a Barcelona-based fashion and lifestyle creator. Stats-forward, TikTok-native, with a brand collab flow.":
    "Portfolio para un creador de moda y estilo de vida con base en Barcelona. Centrado en las cifras, nativo de TikTok y con flujo de colaboraciones con marcas.",
  "Children’s Ministry": "Ministerio infantil",
  "Website for the MFM children’s ministry.": "Web para el ministerio infantil de MFM.",
  "Bold educational platform with a strong identity, structured content and a no-nonsense conversion flow.":
    "Plataforma educativa contundente, con identidad fuerte, contenido estructurado y un flujo de conversión directo.",
  "A Nigerian kitchen where customers browse the menu and order food online.":
    "Una cocina nigeriana donde los clientes consultan la carta y piden comida online.",
  "Soft marble luxury salon site. Services grid, team showcase and WhatsApp booking.":
    "Web de salón de lujo con mármol suave. Cuadrícula de servicios, presentación del equipo y reservas por WhatsApp.",
  "BUILD": "CONSTRUIR",
  "The build layer: websites, software, brand and automation. Live today.": "La capa de construcción: webs, software, marca y automatización. Activa hoy.",
  "LAUNCH": "LANZAR",
  "Where businesses built with Studio launch, gather feedback and get discovered.":
    "Donde los negocios creados con Studio se lanzan, reciben opiniones y se dan a conocer.",
  "DISTRIBUTE": "DISTRIBUIR",
  "Getting what we build in front of the right people.": "Hacer que lo que construimos llegue a las personas adecuadas.",
  "Creator Network": "Red de creadores",
  "CONNECT": "CONECTAR",
  "Creators and brands, connected.": "Creadores y marcas, conectados.",
  "Businesses": "Empresas",
  "COLLABORATE": "COLABORAR",
  "Businesses working together across the ecosystem.": "Empresas que colaboran en todo el ecosistema.",
  "EXPERIENCE": "EXPERIENCIA",
  "Zebraish El Mundo, “Zebraish, the World”: fashion, culture and lifestyle.": "Zebraish El Mundo: moda, cultura y estilo de vida.",
  "New ideas": "Nuevas ideas",
  "RETURN TO BUILD": "VUELVEN A CONSTRUIRSE",
  "Every outcome feeds the next build.": "Cada resultado alimenta el siguiente proyecto.",
  "Digital Products": "Productos digitales",
  "Websites": "Webs",
  "Browser worlds": "Mundos en el navegador",
  "Mobile": "Móvil",
  "AI": "IA",
  "Agents · Systems": "Agentes · Sistemas",
  "Flows": "Flujos",
  "Identity": "Identidad",
  "Creative Technology": "Tecnología creativa",
  "Hover me": "Pasa el ratón",
  "Pattern": "Patrón",
  "Signal": "Señal",
  "Forge": "Forja",
  "Form": "Forma",
  "Living": "Vivo",
  "Systems": "Sistemas",
  "World": "Mundo",
  "Tap to power on": "Toca para encender",
  "Skip intro →": "Saltar intro →",
  "Click to power on": "Haz clic para encender",
  "Power on": "Encender",
  "Sound off · turn it on anytime": "Sonido apagado · actívalo cuando quieras",
  "Best with sound": "Mejor con sonido",
  "Sound on": "Sonido activado",
  "Sound off": "Sonido desactivado",
  "STRIPES": "RAYAS",
  "LINES": "LÍNEAS",
  "NODES": "NODOS",
  "SYSTEMS": "SISTEMAS",
  "PRODUCTS": "PRODUCTOS",
  "BUSINESSES": "NEGOCIOS",
  "↓ LINES": "↓ LÍNEAS",
  "↓ NODES": "↓ NODOS",
  "↓ SYSTEMS": "↓ SISTEMAS",
  "↓ PRODUCTS": "↓ PRODUCTOS",
  "↓ BUSINESSES": "↓ NEGOCIOS",
  "We build what": "Construimos lo que",
  "comes next.": "está por venir.",
  "At the centre, the": "En el centro, el",
  "Zebraish Core.": "Núcleo Zebraish.",
  "Its stripes are not a texture. They are generated across the geometry, and it evolves as you scroll.":
    "Sus rayas no son una textura. Se generan sobre la geometría y evolucionan mientras haces scroll.",
  "A digital product shouldn't just exist.": "Un producto digital no debería limitarse a existir.",
  "It should behave.": "Debería comportarse.",
  "One pattern.": "Un patrón.",
  "Infinite directions.": "Infinitas direcciones.",
  "Back · Esc": "Volver · Esc",
  "Explore": "Explorar",
  "Drag": "Arrastra",
  "View": "Ver",
  "Open": "Abrir",

  // Project categories and tags
  "Modest Fashion": "Moda modesta",
  "Product": "Producto",
  "Fragrance": "Fragancia",
  "Creator": "Creador",
  "Education": "Educación",
  "Food & Drink": "Comida y bebida",
  "Beauty": "Belleza",
  "Apparel": "Ropa",
  "Entertainment": "Entretenimiento",
  "Urban Tech": "Tecnología urbana",
  "Tech": "Tecnología",
  "Dark": "Oscuro",
  "Web app": "App web",
  "Community": "Comunidad",
  "Ministry": "Ministerio",
  "Food": "Comida",
  "Ordering": "Pedidos",
  "Nigerian": "Nigeriana",

  // Case study
  "Challenge": "Reto",
  "Approach": "Enfoque",
  "Experience": "Experiencia",
  "Result": "Resultado",
  "← All work": "← Todos los trabajos",
  "Case study": "Caso de estudio",
  "Case Study": "Caso de estudio",
  "Visit live site →": "Ver web en vivo →",
  Visit: "Visitar",
  "Visit site": "Visitar web",
  "Previous work": "Trabajo anterior",
  "Next work": "Siguiente trabajo",
  "Swipe to explore": "Desliza para explorar",
  "Drag or use the arrows": "Arrastra o usa las flechas",
  "Selected work": "Trabajos seleccionados",
  "An online boutique for modest luxury abayas, from collection to checkout.": "Una boutique online de abayas de lujo discreto, de la colección al pago.",
  "A bold, dark brand world built to make a first impression stick.": "Un universo de marca oscuro y contundente, hecho para que la primera impresión se quede.",
  "Portfolio and collab hub for a fashion and lifestyle creator.": "Portfolio y punto de contacto para colaboraciones de un creador de moda y estilo de vida.",
  "An Arabian perfume house presented like a luxury flagship store.": "Una casa de perfumes árabes presentada como una tienda insignia de lujo.",
  "A restaurant site where the menu and the story lead the way.": "Una web de restaurante donde mandan la carta y la historia.",
  "An academic help platform: submit a task, pay, and get the documents delivered.": "Una plataforma de ayuda académica: envías la tarea, pagas y recibes los documentos.",
  "A luxury beauty salon site made for browsing services and booking.": "La web de un salón de belleza de lujo, pensada para ver servicios y reservar.",
  "A ready-to-wear label with a quiet, editorial storefront.": "Una marca de prêt-à-porter con una tienda sobria y editorial.",
  "A wood-fired restaurant with its menus, atmosphere and reservations.": "Un restaurante de leña con sus cartas, su ambiente y reservas.",
  "Interactive stories that talk back to the reader.": "Historias interactivas que responden al lector.",
  "An urban art platform with a layer of intelligence on top.": "Una plataforma de arte urbano con una capa de inteligencia.",
  "The portfolio of a product and frontend builder.": "El portfolio de un creador de producto y frontend.",
  "Build something like this": "Crea algo así",
  "Next project": "Siguiente proyecto",
  "A modest luxury abaya label selling mostly through Snapchat DMs, with no single place to see the collection.":
    "Una marca de abayas de lujo discreto que vendía sobre todo por mensajes de Snapchat, sin un único sitio donde ver la colección.",
  "Treat the site like a lookbook: quiet split-hero layout, big imagery, and ordering that stays inside the channel customers already use.":
    "Tratar la web como un lookbook: portada dividida y serena, imágenes grandes y pedidos que se quedan en el canal que los clientes ya usan.",
  "An editorial storefront with a hover-reveal product grid and one-tap WhatsApp ordering per piece.":
    "Una tienda editorial con cuadrícula de productos que se revela al pasar el ratón y pedidos por WhatsApp con un solo toque por prenda.",
  "Slow, calm motion and generous whitespace so the garments carry the page.":
    "Movimiento lento y sereno y mucho espacio en blanco para que las prendas sean las protagonistas.",
  "Live, and the collection now has one link to share.": "En vivo, y la colección ya tiene un único enlace para compartir.",
  "A bold brand that needed a site as loud as its identity without losing the path to action.":
    "Una marca atrevida que necesitaba una web tan potente como su identidad sin perder el camino hacia la acción.",
  "Lead with type. Oversized, aggressive headlines on a dark palette, with every section pointing at one conversion.":
    "Liderar con la tipografía. Titulares enormes y agresivos sobre una paleta oscura, con cada sección apuntando a una sola conversión.",
  "A single-page brand experience with interactive sections and a clear call to action.":
    "Una experiencia de marca en una sola página con secciones interactivas y una llamada a la acción clara.",
  "Hard cuts, heavy weight and contrast. It commands attention.": "Cortes secos, mucho peso y contraste. Capta la atención.",
  "Live brand site with a direct conversion flow.": "Web de marca en vivo con un flujo de conversión directo.",
  "Turn a simple “this or that” game into a product people come back to.":
    "Convertir un simple juego de “esto o aquello” en un producto al que la gente vuelve.",
  "Strip it to the core loop: two choices, one tap, instant results. Nothing between the user and the next question.":
    "Reducirlo a lo esencial: dos opciones, un toque, resultados al instante. Nada entre el usuario y la siguiente pregunta.",
  "A fast web app with head-to-head choices and live results after every vote.":
    "Una app web rápida con elecciones cara a cara y resultados en vivo tras cada voto.",
  "Snappy transitions and immediate feedback so each tap feels rewarding.":
    "Transiciones ágiles y respuesta inmediata para que cada toque resulte gratificante.",
  "Live product built and shipped by Zebraish Studio.": "Producto en vivo creado y lanzado por Zebraish Studio.",
  "Sell scent online, where the product itself cannot be experienced.": "Vender perfume online, donde el producto no se puede oler.",
  "Sell the feeling instead: an animated gold particle field, arabesque type and a rich, warm palette.":
    "Vender la sensación: un campo de partículas doradas animado, tipografía arabesca y una paleta rica y cálida.",
  "A luxury storefront with canvas effects and WhatsApp ordering.": "Una tienda de lujo con efectos en canvas y pedidos por WhatsApp.",
  "Every pixel reads as expensive: drifting gold, deep blacks, slow reveals.":
    "Cada píxel transmite lujo: oro flotante, negros profundos, apariciones lentas.",
  "Live luxury storefront taking orders over WhatsApp.": "Tienda de lujo en vivo que recibe pedidos por WhatsApp.",
  "A creator with a big audience (9.6M likes) and no professional page for brands to land on.":
    "Un creador con una gran audiencia (9,6 M de likes) y sin una página profesional a la que pudieran llegar las marcas.",
  "Make the numbers the hero and speak the language of the platform the audience lives on.":
    "Convertir las cifras en protagonistas y hablar el idioma de la plataforma en la que vive su audiencia.",
  "A stats-forward portfolio with a direct brand collaboration flow.": "Un portfolio centrado en las cifras con un flujo directo de colaboraciones con marcas.",
  "TikTok-native pacing: bold, quick and scroll-friendly.": "Ritmo nativo de TikTok: atrevido, rápido y pensado para el scroll.",
  "Live creator page for brand partnerships.": "Página de creador en vivo para colaboraciones con marcas.",
  "Give a children’s ministry a clear, friendly home online for parents and volunteers.":
    "Dar a un ministerio infantil un espacio online claro y cercano para padres y voluntarios.",
  "Warm, simple and easy to navigate, with the essentials one tap away.": "Cálido, sencillo y fácil de navegar, con lo esencial a un toque.",
  "A ministry website with programmes, information and contact.": "Una web del ministerio con programas, información y contacto.",
  "Friendly and uncluttered, built for parents on their phones.": "Cercana y despejada, pensada para padres desde el móvil.",
  "Live ministry website.": "Web del ministerio en vivo.",
  "An education brand that needed to look serious to serious learners.": "Una marca educativa que necesitaba transmitir seriedad a estudiantes serios.",
  "A strong identity, structured content and one clear route to enrol.": "Una identidad fuerte, contenido estructurado y un único camino claro para inscribirse.",
  "An educational platform with a dark, bold theme and a direct conversion flow.":
    "Una plataforma educativa con un tema oscuro y atrevido y un flujo de conversión directo.",
  "Confident and structured. No distractions from the offer.": "Segura y estructurada. Sin distracciones que alejen de la oferta.",
  "Live education platform.": "Plataforma educativa en vivo.",
  "A Nigerian kitchen taking orders by phone and chat, with no menu customers could browse.":
    "Una cocina nigeriana que tomaba pedidos por teléfono y chat, sin una carta que los clientes pudieran consultar.",
  "Put the food first: appetising dishes, clear prices and ordering in as few taps as possible.":
    "La comida primero: platos apetecibles, precios claros y pedidos con los mínimos toques posibles.",
  "An online menu and ordering experience for Nigerian dishes.": "Una carta online y una experiencia de pedido para platos nigerianos.",
  "Warm, hungry-making and fast on mobile.": "Cálida, apetitosa y rápida en el móvil.",
  "Live, with customers ordering food online.": "En vivo, con clientes pidiendo comida online.",
  "A luxury salon booked mostly by word of mouth, with no way to show services and team.":
    "Un salón de lujo que se reservaba sobre todo por el boca a boca, sin forma de mostrar sus servicios y su equipo.",
  "Soft marble luxury: calm, premium and easy to book.": "Lujo de mármol suave: sereno, premium y fácil de reservar.",
  "Services grid, team showcase and WhatsApp booking.": "Cuadrícula de servicios, presentación del equipo y reservas por WhatsApp.",
  "Soft, light and considered, like the salon itself.": "Suave, luminosa y cuidada, como el propio salón.",
  "Live salon site with WhatsApp booking.": "Web del salón en vivo con reservas por WhatsApp.",

  // Device journey
  "Modest Luxury Abayas": "Abayas de lujo discreto",
  "Shop now": "Comprar",
  "Bold Brand Experience": "Experiencia de marca atrevida",
  "Enter": "Entrar",
  "Fashion & Lifestyle Creator": "Creador de moda y estilo de vida",
  "Collab": "Colaborar",
  "Arabian Luxury Perfumery": "Perfumería árabe de lujo",
  "Order": "Pedir",
  "Culinary Excellence": "Excelencia culinaria",
  "Menu": "Carta",
  "Academic Excellence": "Excelencia académica",
  "Enrol": "Inscribirse",
  "Luxury Beauty Salon": "Salón de belleza de lujo",
  "Book": "Reservar",
  "Luxury Ready-to-Wear": "Prêt-à-porter de lujo",
  "Shop": "Tienda",
  "Wood-Fired Restaurant": "Restaurante de horno de leña",
  "Reserve": "Reservar",
  "Stories That Talk Back": "Historias que te responden",
  "Play": "Jugar",
  "Urban Art Intelligence": "Inteligencia de arte urbano",
  "Product & Frontend Builder": "Producto y frontend",
  "Every site, on every screen": "Cada web, en cada pantalla",
  "Full screen": "Pantalla completa",
  "Scroll inside the site": "Haz scroll dentro de la web",
  "Landscape": "Horizontal",
  "Rolls to portrait": "Gira a vertical",
  "Flips front to back": "Se da la vuelta",
  "Living-room scale": "A escala de salón",
  "Back to the list": "Volver a la lista",
  "Pick any site": "Elige cualquier web",
  "Full": "Completa",
  "Portrait": "Vertical",
  "Flip": "Girar",
  "Phone": "Móvil",
  "End": "Fin",
  "Live on screen · 12 sites": "En pantalla · 12 webs",
  "Live site": "Web en vivo",
  "12 sites live · 11 industries · Click one to enter": "12 webs en vivo · 11 sectores · Haz clic en una para entrar",

  // Built by
  "Built by Zebraish": "Creado por Zebraish",
  "PEOPLE WHO": "PERSONAS QUE",
  "TRUSTED": "CONFIARON EN",
  "US.": "NOSOTROS.",
  "Founders, creators and businesses we have built for. Logos arrive as each one signs off.":
    "Fundadores, creadores y empresas para los que hemos construido. Los logos llegan a medida que cada uno da su visto bueno.",
  "Your brand": "Tu marca",

  // Ecosystem
  "Live Today": "Activo hoy",
  "The build layer. Turns ideas and businesses into real websites, software, brand and automation: what this page is.":
    "La capa de construcción. Convierte ideas y negocios en webs, software, marca y automatización reales: lo que es esta página.",
  "Launch": "Lanzar",
  "In Development": "En desarrollo",
  "Where businesses built with Studio can eventually launch, gather feedback, and be discovered. Not built yet, part of the roadmap.":
    "Donde los negocios creados con Studio podrán lanzarse, recibir opiniones y darse a conocer. Aún no está construido; forma parte de la hoja de ruta.",
  "Fashion": "Moda",
  "Create": "Crear",
  "The cultural and creative arm of Zebraish, an animal-inspired fashion universe. Also part of the roadmap, not this build.":
    "El brazo cultural y creativo de Zebraish, un universo de moda inspirado en los animales. También forma parte de la hoja de ruta, no de esta versión.",
  "The World": "El mundo",
  "On the Roadmap": "En la hoja de ruta",
  "ZELM stands for Zebraish El Mundo, meaning “Zebraish, the World.” Zebraish’s fashion, culture, and lifestyle ecosystem, built around discovering, showcasing, and connecting with the modern world of fashion, style, people, brands, and culture.":
    "ZELM significa Zebraish El Mundo. Es el ecosistema de moda, cultura y estilo de vida de Zebraish, creado para descubrir, mostrar y conectar con el mundo actual de la moda, el estilo, las personas, las marcas y la cultura.",
  "You": "Tú",
  "Where it starts": "Donde empieza todo",
  "Every part of the ecosystem begins the same way: with you and an idea. Studio turns it into something real, and the rest of Zebraish helps it grow.":
    "Cada parte del ecosistema empieza igual: contigo y una idea. Studio la convierte en algo real y el resto de Zebraish la ayuda a crecer.",
  "Live Product": "Producto en vivo",
  "Discover · Learn": "Descubrir · Aprender",
  "STUDIO IS THE": "STUDIO ES EL",
  "FIRST STEP.": "PRIMER PASO.",
  "THE": "EL",
  "ECOSYSTEM.": "ECOSISTEMA.",
  "Zebraish Studio is the build layer of a larger ecosystem, one that's still being built, on purpose, in the open.":
    "Zebraish Studio es la capa de construcción de un ecosistema mayor, que se sigue construyendo, a propósito, a la vista de todos.",
  "↺ New ideas return to build": "↺ Las nuevas ideas vuelven a construirse",
  "↺ New ideas return to Studio": "↺ Las nuevas ideas vuelven a Studio",

  // Glass numbers
  "Sites Built & Live": "Webs creadas y en vivo",
  "Industries Served": "Sectores atendidos",
  "Revisions Included": "Revisiones incluidas",
  "Client Satisfaction": "Satisfacción del cliente",
  "The Proof": "La prueba",
  "NUMBERS THAT": "CIFRAS QUE",
  "speak": "hablan",
  "LOUDER": "MÁS ALTO",

  // HenkoGen
  "Layer 03": "Capa 03",
  "Shared pool": "Repositorio compartido",
  "Software and artifacts both teams can reuse. To be defined.": "Software y recursos que ambos equipos pueden reutilizar. Por definir.",
  "Coming": "Próximamente",
  "Layer 02": "Capa 02",
  "AI agents for sales funnels, customer service and social media, implemented alongside your team.":
    "Agentes de IA para embudos de venta, atención al cliente y redes sociales, implantados junto a tu equipo.",
  "Layer 01": "Capa 01",
  "Websites, web apps, software, brand and automation, hand-built and launched.":
    "Webs, apps web, software, marca y automatización, hechos a mano y lanzados.",
  "Sales funnels": "Embudos de venta",
  "Customer service": "Atención al cliente",
  "Social media": "Redes sociales",
  "Coming · to be defined": "Próximamente · por definir",
  "Shared pool of software & artifacts": "Repositorio compartido de software y recursos",
  "MEET": "CONOCE A",
  "Where we build the product, HenkoGen builds the intelligence that runs behind it.":
    "Nosotros construimos el producto; HenkoGen construye la inteligencia que lo mueve.",
  "a product that": "un producto que",
  "thinks.": "piensa.",
  "builds the product: websites, web apps, software, brand and automation, hand-built and launched.":
    "construye el producto: webs, apps web, software, marca y automatización, hechos a mano y lanzados.",
  "designs AI agents that automate sales funnels, customer service, and social media, then stays to implement them alongside your team until they actually work.":
    "diseña agentes de IA que automatizan embudos de venta, atención al cliente y redes sociales, y se queda para implantarlos junto a tu equipo hasta que funcionen de verdad.",
  "Together": "Juntos",
  ", a shared pool of software and artifacts is on the way. Details to be defined.":
    ", viene en camino un repositorio compartido de software y recursos. Detalles por definir.",
  "Builds the product.": "Construye el producto.",
  "HENKOGEN · APPLIED AI": "HENKOGEN · IA APLICADA",
  "Builds the intelligence.": "Construye la inteligencia.",
  "HenkoGen designs AI agents that automate sales funnels, customer service, and social media, then stays to implement them alongside your team until they actually work.":
    "HenkoGen diseña agentes de IA que automatizan embudos de venta, atención al cliente y redes sociales, y se queda para implantarlos junto a tu equipo hasta que funcionen de verdad.",
  "Visit HenkoGen →": "Visita HenkoGen →",
  "Explore Kaizen Agents →": "Descubre Kaizen Agents →",

  // Footer
  "Based in Nigeria · Available Worldwide": "Con base en Nigeria · Disponible en todo el mundo",
  "Become a Collaborator →": "Hazte colaborador →",
  "Terms of Service": "Condiciones del servicio",
  "Privacy Policy": "Política de privacidad",
  "Cookie Policy": "Política de cookies",
  "Legal Notice": "Aviso legal",

  // Idea prompt
  "Web App": "App web",
  "AI Product": "Producto de IA",
  "Creative Experience": "Experiencia creativa",
  "Website": "Web",
  "A booking site for my salon with WhatsApp reminders…": "Una web de reservas para mi salón con recordatorios por WhatsApp…",
  "An online store for my perfume brand…": "Una tienda online para mi marca de perfumes…",
  "An AI assistant that answers my customers 24/7…": "Un asistente de IA que responda a mis clientes 24/7…",
  "A 3D launch page for our new product…": "Una página de lanzamiento en 3D para nuestro nuevo producto…",
  "Sell": "Vender",
  "Engage": "Conectar",
  "Immersive": "Inmersivo",
  "Essential": "Esencial",
  "Advanced": "Avanzado",
  "Creating": "Qué creamos",
  "For": "Para qué",
  "Needs": "Necesita",
  "WhatsApp flow": "Flujo de WhatsApp",
  "Booking": "Reservas",
  "Custom build": "Desarrollo a medida",
  "Ambition": "Ambición",
  "What are we creating?": "¿Qué vamos a crear?",
  "What is it for?": "¿Para qué es?",
  "What does it need to do?": "¿Qué tiene que hacer?",
  "Bookings": "Reservas",
  "Payments": "Pagos",
  "Dashboard": "Panel",
  "How ambitious?": "¿Qué nivel de ambición?",
  "Hi, I'm Zebraish. Four quick questions and I'll shape your project.": "Hola, soy Zebraish. Cuatro preguntas rápidas y doy forma a tu proyecto.",
  "Got it:": "Entendido:",
  "YOUR NEXT IDEA": "TU PRÓXIMA IDEA",
  "STARTS HERE.": "EMPIEZA AQUÍ.",
  "Tell us what you're building. We'll shape a project profile and send a tailored proposal.":
    "Cuéntanos qué estás creando. Daremos forma a un perfil de proyecto y te enviaremos una propuesta a medida.",
  "Project profile generated · See your tailored proposal →": "Perfil de proyecto generado · Ver tu propuesta a medida →",
  "Start over": "Empezar de nuevo",
  "⏎ Run": "⏎ Ejecutar",
  "Live project profile": "Perfil del proyecto en vivo",
  "Updates as you type. Tailored proposal follows.": "Se actualiza mientras escribes. Después llega la propuesta a medida.",
  "Build it →": "Constrúyelo →",
  "Project profile generated · Continue to your tailored proposal →": "Perfil de proyecto generado · Continúa a tu propuesta a medida →",

  // Project builder
  "Your WhatsApp number": "Tu número de WhatsApp",
  "Your email": "Tu email",
  "+234 802 123 4567": "+34 612 34 56 78",
  "you@brand.com": "tu@marca.com",
  "Included": "Incluido",
  "Less": "Menos",
  "More": "Más",
  "each": "c/u",
  "Anything we should know: links, references, special features...": "Cualquier cosa que debamos saber: enlaces, referencias, funciones especiales...",
  "Pick an option to continue.": "Elige una opción para continuar.",
  "Add your name.": "Añade tu nombre.",
  "Add a valid email.": "Añade un email válido.",
  "That email doesn't look right.": "Ese email no parece correcto.",
  "We couldn't save your brief. Try again, or send it straight to us on WhatsApp.":
    "No hemos podido guardar tu brief. Inténtalo de nuevo o envíanoslo directamente por WhatsApp.",
  "Build your project": "Crea tu proyecto",
  "Initial estimate": "Estimación inicial",
  "01 · What are we creating?": "01 · ¿Qué vamos a crear?",
  "Pick what you're building.": "Elige qué estás creando.",
  "Every choice after this updates your estimate live.": "Cada elección a partir de aquí actualiza tu estimación en directo.",
  "Your idea": "Tu idea",
  "· Step": "· Paso",
  "of": "de",
  "Pick everything that applies.": "Elige todo lo que corresponda.",
  "Optional. Skip if it doesn't apply.": "Opcional. Sáltalo si no aplica.",
  "Pick one.": "Elige una.",
  "Last step · Where do we reply?": "Último paso · ¿Dónde te respondemos?",
  "Your brief is graded": "Tu brief tiene el grado",
  "Your initial estimate is": "Tu estimación inicial es de",
  ". We review every brief personally and text you the final price, usually within 48 hours.":
    ". Revisamos cada brief personalmente y te enviamos el precio final, normalmente en menos de 48 horas.",
  "Describe it in a sentence or two": "Descríbelo en una o dos frases",
  "A booking site for my salon with WhatsApp reminders...": "Una web de reservas para mi salón con recordatorios por WhatsApp...",
  "Your name": "Tu nombre",
  "Text me back on": "Respóndeme por",
  "Email (optional, for the written proposal)": "Email (opcional, para la propuesta por escrito)",
  "How the estimate adds up": "Cómo se calcula la estimación",
  "Complexity": "Complejidad",
  "Delivery speed": "Velocidad de entrega",
  "Brief received ·": "Brief recibido ·",
  "We've got your brief. We review it personally and text you the final price on":
    "Ya tenemos tu brief. Lo revisamos personalmente y te enviamos el precio final por",
  ". Send it to us now to skip the queue.": ". Envíanoslo ahora para saltarte la cola.",
  "Copied": "Copiado",
  "Copy brief": "Copiar brief",
  "Track your project →": "Sigue tu proyecto →",
  "← Back": "← Atrás",
  "Review →": "Revisar →",
  "Skip →": "Saltar →",
  "Continue →": "Continuar →",
  "Sending...": "Enviando...",
  "Send my brief →": "Enviar mi brief →",

  "Everything above, bundled.": "Todo lo anterior, en un paquete.",
  "Includes up to 5 pages.": "Incluye hasta 5 páginas.",
  "Larger catalog / marketplace-scale, product catalog, cart, checkout, and basic payment included.":
    "Catálogo más grande o a escala de marketplace, con catálogo de productos, carrito, checkout y pago básico incluidos.",
  "Product catalog, cart, checkout, and basic payment included.": "Catálogo de productos, carrito, checkout y pago básico incluidos.",

  // Tracker
  "Brief received": "Brief recibido",
  "Brief in progress": "Brief en curso",
  "Awaiting payment": "Pendiente de pago",
  "Paid · starting soon": "Pagado · empezamos pronto",
  "Waiting on you": "Esperando tu respuesta",
  "In the queue": "En cola",
  "In progress": "En curso",
  "Internal review": "Revisión interna",
  "Ready for your review": "Listo para tu revisión",
  "Revision requested": "Cambios solicitados",
  "Revising": "Aplicando cambios",
  "Completed": "Completado",
  "Closed": "Cerrado",
  "Cancelled": "Cancelado",
  "Refunded": "Reembolsado",
  "Couldn't reach us. Try again.": "No hemos podido conectar. Inténtalo de nuevo.",
  "Track a project": "Seguir un proyecto",
  "Where's my project at?": "¿Cómo va mi proyecto?",
  "Use the private link we sent you, or enter your project code with the phone number, email or handle you gave us.":
    "Usa el enlace privado que te enviamos o introduce el código de tu proyecto con el teléfono, email o usuario que nos diste.",
  "Project code": "Código del proyecto",
  "Phone, email or handle you used": "Teléfono, email o usuario que usaste",
  "Looking...": "Buscando...",
  "Show my project →": "Ver mi proyecto →",
  "Project": "Proyecto",
  "Couldn't send. Try again.": "No se ha podido enviar. Inténtalo de nuevo.",
  "Your project.": "Tu proyecto.",
  "Final price": "Precio final",
  "Pending": "Pendiente",
  "Confirmed after review.": "Confirmado tras la revisión.",
  "We're reviewing your brief. We'll text you the final price, usually within 48 hours.":
    "Estamos revisando tu brief. Te enviaremos el precio final, normalmente en menos de 48 horas.",
  "Pay": "Pagar",
  "Progress": "Progreso",
  "Starting soon": "Empezamos pronto",
  "We're waiting on something from you. Check your messages below.": "Necesitamos algo de ti. Revisa tus mensajes abajo.",
  "This project is paused for now. We'll message you here.": "Este proyecto está en pausa por ahora. Te escribiremos aquí.",
  "Your brief": "Tu brief",
  "Messages": "Mensajes",
  "No messages yet. Ask us anything here.": "Aún no hay mensajes. Pregúntanos lo que quieras aquí.",
  "Write a message...": "Escribe un mensaje...",
  "Send": "Enviar",
  "Track a different project": "Seguir otro proyecto",
  "Couldn't reach us. Try again in a moment.": "No hemos podido conectar. Inténtalo de nuevo en un momento.",
  "Your project": "Tu proyecto",
  "Zebraish Studio · Tracker": "Zebraish Studio · Seguimiento",
  "Loading your project...": "Cargando tu proyecto...",

  "Missing project link.": "Falta el enlace del proyecto.",
  "Too many attempts. Wait a few minutes and try again.": "Demasiados intentos. Espera unos minutos y vuelve a intentarlo.",
  "We couldn't find that project. Check the link, or look it up with your code.":
    "No hemos encontrado ese proyecto. Revisa el enlace o búscalo con tu código.",
  "Enter your project code and the contact you used.": "Introduce el código de tu proyecto y el contacto que usaste.",
  "Too many attempts. Wait 15 minutes and try again.": "Demasiados intentos. Espera 15 minutos y vuelve a intentarlo.",
  "No match. Use the code from your confirmation and the same number, email or handle you gave us.":
    "No hay coincidencias. Usa el código de tu confirmación y el mismo número, email o usuario que nos diste.",
  "Write a message first.": "Escribe un mensaje primero.",
  "That message is too long.": "Ese mensaje es demasiado largo.",

  // Project stages (from the database)
  "API Design": "Diseño de la API",
  "App Store Submission": "Envío a las tiendas de apps",
  "Architecture & Planning": "Arquitectura y planificación",
  "Client Review": "Revisión del cliente",
  "Concept Development": "Desarrollo del concepto",
  "Content Creation": "Creación de contenido",
  "Creative Brief": "Brief creativo",
  "Deployment": "Despliegue",
  "Deployment & Handover": "Despliegue y entrega",
  "Design": "Diseño",
  "Development": "Desarrollo",
  "Documentation": "Documentación",
  "Final Assets": "Recursos finales",
  "Integration & Testing": "Integración y pruebas",
  "Optimization": "Optimización",
  "Project Submitted": "Proyecto enviado",
  "Requirements Gathering": "Recogida de requisitos",
  "Requirements Review": "Revisión de requisitos",
  "Strategy & Research": "Estrategia e investigación",
  "Submission": "Envío",
  "Testing & QA": "Pruebas y control de calidad",

  // Collaborator pop-ups
  "Application sent": "Solicitud enviada",
  "Bring us clients. Earn on every project.": "Tráenos clientes. Gana con cada proyecto.",
  "Tell us about yourself and we'll follow up.": "Cuéntanos sobre ti y te contactaremos.",
  "Already a collaborator?": "¿Ya eres colaborador?",
  "Collaborator access": "Acceso de colaboradores",
  "Enter your code.": "Introduce tu código.",
  "Your commissions and payouts open next.": "A continuación verás tus comisiones y pagos.",
  "New? Apply to collaborate": "¿Eres nuevo? Solicita colaborar",
  "Become a collaborator": "Hazte colaborador",
};

/** Catalogue labels, questions and helpers already carry their Spanish; reuse it. */
function fromCatalogue(): Record<string, string> {
  const out: Record<string, string> = {};
  const put = (en?: string, es?: string) => {
    if (en && es && en !== es) out[en] = es;
  };
  for (const t of PROJECT_TYPES) {
    put(t.label, t.labelEs);
    put(t.helper, t.helperEs);
  }
  for (const flow of Object.values(FLOWS)) {
    for (const s of flow.steps) {
      put(s.question, s.questionEs);
      put(s.helper, s.helperEs);
      for (const o of s.options ?? []) {
        put(o.label, o.labelEs);
      }
    }
  }
  return out;
}

const GRADES_ES: Record<string, [string, string]> = {
  Z1: ["Chispa", "Proyecto pequeño y concreto. Entrega rápida."],
  Z2: ["Base", "Un producto completo con algunas piezas en movimiento."],
  Z3: ["Motor", "Lógica a medida, integraciones o una superficie mayor."],
  Z4: ["Sistema", "Varios sistemas trabajando juntos. Planificado por fases."],
  Z5: ["Insignia", "Proyecto grande y de alto impacto. Lo definimos contigo en una llamada."],
};

function fromGrades(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const g of GRADES) {
    const es = GRADES_ES[g.code];
    if (!es) continue;
    out[`__grade_${g.name}`] = es[0];
    out[g.blurb] = es[1];
  }
  return out;
}

export const ES: Record<string, string> = { ...fromCatalogue(), ...fromGrades(), ...PAGES };

/** Grade names are short words that also appear elsewhere ("Build"), so they are looked up by grade. */
export function gradeNameEs(name: string): string {
  return ES[`__grade_${name}`] ?? name;
}

export const ES_PATTERNS: [RegExp, string][] = [
  [/^Hey (.+)\.$/, "Hola, $1."],
  [/^Confirmed after review \(estimate was (.+)\)\.$/, "Confirmado tras la revisión (la estimación era de $1)."],
  [/^Send on (.+) →$/, "Enviar por $1 →"],
  [/^Websites from (.+)$/, "Webs desde $1"],
  [/^Web apps from (.+)$/, "Apps web desde $1"],
  [/^Stores from (.+)$/, "Tiendas online desde $1"],
  [/^AI products from (.+)$/, "Productos de IA desde $1"],
  [/^(.+) live site$/, "Web en vivo de $1"],
  [/^Pattern No\. (\d+) · generated for this visit$/, "Patrón n.º $1 · generado para esta visita"],
  [/^Base: (.+)$/, "Base: $T1"],
  [/^(.+) \((\d+)\)$/, "$T1 ($2)"],
];
