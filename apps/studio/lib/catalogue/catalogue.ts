import type { CatalogueStep, Flow, ProjectTypeDef } from "@zebraish/lib/catalogue/types";
import {
  designStep,
  websiteFunctionalityStep,
  ecommerceStep,
  cmsAdminStep,
  backendStep,
  authSecurityStep,
  paymentsStep,
  integrationsStep,
  revisionsStep,
  complexityStep,
  deliveryStep,
  hostingStep,
  maintenanceStep,
  contentStep,
  customNoteStep,
} from "./shared";

// ---------------------------------------------------------------------------
// Root question: "What are you building?" — this is the top of the decision
// tree. Everything downstream depends on this single answer.
// ---------------------------------------------------------------------------
export const PROJECT_TYPES: ProjectTypeDef[] = [
  { id: "website", label: "Website", labelEs: "Sitio web", helper: "A site to inform, showcase, or sell.", helperEs: "Un sitio para informar, mostrar o vender.", flow: "website" },
  { id: "web_app", label: "Web App", labelEs: "Aplicación web", helper: "An interactive product people log into and use.", helperEs: "Un producto interactivo en el que la gente inicia sesión y lo usa.", flow: "web_app" },
  { id: "saas", label: "SaaS Application", labelEs: "Aplicación SaaS", helper: "A subscription software product.", helperEs: "Un producto de software por suscripción.", flow: "saas" },
  { id: "custom_software", label: "Custom Software", labelEs: "Software a medida", helper: "Internal or business-specific software.", helperEs: "Software interno o específico para tu negocio.", flow: "custom_software" },
  { id: "mobile_app", label: "Mobile App", labelEs: "Aplicación móvil", helper: "An iOS or Android app.", helperEs: "Una app para iOS o Android.", flow: "mobile_app" },
  { id: "ecommerce", label: "E-commerce", labelEs: "Comercio electrónico", helper: "A store that sells products or services online.", helperEs: "Una tienda que vende productos o servicios online.", flow: "ecommerce" },
  { id: "ai_application", label: "AI Application", labelEs: "Aplicación de IA", helper: "A product built around an AI capability.", helperEs: "Un producto construido alrededor de una capacidad de IA.", flow: "ai_application" },
  { id: "ai_agent", label: "AI Agent", labelEs: "Agente de IA", helper: "An AI that takes actions on your behalf.", helperEs: "Una IA que actúa en tu nombre.", flow: "ai_agent" },
  { id: "automation", label: "Automation System", labelEs: "Sistema de automatización", helper: "Connects tools and removes manual work.", helperEs: "Conecta herramientas y elimina trabajo manual.", flow: "automation" },
  { id: "api_backend", label: "API / Backend System", labelEs: "API / Sistema backend", helper: "Infrastructure with no client-facing UI.", helperEs: "Infraestructura sin interfaz de cara al cliente.", flow: "api_backend" },
  { id: "branding", label: "Branding", labelEs: "Branding", helper: "Logo, identity, and visual system.", helperEs: "Logo, identidad y sistema visual.", flow: "branding" },
  { id: "marketing", label: "Marketing", labelEs: "Marketing", helper: "SEO, content, and growth.", helperEs: "SEO, contenido y crecimiento.", flow: "marketing" },
];

// ---------------------------------------------------------------------------
// WEBSITE
// ---------------------------------------------------------------------------
const websiteBase: CatalogueStep = {
  id: "website_base",
  question: "How big is it?",
  questionEs: "¿Qué tamaño tiene?",
  type: "single",
  role: "base",
  options: [
    { id: "landing_page", label: "Landing page (1 page)", labelEs: "Landing page (1 página)", price: 90 },
    { id: "one_page", label: "One-page website", labelEs: "Sitio web de una página", price: 105 },
    { id: "multi_page", label: "Multi-page website", labelEs: "Sitio web multi-página", price: 235, description: "Includes up to 5 pages." },
  ],
};

const websiteKind: CatalogueStep = {
  id: "website_kind",
  question: "What kind of website is it?",
  questionEs: "¿Qué tipo de sitio web es?",
  helper: "This doesn't change the price, it just helps us understand the project.",
  helperEs: "Esto no cambia el precio, solo nos ayuda a entender el proyecto.",
  type: "single",
  options: [
    ["Personal", "Personal"], ["Portfolio", "Portafolio"], ["Business", "Empresa"], ["Corporate", "Corporativo"],
    ["Blog", "Blog"], ["News / media", "Noticias / medios"], ["Restaurant", "Restaurante"], ["Agency", "Agencia"],
    ["Booking", "Reservas"], ["Membership", "Membresía"], ["Other", "Otro"],
  ].map(([label, labelEs]) => ({ id: label.toLowerCase().replace(/[\s/]+/g, "_"), label, labelEs, price: 0 })),
  optional: true,
};

const websiteStructureStep: CatalogueStep = {
  id: "website_structure",
  question: "How many additional pages beyond what's included?",
  questionEs: "¿Cuántas páginas adicionales necesitas, además de las incluidas?",
  type: "number",
  min: 0,
  max: 40,
  pricePerUnit: 20,
  optional: true,
};

const websiteSectionsStep: CatalogueStep = {
  id: "website_sections",
  question: "Any specific sections or pages?",
  questionEs: "¿Alguna sección o página específica?",
  type: "multi",
  options: [
    { id: "blog_section", label: "Blog", labelEs: "Blog", price: 30 },
    { id: "portfolio_section", label: "Portfolio", labelEs: "Portafolio", price: 25 },
    { id: "faq", label: "FAQ section", labelEs: "Sección de preguntas frecuentes", price: 12 },
    { id: "testimonials", label: "Testimonials section", labelEs: "Sección de testimonios", price: 12 },
    { id: "pricing_section", label: "Pricing section", labelEs: "Sección de precios", price: 15 },
    { id: "team_section", label: "Team section", labelEs: "Sección de equipo", price: 15 },
    { id: "careers", label: "Careers page", labelEs: "Página de empleo", price: 25 },
    { id: "resources", label: "Resources section", labelEs: "Sección de recursos", price: 30 },
    { id: "documentation", label: "Documentation section", labelEs: "Sección de documentación", price: 45 },
    { id: "multi_language", label: "Multi-language support", labelEs: "Soporte multiidioma", price: 60 },
    { id: "custom_nav", label: "Custom navigation structure", labelEs: "Estructura de navegación a medida", price: 30 },
  ],
  optional: true,
};

export const websiteFlow: Flow = {
  id: "website",
  steps: [
    websiteBase,
    websiteKind,
    websiteStructureStep,
    websiteSectionsStep,
    designStep,
    websiteFunctionalityStep,
    cmsAdminStep,
    paymentsStep,
    integrationsStep,
    contentStep,
    revisionsStep,
    complexityStep,
    deliveryStep,
    hostingStep,
    maintenanceStep,
    customNoteStep,
  ],
};

// ---------------------------------------------------------------------------
// SOFTWARE-FAMILY (Web App / SaaS / Custom Software) — same downstream
// questions, different base price attached to the project type itself.
// ---------------------------------------------------------------------------
const softwareTypeStep: CatalogueStep = {
  id: "software_type",
  question: "What type of software are you building?",
  questionEs: "¿Qué tipo de software vas a construir?",
  helper: "Doesn't change the price, helps us scope it correctly.",
  helperEs: "No cambia el precio, nos ayuda a dimensionarlo correctamente.",
  type: "single",
  options: [
    ["Business management software", "Software de gestión empresarial"], ["CRM", "CRM"], ["ERP", "ERP"],
    ["POS system", "Sistema TPV"], ["Inventory management", "Gestión de inventario"],
    ["Booking management", "Gestión de reservas"], ["Financial software", "Software financiero"],
    ["HR software", "Software de RR. HH."], ["Education platform", "Plataforma educativa"],
    ["Healthcare platform", "Plataforma sanitaria"], ["Logistics system", "Sistema de logística"],
    ["Marketplace", "Marketplace"], ["Internal company software", "Software interno de empresa"],
    ["Data management system", "Sistema de gestión de datos"], ["Other", "Otro"],
  ].map(([label, labelEs]) => ({ id: label.toLowerCase().replace(/[\s/]+/g, "_"), label, labelEs, price: 0 })),
  optional: true,
};

const softwareUsersStep: CatalogueStep = {
  id: "software_users",
  question: "Who will use it?",
  questionEs: "¿Quién lo va a usar?",
  type: "multi",
  options: [
    ["Single user", "Un solo usuario"], ["Small team", "Equipo pequeño"], ["Multiple teams", "Varios equipos"],
    ["Customers + staff", "Clientes y personal"], ["Public users", "Usuarios públicos"],
    ["Administrators", "Administradores"], ["Enterprise users", "Usuarios corporativos"],
  ].map(([label, labelEs]) => ({ id: label.toLowerCase().replace(/[\s+]+/g, "_"), label, labelEs, price: 0 })),
  optional: true,
};

function softwareFlow(id: string): Flow {
  return {
    id,
    steps: [
      softwareTypeStep,
      softwareUsersStep,
      backendStep,
      cmsAdminStep,
      authSecurityStep,
      paymentsStep,
      integrationsStep,
      designStep,
      revisionsStep,
      complexityStep,
      deliveryStep,
      hostingStep,
      maintenanceStep,
      customNoteStep,
    ],
  };
}

// ---------------------------------------------------------------------------
// MOBILE APP
// ---------------------------------------------------------------------------
const mobilePlatformStep: CatalogueStep = {
  id: "mobile_platform",
  question: "Which platform?",
  questionEs: "¿Qué plataforma?",
  type: "single",
  options: [
    { id: "ios", label: "iOS", labelEs: "iOS", price: 0 },
    { id: "android", label: "Android", labelEs: "Android", price: 0 },
    { id: "both", label: "iOS + Android", labelEs: "iOS + Android", price: 0 },
  ],
};

const mobileAppTypeStep: CatalogueStep = {
  id: "mobile_app_type",
  question: "What kind of app is it?",
  questionEs: "¿Qué tipo de app es?",
  type: "single",
  options: [
    ["Social", "Social"], ["E-commerce", "Comercio electrónico"], ["Finance", "Finanzas"],
    ["Education", "Educación"], ["Fitness", "Fitness"], ["Productivity", "Productividad"],
    ["Marketplace", "Marketplace"], ["Booking", "Reservas"], ["Business", "Empresa"],
    ["Entertainment", "Entretenimiento"], ["Custom", "A medida"],
  ].map(([label, labelEs]) => ({ id: label.toLowerCase(), label, labelEs, price: 0 })),
};

// Native-specific functionality not covered elsewhere in the catalogue — priced
// consistently with the rest of the scale; adjust freely, this file is just data.
const mobileFunctionalityStep: CatalogueStep = {
  id: "mobile_functionality",
  question: "What should the app do?",
  questionEs: "¿Qué debería hacer la app?",
  type: "multi",
  options: [
    { id: "auth", label: "Authentication", labelEs: "Autenticación", price: 30 },
    { id: "profiles", label: "Profiles", labelEs: "Perfiles", price: 45 },
    { id: "push_notifications", label: "Push notifications", labelEs: "Notificaciones push", price: 45 },
    { id: "in_app_messaging", label: "In-app messaging", labelEs: "Mensajería dentro de la app", price: 60 },
    { id: "payments_mobile", label: "Payments", labelEs: "Pagos", price: 45 },
    { id: "location", label: "Location services", labelEs: "Servicios de localización", price: 45 },
    { id: "camera", label: "Camera integration", labelEs: "Integración con cámara", price: 45 },
    { id: "file_upload_mobile", label: "File upload", labelEs: "Subida de archivos", price: 30 },
    { id: "offline", label: "Offline functionality", labelEs: "Funcionalidad sin conexión", price: 60 },
    { id: "subscriptions_mobile", label: "Subscriptions", labelEs: "Suscripciones", price: 90 },
  ],
  optional: true,
};

export const mobileFlow: Flow = {
  id: "mobile_app",
  steps: [
    mobilePlatformStep,
    mobileAppTypeStep,
    mobileFunctionalityStep,
    backendStep,
    authSecurityStep,
    designStep,
    revisionsStep,
    complexityStep,
    deliveryStep,
    hostingStep,
    maintenanceStep,
    customNoteStep,
  ],
};

// ---------------------------------------------------------------------------
// E-COMMERCE
// ---------------------------------------------------------------------------
const ecommerceBase: CatalogueStep = {
  id: "ecommerce_base",
  question: "What are you selling, and how big is the store?",
  questionEs: "¿Qué vendes, y qué tamaño tiene la tienda?",
  type: "single",
  role: "base",
  options: [
    { id: "ecommerce_website", label: "E-commerce website", labelEs: "Sitio web de comercio electrónico", price: 440, description: "Product catalog, cart, checkout, and basic payment included." },
    { id: "ecommerce_platform", label: "Full e-commerce platform", labelEs: "Plataforma de comercio electrónico completa", price: 700, description: "Larger catalog / marketplace-scale, product catalog, cart, checkout, and basic payment included." },
  ],
};

export const ecommerceFlow: Flow = {
  id: "ecommerce",
  steps: [
    ecommerceBase,
    ecommerceStep,
    cmsAdminStep,
    designStep,
    integrationsStep,
    revisionsStep,
    complexityStep,
    deliveryStep,
    hostingStep,
    maintenanceStep,
    customNoteStep,
  ],
};

// ---------------------------------------------------------------------------
// AI APPLICATION
// ---------------------------------------------------------------------------
const aiTypeStep: CatalogueStep = {
  id: "ai_type",
  question: "What type of AI system are you building?",
  questionEs: "¿Qué tipo de sistema de IA vas a construir?",
  type: "single",
  options: [
    ["AI chatbot", "Chatbot de IA"], ["AI customer support", "Atención al cliente con IA"],
    ["AI content generator", "Generador de contenido con IA"], ["AI image generator", "Generador de imágenes con IA"],
    ["AI voice system", "Sistema de voz con IA"], ["AI transcription system", "Sistema de transcripción con IA"],
    ["AI document analysis", "Análisis de documentos con IA"], ["AI recommendation system", "Sistema de recomendaciones con IA"],
    ["AI search", "Búsqueda con IA"], ["AI personalization", "Personalización con IA"],
    ["AI knowledge assistant", "Asistente de conocimiento con IA"], ["AI analytics", "Analítica con IA"],
    ["Custom AI application", "Aplicación de IA a medida"],
  ].map(([label, labelEs]) => ({ id: label.toLowerCase().replace(/\s+/g, "_"), label, labelEs, price: 0 })),
};

const aiDataStep: CatalogueStep = {
  id: "ai_data",
  question: "What should the AI work with?",
  questionEs: "¿Con qué debería trabajar la IA?",
  type: "multi",
  options: [
    ["Text", "Texto"], ["Images", "Imágenes"], ["Audio", "Audio"], ["Video", "Vídeo"],
    ["Documents", "Documentos"], ["Structured data", "Datos estructurados"],
    ["Website content", "Contenido del sitio web"], ["Database data", "Datos de base de datos"],
  ].map(([label, labelEs]) => ({ id: label.toLowerCase().replace(/\s+/g, "_"), label, labelEs, price: 0 })),
};

const aiApplicationFeaturesStep: CatalogueStep = {
  id: "ai_features",
  question: "Should your AI remember and search through your own documents and knowledge?",
  questionEs: "¿Tu IA debería recordar y buscar en tus propios documentos y conocimiento?",
  helper: "Pick everything that applies. This determines the AI infrastructure we build.",
  helperEs: "Marca todo lo que aplique. Esto determina la infraestructura de IA que construimos.",
  type: "multi",
  options: [
    { id: "ai_chatbot", label: "AI chatbot", labelEs: "Chatbot de IA", price: 120 },
    { id: "ai_customer_support", label: "AI customer support", labelEs: "Atención al cliente con IA", price: 120 },
    { id: "ai_content_generation", label: "AI content generation", labelEs: "Generación de contenido con IA", price: 90 },
    { id: "ai_image_generation", label: "AI image generation", labelEs: "Generación de imágenes con IA", price: 120 },
    { id: "ai_voice_generation", label: "AI voice generation", labelEs: "Generación de voz con IA", price: 120 },
    { id: "ai_transcription", label: "AI transcription", labelEs: "Transcripción con IA", price: 90 },
    { id: "ai_document_analysis", label: "AI document analysis", labelEs: "Análisis de documentos con IA", price: 120 },
    { id: "ai_recommendation", label: "AI recommendation system", labelEs: "Sistema de recomendaciones con IA", price: 145 },
    { id: "ai_search", label: "AI search", labelEs: "Búsqueda con IA", price: 120 },
    { id: "ai_personalization", label: "AI personalization", labelEs: "Personalización con IA", price: 145 },
    { id: "ai_api_integration", label: "AI API integration", labelEs: "Integración de API de IA", price: 90 },
    { id: "custom_ai_model", label: "Custom AI model integration", labelEs: "Integración de modelo de IA a medida", price: 235 },
    { id: "rag_knowledge_base", label: "RAG / knowledge base (remembers your documents)", labelEs: "RAG / base de conocimiento (recuerda tus documentos)", price: 175 },
    { id: "vector_database", label: "Vector database", labelEs: "Base de datos vectorial", price: 90 },
    { id: "ai_moderation", label: "AI moderation", labelEs: "Moderación con IA", price: 90 },
  ],
};

export const aiApplicationFlow: Flow = {
  id: "ai_application",
  steps: [
    aiTypeStep,
    aiDataStep,
    aiApplicationFeaturesStep,
    backendStep,
    authSecurityStep,
    designStep,
    integrationsStep,
    revisionsStep,
    complexityStep,
    deliveryStep,
    hostingStep,
    maintenanceStep,
    customNoteStep,
  ],
};

// ---------------------------------------------------------------------------
// AI AGENT
// ---------------------------------------------------------------------------
const agentPurposeStep: CatalogueStep = {
  id: "agent_purpose",
  question: "What should the agent do?",
  questionEs: "¿Qué debería hacer el agente?",
  type: "single",
  options: [
    ["Customer support", "Atención al cliente"], ["Sales", "Ventas"], ["Lead generation", "Generación de leads"],
    ["Research", "Investigación"], ["Data analysis", "Análisis de datos"], ["Personal assistant", "Asistente personal"],
    ["Business operations", "Operaciones de negocio"], ["Content creation", "Creación de contenido"],
    ["Scheduling", "Agenda"], ["Customer onboarding", "Incorporación de clientes"],
    ["Internal company tasks", "Tareas internas de la empresa"], ["Other", "Otro"],
  ].map(([label, labelEs]) => ({ id: label.toLowerCase().replace(/\s+/g, "_"), label, labelEs, price: 0 })),
};

const agentChannelsStep: CatalogueStep = {
  id: "agent_channels",
  question: "Where should the agent operate?",
  questionEs: "¿Dónde debería operar el agente?",
  type: "multi",
  options: [
    { id: "channel_website", label: "Website", labelEs: "Sitio web", price: 45 },
    { id: "channel_whatsapp", label: "WhatsApp", labelEs: "WhatsApp", price: 60 },
    { id: "channel_telegram", label: "Telegram", labelEs: "Telegram", price: 45 },
    { id: "channel_discord", label: "Discord", labelEs: "Discord", price: 30 },
    { id: "channel_slack", label: "Slack", labelEs: "Slack", price: 30 },
    { id: "channel_email", label: "Email", labelEs: "Correo electrónico", price: 45 },
    { id: "channel_dashboard", label: "Internal dashboard", labelEs: "Panel interno", price: 60 },
    { id: "channel_api", label: "API", labelEs: "API", price: 45 },
  ],
};

const agentAccessStep: CatalogueStep = {
  id: "agent_access",
  question: "What should the agent be able to access?",
  questionEs: "¿A qué debería poder acceder el agente?",
  type: "multi",
  options: [
    { id: "access_knowledge_base", label: "Knowledge base", labelEs: "Base de conocimiento", price: 175 },
    { id: "access_database", label: "Your database", labelEs: "Tu base de datos", price: 90 },
    { id: "access_calendar", label: "Calendar", labelEs: "Calendario", price: 45 },
    { id: "access_email", label: "Email", labelEs: "Correo electrónico", price: 45 },
    { id: "access_apis", label: "External APIs", labelEs: "APIs externas", price: 90 },
    { id: "access_web_search", label: "Internet / web search", labelEs: "Internet / búsqueda web", price: 45 },
  ],
  optional: true,
};

const agentActionsStep: CatalogueStep = {
  id: "agent_actions",
  question: "What actions should it be able to take on its own?",
  questionEs: "¿Qué acciones debería poder realizar por sí solo?",
  type: "multi",
  options: [
    { id: "action_send_emails", label: "Send emails", labelEs: "Enviar correos", price: 30 },
    { id: "action_create_records", label: "Create records", labelEs: "Crear registros", price: 30 },
    { id: "action_update_records", label: "Update records", labelEs: "Actualizar registros", price: 30 },
    { id: "action_search_db", label: "Search databases", labelEs: "Buscar en bases de datos", price: 30 },
    { id: "action_book_appointments", label: "Book appointments", labelEs: "Reservar citas", price: 45 },
    { id: "action_generate_documents", label: "Generate documents", labelEs: "Generar documentos", price: 45 },
    { id: "action_api_requests", label: "Make API requests", labelEs: "Hacer peticiones a APIs", price: 45 },
    { id: "action_notifications", label: "Send notifications", labelEs: "Enviar notificaciones", price: 30 },
    { id: "action_workflows", label: "Execute multi-step workflows", labelEs: "Ejecutar flujos de trabajo de varios pasos", price: 90 },
  ],
  optional: true,
};

const agentIntelligenceStep: CatalogueStep = {
  id: "agent_intelligence",
  question: "How capable should it be?",
  questionEs: "¿Qué tan capaz debería ser?",
  type: "multi",
  options: [
    { id: "multi_agent", label: "Multiple agents working together", labelEs: "Varios agentes trabajando juntos", price: 350 },
    { id: "agent_memory", label: "Memory across conversations", labelEs: "Memoria entre conversaciones", price: 60 },
    { id: "custom_ai_workflow", label: "Custom AI workflow", labelEs: "Flujo de trabajo de IA a medida", price: 175 },
    { id: "vector_database_agent", label: "Vector database", labelEs: "Base de datos vectorial", price: 90 },
    { id: "human_approval", label: "Human approval before acting", labelEs: "Aprobación humana antes de actuar", price: 45 },
    { id: "scheduled_tasks", label: "Scheduled / autonomous tasks", labelEs: "Tareas programadas / autónomas", price: 45 },
  ],
  optional: true,
};

export const aiAgentFlow: Flow = {
  id: "ai_agent",
  steps: [
    agentPurposeStep,
    agentChannelsStep,
    agentAccessStep,
    agentActionsStep,
    agentIntelligenceStep,
    backendStep,
    designStep,
    revisionsStep,
    complexityStep,
    deliveryStep,
    hostingStep,
    maintenanceStep,
    customNoteStep,
  ],
};

// ---------------------------------------------------------------------------
// AUTOMATION
// ---------------------------------------------------------------------------
const automationWhatStep: CatalogueStep = {
  id: "automation_what",
  question: "What do you want to automate?",
  questionEs: "¿Qué quieres automatizar?",
  type: "multi",
  options: [
    ["Lead generation", "Generación de leads"], ["Customer onboarding", "Incorporación de clientes"],
    ["Email", "Correo electrónico"], ["WhatsApp", "WhatsApp"], ["Sales", "Ventas"], ["Payments", "Pagos"],
    ["Invoices", "Facturas"], ["CRM", "CRM"], ["Data processing", "Procesamiento de datos"],
    ["Reporting", "Informes"], ["Internal workflows", "Flujos internos"], ["Social media", "Redes sociales"],
  ].map(([label, labelEs]) => ({ id: label.toLowerCase().replace(/\s+/g, "_"), label, labelEs, price: 0 })),
};

const automationTriggerStep: CatalogueStep = {
  id: "automation_trigger",
  question: "What should start it?",
  questionEs: "¿Qué debería iniciarlo?",
  type: "single",
  options: [
    ["Form submission", "Envío de formulario"], ["Payment", "Pago"], ["New customer", "Cliente nuevo"],
    ["Email", "Correo electrónico"], ["Schedule", "Horario"], ["Database event", "Evento de base de datos"],
    ["Manual trigger", "Activación manual"],
  ].map(([label, labelEs]) => ({ id: label.toLowerCase().replace(/\s+/g, "_"), label, labelEs, price: 0 })),
};

const automationActionsStep: CatalogueStep = {
  id: "automation_actions",
  question: "What should happen when it runs?",
  questionEs: "¿Qué debería pasar cuando se ejecute?",
  type: "multi",
  options: [
    { id: "form_to_email", label: "Form → email", labelEs: "Formulario → correo electrónico", price: 25 },
    { id: "form_to_database", label: "Form → database", labelEs: "Formulario → base de datos", price: 30 },
    { id: "email_automation", label: "Automated email sequences", labelEs: "Secuencias de correo automatizadas", price: 45 },
    { id: "sms_automation", label: "SMS automation", labelEs: "Automatización de SMS", price: 60 },
    { id: "whatsapp_automation", label: "WhatsApp automation", labelEs: "Automatización de WhatsApp", price: 90 },
    { id: "onboarding_automation", label: "Customer onboarding automation", labelEs: "Automatización de incorporación de clientes", price: 60 },
    { id: "invoice_automation", label: "Invoice automation", labelEs: "Automatización de facturas", price: 45 },
    { id: "payment_automation", label: "Payment automation", labelEs: "Automatización de pagos", price: 60 },
    { id: "crm_automation", label: "CRM automation", labelEs: "Automatización de CRM", price: 90 },
    { id: "lead_automation", label: "Lead automation", labelEs: "Automatización de leads", price: 75 },
    { id: "workflow_automation", label: "Multi-step workflow automation", labelEs: "Automatización de flujos de varios pasos", price: 90 },
    { id: "scheduled_tasks_automation", label: "Scheduled tasks", labelEs: "Tareas programadas", price: 45 },
    { id: "third_party_automation", label: "Third-party tool automation", labelEs: "Automatización con herramientas de terceros", price: 60 },
  ],
};

export const automationFlow: Flow = {
  id: "automation",
  steps: [
    automationWhatStep,
    automationTriggerStep,
    automationActionsStep,
    integrationsStep,
    backendStep,
    revisionsStep,
    complexityStep,
    deliveryStep,
    hostingStep,
    maintenanceStep,
    customNoteStep,
  ],
};

// ---------------------------------------------------------------------------
// API / BACKEND SYSTEM
// ---------------------------------------------------------------------------
const apiTypeStep: CatalogueStep = {
  id: "api_type",
  question: "What should this power?",
  questionEs: "¿Qué debería impulsar esto?",
  helper: "No client-facing pages here, this is infrastructure.",
  helperEs: "Sin páginas de cara al cliente aquí, esto es infraestructura.",
  type: "text",
  optional: true,
};

export const backendFlow: Flow = {
  id: "api_backend",
  steps: [
    apiTypeStep,
    backendStep,
    authSecurityStep,
    integrationsStep,
    revisionsStep,
    complexityStep,
    deliveryStep,
    hostingStep,
    maintenanceStep,
    customNoteStep,
  ],
};

// ---------------------------------------------------------------------------
// BRANDING
// ---------------------------------------------------------------------------
const brandingStep: CatalogueStep = {
  id: "branding_items",
  question: "What do you need?",
  questionEs: "¿Qué necesitas?",
  type: "multi",
  options: [
    { id: "logo_design", label: "Logo design", labelEs: "Diseño de logo", price: 45 },
    { id: "logo_redesign", label: "Logo redesign", labelEs: "Rediseño de logo", price: 30 },
    { id: "brand_colors", label: "Brand colors", labelEs: "Colores de marca", price: 18 },
    { id: "typography_system", label: "Typography system", labelEs: "Sistema tipográfico", price: 18 },
    { id: "brand_guidelines", label: "Brand guidelines", labelEs: "Manual de marca", price: 60 },
    { id: "business_card", label: "Business card", labelEs: "Tarjeta de visita", price: 18 },
    { id: "social_kit", label: "Social media kit", labelEs: "Kit para redes sociales", price: 45 },
    { id: "brand_assets", label: "Brand assets pack", labelEs: "Paquete de recursos de marca", price: 60 },
    { id: "packaging_design", label: "Packaging design", labelEs: "Diseño de empaque", price: 45 },
    { id: "full_identity", label: "Full visual identity", labelEs: "Identidad visual completa", price: 145, description: "Everything above, bundled." },
  ],
};

const brandingStyleStep: CatalogueStep = {
  id: "branding_style",
  question: "What style are you going for?",
  questionEs: "¿Qué estilo buscas?",
  type: "text",
  optional: true,
};

export const brandingFlow: Flow = {
  id: "branding",
  steps: [brandingStep, brandingStyleStep, revisionsStep, deliveryStep, customNoteStep],
};

// ---------------------------------------------------------------------------
// MARKETING
// ---------------------------------------------------------------------------
const marketingStep: CatalogueStep = {
  id: "marketing_items",
  question: "What do you need?",
  questionEs: "¿Qué necesitas?",
  type: "multi",
  options: [
    { id: "technical_seo", label: "Technical SEO", labelEs: "SEO técnico", price: 60 },
    { id: "keyword_research", label: "Keyword research", labelEs: "Investigación de palabras clave", price: 45 },
    { id: "on_page_seo", label: "On-page SEO", labelEs: "SEO on-page", price: 45 },
    { id: "schema_markup", label: "Schema markup", labelEs: "Marcado de esquema (schema)", price: 30 },
    { id: "gsc_setup", label: "Google Search Console setup", labelEs: "Configuración de Google Search Console", price: 18 },
    { id: "analytics_setup", label: "Analytics setup", labelEs: "Configuración de analítica", price: 18 },
    { id: "seo_content", label: "SEO content (per article)", labelEs: "Contenido SEO (por artículo)", price: 20, unit: "per_article" },
    { id: "blog_setup", label: "Blog setup", labelEs: "Configuración de blog", price: 30 },
    { id: "social_integration", label: "Social media integration", labelEs: "Integración con redes sociales", price: 25 },
    { id: "email_marketing_setup", label: "Email marketing setup", labelEs: "Configuración de email marketing", price: 45 },
    { id: "newsletter_system", label: "Newsletter system", labelEs: "Sistema de newsletter", price: 45 },
    { id: "lead_gen_system", label: "Lead-generation system", labelEs: "Sistema de generación de leads", price: 60 },
    { id: "conversion_optimization", label: "Conversion optimization", labelEs: "Optimización de conversión", price: 60 },
    { id: "marketing_automation", label: "Marketing automation", labelEs: "Automatización de marketing", price: 90 },
  ],
};

export const marketingFlow: Flow = {
  id: "marketing",
  steps: [marketingStep, revisionsStep, deliveryStep, customNoteStep],
};

// ---------------------------------------------------------------------------
// Flow registry
// ---------------------------------------------------------------------------
export const FLOWS: Record<string, Flow> = {
  website: websiteFlow,
  web_app: softwareFlow("web_app"),
  saas: softwareFlow("saas"),
  custom_software: softwareFlow("custom_software"),
  mobile_app: mobileFlow,
  ecommerce: ecommerceFlow,
  ai_application: aiApplicationFlow,
  ai_agent: aiAgentFlow,
  automation: automationFlow,
  api_backend: backendFlow,
  branding: brandingFlow,
  marketing: marketingFlow,
};

// Base price for project types whose flow doesn't ask a priced "which tier" question
// (website/ecommerce ask it inline via a role:"base" step instead).
export const FLAT_BASE_PRICES: Record<string, number> = {
  web_app: 705,
  saas: 1060,
  custom_software: 1175,
  mobile_app: 880,
  ai_application: 590,
  ai_agent: 350,
  automation: 235,
  api_backend: 350,
  branding: 120,
  marketing: 145,
};
