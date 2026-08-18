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
  { id: "website", label: "Website", helper: "A site to inform, showcase, or sell.", flow: "website" },
  { id: "web_app", label: "Web App", helper: "An interactive product people log into and use.", flow: "web_app" },
  { id: "saas", label: "SaaS Application", helper: "A subscription software product.", flow: "saas" },
  { id: "custom_software", label: "Custom Software", helper: "Internal or business-specific software.", flow: "custom_software" },
  { id: "mobile_app", label: "Mobile App", helper: "An iOS or Android app.", flow: "mobile_app" },
  { id: "ecommerce", label: "E-commerce", helper: "A store that sells products or services online.", flow: "ecommerce" },
  { id: "ai_application", label: "AI Application", helper: "A product built around an AI capability.", flow: "ai_application" },
  { id: "ai_agent", label: "AI Agent", helper: "An AI that takes actions on your behalf.", flow: "ai_agent" },
  { id: "automation", label: "Automation System", helper: "Connects tools and removes manual work.", flow: "automation" },
  { id: "api_backend", label: "API / Backend System", helper: "Infrastructure with no client-facing UI.", flow: "api_backend" },
  { id: "branding", label: "Branding", helper: "Logo, identity, and visual system.", flow: "branding" },
  { id: "marketing", label: "Marketing", helper: "SEO, content, and growth.", flow: "marketing" },
];

// ---------------------------------------------------------------------------
// WEBSITE
// ---------------------------------------------------------------------------
const websiteBase: CatalogueStep = {
  id: "website_base",
  question: "How big is it?",
  type: "single",
  role: "base",
  options: [
    { id: "landing_page", label: "Landing page (1 page)", price: 90 },
    { id: "one_page", label: "One-page website", price: 105 },
    { id: "multi_page", label: "Multi-page website", price: 235, description: "Includes up to 5 pages." },
  ],
};

const websiteKind: CatalogueStep = {
  id: "website_kind",
  question: "What kind of website is it?",
  helper: "This doesn't change the price — it just helps us understand the project.",
  type: "single",
  options: [
    "Personal", "Portfolio", "Business", "Corporate", "Blog", "News / media",
    "Restaurant", "Agency", "Booking", "Membership", "Other",
  ].map((label) => ({ id: label.toLowerCase().replace(/[\s/]+/g, "_"), label, price: 0 })),
  optional: true,
};

const websiteStructureStep: CatalogueStep = {
  id: "website_structure",
  question: "How many additional pages beyond what's included?",
  type: "number",
  min: 0,
  max: 40,
  pricePerUnit: 20,
  optional: true,
};

const websiteSectionsStep: CatalogueStep = {
  id: "website_sections",
  question: "Any specific sections or pages?",
  type: "multi",
  options: [
    { id: "blog_section", label: "Blog", price: 30 },
    { id: "portfolio_section", label: "Portfolio", price: 25 },
    { id: "faq", label: "FAQ section", price: 12 },
    { id: "testimonials", label: "Testimonials section", price: 12 },
    { id: "pricing_section", label: "Pricing section", price: 15 },
    { id: "team_section", label: "Team section", price: 15 },
    { id: "careers", label: "Careers page", price: 25 },
    { id: "resources", label: "Resources section", price: 30 },
    { id: "documentation", label: "Documentation section", price: 45 },
    { id: "multi_language", label: "Multi-language support", price: 60 },
    { id: "custom_nav", label: "Custom navigation structure", price: 30 },
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
  helper: "Doesn't change the price — helps us scope it correctly.",
  type: "single",
  options: [
    "Business management software", "CRM", "ERP", "POS system", "Inventory management",
    "Booking management", "Financial software", "HR software", "Education platform",
    "Healthcare platform", "Logistics system", "Marketplace", "Internal company software",
    "Data management system", "Other",
  ].map((label) => ({ id: label.toLowerCase().replace(/[\s/]+/g, "_"), label, price: 0 })),
  optional: true,
};

const softwareUsersStep: CatalogueStep = {
  id: "software_users",
  question: "Who will use it?",
  type: "multi",
  options: [
    "Single user", "Small team", "Multiple teams", "Customers + staff", "Public users",
    "Administrators", "Enterprise users",
  ].map((label) => ({ id: label.toLowerCase().replace(/[\s+]+/g, "_"), label, price: 0 })),
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
  type: "single",
  options: [
    { id: "ios", label: "iOS", price: 0 },
    { id: "android", label: "Android", price: 0 },
    { id: "both", label: "iOS + Android", price: 0 },
  ],
};

const mobileAppTypeStep: CatalogueStep = {
  id: "mobile_app_type",
  question: "What kind of app is it?",
  type: "single",
  options: [
    "Social", "E-commerce", "Finance", "Education", "Fitness", "Productivity",
    "Marketplace", "Booking", "Business", "Entertainment", "Custom",
  ].map((label) => ({ id: label.toLowerCase(), label, price: 0 })),
};

// Native-specific functionality not covered elsewhere in the catalogue — priced
// consistently with the rest of the scale; adjust freely, this file is just data.
const mobileFunctionalityStep: CatalogueStep = {
  id: "mobile_functionality",
  question: "What should the app do?",
  type: "multi",
  options: [
    { id: "auth", label: "Authentication", price: 30 },
    { id: "profiles", label: "Profiles", price: 45 },
    { id: "push_notifications", label: "Push notifications", price: 45 },
    { id: "in_app_messaging", label: "In-app messaging", price: 60 },
    { id: "payments_mobile", label: "Payments", price: 45 },
    { id: "location", label: "Location services", price: 45 },
    { id: "camera", label: "Camera integration", price: 45 },
    { id: "file_upload_mobile", label: "File upload", price: 30 },
    { id: "offline", label: "Offline functionality", price: 60 },
    { id: "subscriptions_mobile", label: "Subscriptions", price: 90 },
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
  type: "single",
  role: "base",
  options: [
    { id: "ecommerce_website", label: "E-commerce website", price: 440, description: "Product catalog, cart, checkout, and basic payment included." },
    { id: "ecommerce_platform", label: "Full e-commerce platform", price: 700, description: "Larger catalog / marketplace-scale, product catalog, cart, checkout, and basic payment included." },
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
  type: "single",
  options: [
    "AI chatbot", "AI customer support", "AI content generator", "AI image generator",
    "AI voice system", "AI transcription system", "AI document analysis",
    "AI recommendation system", "AI search", "AI personalization", "AI knowledge assistant",
    "AI analytics", "Custom AI application",
  ].map((label) => ({ id: label.toLowerCase().replace(/\s+/g, "_"), label, price: 0 })),
};

const aiDataStep: CatalogueStep = {
  id: "ai_data",
  question: "What should the AI work with?",
  type: "multi",
  options: [
    "Text", "Images", "Audio", "Video", "Documents", "Structured data",
    "Website content", "Database data",
  ].map((label) => ({ id: label.toLowerCase().replace(/\s+/g, "_"), label, price: 0 })),
};

const aiApplicationFeaturesStep: CatalogueStep = {
  id: "ai_features",
  question: "Should your AI remember and search through your own documents and knowledge?",
  helper: "Pick everything that applies — this determines the AI infrastructure we build.",
  type: "multi",
  options: [
    { id: "ai_chatbot", label: "AI chatbot", price: 120 },
    { id: "ai_customer_support", label: "AI customer support", price: 120 },
    { id: "ai_content_generation", label: "AI content generation", price: 90 },
    { id: "ai_image_generation", label: "AI image generation", price: 120 },
    { id: "ai_voice_generation", label: "AI voice generation", price: 120 },
    { id: "ai_transcription", label: "AI transcription", price: 90 },
    { id: "ai_document_analysis", label: "AI document analysis", price: 120 },
    { id: "ai_recommendation", label: "AI recommendation system", price: 145 },
    { id: "ai_search", label: "AI search", price: 120 },
    { id: "ai_personalization", label: "AI personalization", price: 145 },
    { id: "ai_api_integration", label: "AI API integration", price: 90 },
    { id: "custom_ai_model", label: "Custom AI model integration", price: 235 },
    { id: "rag_knowledge_base", label: "RAG / knowledge base (remembers your documents)", price: 175 },
    { id: "vector_database", label: "Vector database", price: 90 },
    { id: "ai_moderation", label: "AI moderation", price: 90 },
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
  type: "single",
  options: [
    "Customer support", "Sales", "Lead generation", "Research", "Data analysis",
    "Personal assistant", "Business operations", "Content creation", "Scheduling",
    "Customer onboarding", "Internal company tasks", "Other",
  ].map((label) => ({ id: label.toLowerCase().replace(/\s+/g, "_"), label, price: 0 })),
};

const agentChannelsStep: CatalogueStep = {
  id: "agent_channels",
  question: "Where should the agent operate?",
  type: "multi",
  options: [
    { id: "channel_website", label: "Website", price: 45 },
    { id: "channel_whatsapp", label: "WhatsApp", price: 60 },
    { id: "channel_telegram", label: "Telegram", price: 45 },
    { id: "channel_discord", label: "Discord", price: 30 },
    { id: "channel_slack", label: "Slack", price: 30 },
    { id: "channel_email", label: "Email", price: 45 },
    { id: "channel_dashboard", label: "Internal dashboard", price: 60 },
    { id: "channel_api", label: "API", price: 45 },
  ],
};

const agentAccessStep: CatalogueStep = {
  id: "agent_access",
  question: "What should the agent be able to access?",
  type: "multi",
  options: [
    { id: "access_knowledge_base", label: "Knowledge base", price: 175 },
    { id: "access_database", label: "Your database", price: 90 },
    { id: "access_calendar", label: "Calendar", price: 45 },
    { id: "access_email", label: "Email", price: 45 },
    { id: "access_apis", label: "External APIs", price: 90 },
    { id: "access_web_search", label: "Internet / web search", price: 45 },
  ],
  optional: true,
};

const agentActionsStep: CatalogueStep = {
  id: "agent_actions",
  question: "What actions should it be able to take on its own?",
  type: "multi",
  options: [
    { id: "action_send_emails", label: "Send emails", price: 30 },
    { id: "action_create_records", label: "Create records", price: 30 },
    { id: "action_update_records", label: "Update records", price: 30 },
    { id: "action_search_db", label: "Search databases", price: 30 },
    { id: "action_book_appointments", label: "Book appointments", price: 45 },
    { id: "action_generate_documents", label: "Generate documents", price: 45 },
    { id: "action_api_requests", label: "Make API requests", price: 45 },
    { id: "action_notifications", label: "Send notifications", price: 30 },
    { id: "action_workflows", label: "Execute multi-step workflows", price: 90 },
  ],
  optional: true,
};

const agentIntelligenceStep: CatalogueStep = {
  id: "agent_intelligence",
  question: "How capable should it be?",
  type: "multi",
  options: [
    { id: "multi_agent", label: "Multiple agents working together", price: 350 },
    { id: "agent_memory", label: "Memory across conversations", price: 60 },
    { id: "custom_ai_workflow", label: "Custom AI workflow", price: 175 },
    { id: "vector_database_agent", label: "Vector database", price: 90 },
    { id: "human_approval", label: "Human approval before acting", price: 45 },
    { id: "scheduled_tasks", label: "Scheduled / autonomous tasks", price: 45 },
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
  type: "multi",
  options: [
    "Lead generation", "Customer onboarding", "Email", "WhatsApp", "Sales", "Payments",
    "Invoices", "CRM", "Data processing", "Reporting", "Internal workflows", "Social media",
  ].map((label) => ({ id: label.toLowerCase().replace(/\s+/g, "_"), label, price: 0 })),
};

const automationTriggerStep: CatalogueStep = {
  id: "automation_trigger",
  question: "What should start it?",
  type: "single",
  options: [
    "Form submission", "Payment", "New customer", "Email", "Schedule", "Database event", "Manual trigger",
  ].map((label) => ({ id: label.toLowerCase().replace(/\s+/g, "_"), label, price: 0 })),
};

const automationActionsStep: CatalogueStep = {
  id: "automation_actions",
  question: "What should happen when it runs?",
  type: "multi",
  options: [
    { id: "form_to_email", label: "Form → email", price: 25 },
    { id: "form_to_database", label: "Form → database", price: 30 },
    { id: "email_automation", label: "Automated email sequences", price: 45 },
    { id: "sms_automation", label: "SMS automation", price: 60 },
    { id: "whatsapp_automation", label: "WhatsApp automation", price: 90 },
    { id: "onboarding_automation", label: "Customer onboarding automation", price: 60 },
    { id: "invoice_automation", label: "Invoice automation", price: 45 },
    { id: "payment_automation", label: "Payment automation", price: 60 },
    { id: "crm_automation", label: "CRM automation", price: 90 },
    { id: "lead_automation", label: "Lead automation", price: 75 },
    { id: "workflow_automation", label: "Multi-step workflow automation", price: 90 },
    { id: "scheduled_tasks_automation", label: "Scheduled tasks", price: 45 },
    { id: "third_party_automation", label: "Third-party tool automation", price: 60 },
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
  helper: "No client-facing pages here — this is infrastructure.",
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
  type: "multi",
  options: [
    { id: "logo_design", label: "Logo design", price: 45 },
    { id: "logo_redesign", label: "Logo redesign", price: 30 },
    { id: "brand_colors", label: "Brand colors", price: 18 },
    { id: "typography_system", label: "Typography system", price: 18 },
    { id: "brand_guidelines", label: "Brand guidelines", price: 60 },
    { id: "business_card", label: "Business card", price: 18 },
    { id: "social_kit", label: "Social media kit", price: 45 },
    { id: "brand_assets", label: "Brand assets pack", price: 60 },
    { id: "packaging_design", label: "Packaging design", price: 45 },
    { id: "full_identity", label: "Full visual identity", price: 145, description: "Everything above, bundled." },
  ],
};

const brandingStyleStep: CatalogueStep = {
  id: "branding_style",
  question: "What style are you going for?",
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
  type: "multi",
  options: [
    { id: "technical_seo", label: "Technical SEO", price: 60 },
    { id: "keyword_research", label: "Keyword research", price: 45 },
    { id: "on_page_seo", label: "On-page SEO", price: 45 },
    { id: "schema_markup", label: "Schema markup", price: 30 },
    { id: "gsc_setup", label: "Google Search Console setup", price: 18 },
    { id: "analytics_setup", label: "Analytics setup", price: 18 },
    { id: "seo_content", label: "SEO content (per article)", price: 20, unit: "per_article" },
    { id: "blog_setup", label: "Blog setup", price: 30 },
    { id: "social_integration", label: "Social media integration", price: 25 },
    { id: "email_marketing_setup", label: "Email marketing setup", price: 45 },
    { id: "newsletter_system", label: "Newsletter system", price: 45 },
    { id: "lead_gen_system", label: "Lead-generation system", price: 60 },
    { id: "conversion_optimization", label: "Conversion optimization", price: 60 },
    { id: "marketing_automation", label: "Marketing automation", price: 90 },
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
