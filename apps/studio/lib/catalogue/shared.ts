import type { CatalogueStep } from "@zebraish/lib/catalogue/types";

// Shared, reusable steps referenced by multiple flows. Curated from the Zebraish pricing
// catalogue — grouped by category, only wired into the flows where they're relevant so a
// client is never shown an option that doesn't apply to what they're building.

export const designStep: CatalogueStep = {
  id: "design",
  question: "How should it look?",
  questionEs: "¿Cómo debería verse?",
  helper: "A standard design system is included, pick anything beyond that.",
  helperEs: "Incluye un sistema de diseño estándar, elige lo que quieras añadir además.",
  type: "multi",
  options: [
    { id: "custom_ui", label: "Custom UI design", labelEs: "Diseño de interfaz a medida", price: 60 },
    { id: "premium_ui", label: "Premium UI/UX", labelEs: "UI/UX premium", price: 90 },
    { id: "figma_first", label: "Design mockups before development (Figma)", labelEs: "Maquetas de diseño antes del desarrollo (Figma)", price: 60 },
    { id: "custom_typography", label: "Custom typography", labelEs: "Tipografía a medida", price: 18 },
    { id: "custom_color", label: "Custom color system", labelEs: "Sistema de color a medida", price: 15 },
    { id: "custom_icons", label: "Custom iconography", labelEs: "Iconografía a medida", price: 25 },
    { id: "custom_illustrations", label: "Custom illustrations", labelEs: "Ilustraciones a medida", price: 30 },
    { id: "custom_graphics", label: "Custom graphics", labelEs: "Gráficos a medida", price: 25 },
    { id: "custom_3d", label: "Custom 3D elements", labelEs: "Elementos 3D a medida", price: 60 },
    { id: "interactive_ui", label: "Interactive UI", labelEs: "Interfaz interactiva", price: 60 },
    { id: "micro_interactions", label: "Advanced micro-interactions", labelEs: "Micro-interacciones avanzadas", price: 45 },
    { id: "parallax", label: "Parallax effects", labelEs: "Efectos parallax", price: 25 },
    { id: "scroll_animations", label: "Scroll animations", labelEs: "Animaciones al hacer scroll", price: 30 },
    { id: "page_transitions", label: "Page transition animations", labelEs: "Animaciones de transición entre páginas", price: 30 },
    { id: "custom_animation", label: "Custom animation", labelEs: "Animación a medida", price: 60 },
    { id: "video_backgrounds", label: "Video backgrounds", labelEs: "Fondos de vídeo", price: 30 },
    { id: "advanced_visual_effects", label: "Advanced visual effects", labelEs: "Efectos visuales avanzados", price: 60 },
    { id: "accessibility", label: "Accessibility optimization", labelEs: "Optimización de accesibilidad", price: 45 },
  ],
  optional: true,
};

export const websiteFunctionalityStep: CatalogueStep = {
  id: "website_functionality",
  question: "What should it do?",
  questionEs: "¿Qué debería hacer?",
  type: "multi",
  options: [
    { id: "contact_form", label: "Contact form", labelEs: "Formulario de contacto", price: 12 },
    { id: "newsletter", label: "Newsletter signup", labelEs: "Suscripción a newsletter", price: 15 },
    { id: "search", label: "Search", labelEs: "Buscador", price: 25 },
    { id: "advanced_search", label: "Advanced search / filtering", labelEs: "Búsqueda avanzada / filtros", price: 45 },
    { id: "user_accounts", label: "User accounts", labelEs: "Cuentas de usuario", price: 60 },
    { id: "user_dashboard", label: "User dashboard", labelEs: "Panel de usuario", price: 90 },
    { id: "notifications", label: "Notifications", labelEs: "Notificaciones", price: 45 },
    { id: "favorites", label: "Favorites / wishlist", labelEs: "Favoritos / lista de deseos", price: 30 },
    { id: "reviews", label: "Reviews / ratings", labelEs: "Reseñas / valoraciones", price: 35 },
    { id: "file_upload", label: "File upload", labelEs: "Subida de archivos", price: 30 },
    { id: "booking", label: "Booking system", labelEs: "Sistema de reservas", price: 60 },
    { id: "appointments", label: "Appointment scheduling", labelEs: "Agenda de citas", price: 60 },
    { id: "membership", label: "Membership system", labelEs: "Sistema de membresías", price: 90 },
    { id: "subscriptions", label: "Subscription system", labelEs: "Sistema de suscripciones", price: 90 },
    { id: "coupons", label: "Coupon / discount system", labelEs: "Sistema de cupones / descuentos", price: 30 },
    { id: "loyalty", label: "Loyalty / rewards system", labelEs: "Sistema de fidelización / recompensas", price: 90 },
  ],
  optional: true,
};

export const ecommerceStep: CatalogueStep = {
  id: "ecommerce",
  question: "What should your store handle?",
  questionEs: "¿Qué debería incluir tu tienda?",
  helper: "Product catalog, cart, checkout, and basic payment are already included in an e-commerce base.",
  helperEs: "El catálogo de productos, carrito, checkout y pago básico ya están incluidos en la base de e-commerce.",
  type: "multi",
  options: [
    { id: "product_variants", label: "Product variants (size, color, etc.)", labelEs: "Variantes de producto (talla, color, etc.)", price: 30 },
    { id: "product_filtering", label: "Product filtering", labelEs: "Filtrado de productos", price: 30 },
    { id: "multiple_payment_methods", label: "Multiple payment methods", labelEs: "Múltiples métodos de pago", price: 30 },
    { id: "discount_codes", label: "Discount codes", labelEs: "Códigos de descuento", price: 30 },
    { id: "tax_calculation", label: "Automatic tax calculation", labelEs: "Cálculo automático de impuestos", price: 30 },
    { id: "shipping_calculation", label: "Shipping calculation", labelEs: "Cálculo de envío", price: 45 },
    { id: "order_tracking", label: "Order tracking", labelEs: "Seguimiento de pedidos", price: 45 },
    { id: "wishlist", label: "Wishlist", labelEs: "Lista de deseos", price: 30 },
    { id: "product_reviews", label: "Product reviews", labelEs: "Reseñas de productos", price: 30 },
    { id: "inventory_management", label: "Inventory management", labelEs: "Gestión de inventario", price: 60 },
    { id: "stock_alerts", label: "Stock alerts", labelEs: "Alertas de stock", price: 25 },
    { id: "abandoned_cart", label: "Abandoned-cart recovery", labelEs: "Recuperación de carritos abandonados", price: 45 },
    { id: "product_recommendations", label: "Product recommendations", labelEs: "Recomendaciones de productos", price: 60 },
    { id: "subscription_products", label: "Subscription products", labelEs: "Productos por suscripción", price: 60 },
    { id: "digital_products", label: "Digital products", labelEs: "Productos digitales", price: 45 },
  ],
  optional: true,
};

export const cmsAdminStep: CatalogueStep = {
  id: "cms_admin",
  question: "Do you need a way to manage content or the business yourself?",
  questionEs: "¿Necesitas una forma de gestionar el contenido o el negocio tú mismo?",
  type: "multi",
  options: [
    { id: "basic_cms", label: "Basic content management", labelEs: "Gestión de contenido básica", price: 60 },
    { id: "admin_dashboard", label: "Admin dashboard", labelEs: "Panel de administración", price: 90 },
    { id: "custom_admin_dashboard", label: "Custom-built admin dashboard", labelEs: "Panel de administración a medida", price: 145 },
    { id: "user_management", label: "User management", labelEs: "Gestión de usuarios", price: 60 },
    { id: "order_management", label: "Order management", labelEs: "Gestión de pedidos", price: 60 },
    { id: "customer_management", label: "Customer management", labelEs: "Gestión de clientes", price: 60 },
    { id: "analytics_dashboard", label: "Analytics dashboard", labelEs: "Panel de analítica", price: 75 },
    { id: "role_permissions", label: "Different permissions for different users", labelEs: "Permisos distintos según el usuario", price: 60 },
    { id: "multiple_admin_accounts", label: "Multiple admin accounts", labelEs: "Múltiples cuentas de administrador", price: 30 },
    { id: "activity_logs", label: "Activity logs", labelEs: "Registro de actividad", price: 45 },
    { id: "automated_reports", label: "Automated reports", labelEs: "Informes automáticos", price: 60 },
    { id: "export_data", label: "Export data", labelEs: "Exportar datos", price: 25 },
    { id: "import_data", label: "Import data", labelEs: "Importar datos", price: 30 },
  ],
  optional: true,
};

export const backendStep: CatalogueStep = {
  id: "backend",
  question: "Any backend requirements?",
  questionEs: "¿Algún requisito de backend?",
  type: "multi",
  options: [
    { id: "custom_database", label: "Custom database architecture", labelEs: "Arquitectura de base de datos a medida", price: 90 },
    { id: "rest_api", label: "REST API", labelEs: "API REST", price: 90 },
    { id: "graphql_api", label: "GraphQL API", labelEs: "API GraphQL", price: 120 },
    { id: "webhooks", label: "Webhooks", labelEs: "Webhooks", price: 45 },
    { id: "realtime", label: "Real-time functionality", labelEs: "Funcionalidad en tiempo real", price: 90 },
    { id: "file_storage", label: "File storage", labelEs: "Almacenamiento de archivos", price: 45 },
    { id: "background_jobs", label: "Background jobs", labelEs: "Tareas en segundo plano", price: 60 },
    { id: "automated_processing", label: "Automated processing", labelEs: "Procesamiento automatizado", price: 75 },
    { id: "advanced_backend_logic", label: "Advanced backend logic", labelEs: "Lógica de backend avanzada", price: 120 },
  ],
  optional: true,
};

export const authSecurityStep: CatalogueStep = {
  id: "auth_security",
  question: "How should people log in, and how secure should it be?",
  questionEs: "¿Cómo debería iniciar sesión la gente, y cuánta seguridad necesitas?",
  type: "multi",
  options: [
    { id: "email_auth", label: "Email + password login", labelEs: "Inicio de sesión con correo y contraseña", price: 30 },
    { id: "google_login", label: "Google login", labelEs: "Inicio de sesión con Google", price: 30 },
    { id: "apple_login", label: "Apple login", labelEs: "Inicio de sesión con Apple", price: 45 },
    { id: "social_login", label: "Other social login", labelEs: "Otro inicio de sesión social", price: 30 },
    { id: "two_factor", label: "Two-factor authentication", labelEs: "Autenticación de dos factores", price: 45 },
    { id: "otp", label: "OTP verification", labelEs: "Verificación por código OTP", price: 30 },
    { id: "phone_verification", label: "Phone verification", labelEs: "Verificación por teléfono", price: 30 },
    { id: "role_based_access", label: "Role-based access", labelEs: "Acceso según rol", price: 45 },
    { id: "advanced_security", label: "Advanced security configuration", labelEs: "Configuración de seguridad avanzada", price: 60 },
    { id: "security_audit", label: "Security audit", labelEs: "Auditoría de seguridad", price: 90 },
  ],
  optional: true,
};

export const paymentsStep: CatalogueStep = {
  id: "payments",
  question: "How should people pay?",
  questionEs: "¿Cómo debería pagar la gente?",
  type: "multi",
  options: [
    { id: "payment_gateway_integration", label: "Payment integration", labelEs: "Integración de pagos", price: 45 },
    { id: "card_payments", label: "Card payments", labelEs: "Pagos con tarjeta", price: 30 },
    { id: "bank_transfer", label: "Bank transfer", labelEs: "Transferencia bancaria", price: 25 },
    { id: "mobile_money", label: "Mobile money", labelEs: "Dinero móvil", price: 30 },
    { id: "multiple_currencies", label: "Multiple currencies", labelEs: "Varias divisas", price: 60 },
    { id: "recurring_payments", label: "Recurring / subscription billing", labelEs: "Facturación recurrente / por suscripción", price: 75 },
    { id: "automatic_invoices", label: "Automatic invoices", labelEs: "Facturas automáticas", price: 30 },
    { id: "payment_receipts", label: "Payment receipts", labelEs: "Recibos de pago", price: 18 },
    { id: "refund_system", label: "Refund system", labelEs: "Sistema de reembolsos", price: 30 },
    { id: "split_payments", label: "Split payments", labelEs: "Pagos divididos", price: 60 },
    { id: "marketplace_payments", label: "Marketplace payments (pay out multiple parties)", labelEs: "Pagos de marketplace (pagar a varias partes)", price: 120 },
  ],
  optional: true,
};

export const integrationsStep: CatalogueStep = {
  id: "integrations",
  question: "Anything this should connect to?",
  questionEs: "¿Con qué debería conectarse?",
  type: "multi",
  options: [
    { id: "google_services", label: "Google services", labelEs: "Servicios de Google", price: 30 },
    { id: "google_maps", label: "Google Maps", labelEs: "Google Maps", price: 30 },
    { id: "google_analytics", label: "Google Analytics", labelEs: "Google Analytics", price: 18 },
    { id: "meta_instagram", label: "Meta / Instagram", labelEs: "Meta / Instagram", price: 45 },
    { id: "tiktok", label: "TikTok", labelEs: "TikTok", price: 45 },
    { id: "whatsapp_integration", label: "WhatsApp", labelEs: "WhatsApp", price: 60 },
    { id: "mailchimp", label: "Mailchimp", labelEs: "Mailchimp", price: 30 },
    { id: "hubspot", label: "HubSpot", labelEs: "HubSpot", price: 60 },
    { id: "salesforce", label: "Salesforce", labelEs: "Salesforce", price: 90 },
    { id: "slack", label: "Slack", labelEs: "Slack", price: 30 },
    { id: "custom_api_integration", label: "Custom API", labelEs: "API a medida", price: 90 },
  ],
  optional: true,
};

export const revisionsStep: CatalogueStep = {
  id: "revisions",
  question: "How many rounds of revisions do you want?",
  questionEs: "¿Cuántas rondas de revisiones quieres?",
  helper: "2 rounds are included.",
  helperEs: "Incluye 2 rondas.",
  type: "single",
  options: [
    { id: "included", label: "2 rounds (included)", labelEs: "2 rondas (incluidas)", price: 0, included: true },
    { id: "three", label: "3 rounds", labelEs: "3 rondas", price: 30 },
    { id: "four", label: "4 rounds", labelEs: "4 rondas", price: 45 },
    { id: "five", label: "5 rounds", labelEs: "5 rondas", price: 60 },
  ],
  optional: true,
};

export const complexityStep: CatalogueStep = {
  id: "complexity",
  question: "How complex is this, realistically?",
  questionEs: "¿Qué tan complejo es esto, realmente?",
  helper: "This adjusts the whole project price to reflect the extra work.",
  helperEs: "Esto ajusta el precio total del proyecto para reflejar el trabajo extra.",
  type: "single",
  role: "multiplier",
  options: [
    { id: "standard", label: "Standard: normal functionality", labelEs: "Estándar: funcionalidad normal", multiplier: 1.0 },
    { id: "advanced", label: "Advanced: more custom UI, logic, or integrations", labelEs: "Avanzado: más interfaz, lógica o integraciones a medida", multiplier: 1.2 },
    { id: "complex", label: "Complex: substantial custom functionality, multiple integrations", labelEs: "Complejo: funcionalidad a medida considerable, múltiples integraciones", multiplier: 1.4 },
  ],
};

export const deliveryStep: CatalogueStep = {
  id: "delivery",
  question: "How quickly do you need it?",
  questionEs: "¿Con qué rapidez lo necesitas?",
  type: "single",
  role: "multiplier",
  options: [
    { id: "standard", label: "Standard", labelEs: "Estándar", multiplier: 1.0 },
    { id: "priority", label: "Priority (+15%)", labelEs: "Prioritario (+15%)", multiplier: 1.15 },
    { id: "rush", label: "Rush (+30%)", labelEs: "Urgente (+30%)", multiplier: 1.3 },
    { id: "emergency", label: "Emergency (+50%)", labelEs: "Emergencia (+50%)", multiplier: 1.5 },
  ],
};

export const hostingStep: CatalogueStep = {
  id: "hosting",
  question: "Do you need hosting and infrastructure set up?",
  questionEs: "¿Necesitas que configuremos el hosting y la infraestructura?",
  type: "multi",
  options: [
    { id: "hosting_setup", label: "Hosting setup", labelEs: "Configuración de hosting", price: 30 },
    { id: "domain_setup", label: "Domain setup", labelEs: "Configuración de dominio", price: 12 },
    { id: "cdn_setup", label: "CDN setup", labelEs: "Configuración de CDN", price: 30 },
    { id: "database_hosting", label: "Database hosting setup", labelEs: "Configuración de hosting de base de datos", price: 30 },
    { id: "file_storage_setup", label: "File storage setup", labelEs: "Configuración de almacenamiento de archivos", price: 25 },
    { id: "email_service_setup", label: "Email service setup", labelEs: "Configuración de servicio de correo", price: 25 },
    { id: "monitoring", label: "Monitoring", labelEs: "Monitorización", price: 30 },
    { id: "backup_system", label: "Backup system", labelEs: "Sistema de copias de seguridad", price: 45 },
    { id: "production_deployment", label: "Production deployment", labelEs: "Despliegue a producción", price: 30 },
  ],
  optional: true,
};

export const maintenanceStep: CatalogueStep = {
  id: "maintenance",
  question: "Want ongoing support after launch?",
  questionEs: "¿Quieres soporte continuo tras el lanzamiento?",
  helper: "30 days of post-launch support is included either way.",
  helperEs: "En cualquier caso, incluye 30 días de soporte tras el lanzamiento.",
  type: "single",
  options: [
    { id: "none", label: "Just the 30-day post-launch support (included)", labelEs: "Solo los 30 días de soporte post-lanzamiento (incluido)", price: 0, included: true },
    { id: "monthly", label: "Monthly maintenance: €30/month", labelEs: "Mantenimiento mensual: 30 €/mes", price: 30, unit: "per_month" },
    { id: "full", label: "Full maintenance package: €90/month", labelEs: "Paquete de mantenimiento completo: 90 €/mes", price: 90, unit: "per_month" },
  ],
  optional: true,
};

export const contentStep: CatalogueStep = {
  id: "content",
  question: "Do you need us to write or produce content too?",
  questionEs: "¿Necesitas que también redactemos o produzcamos contenido?",
  type: "multi",
  options: [
    { id: "copywriting", label: "Copywriting", labelEs: "Redacción publicitaria", price: 45 },
    { id: "website_copy", label: "Website copy", labelEs: "Textos para el sitio web", price: 45 },
    { id: "image_sourcing", label: "Image sourcing", labelEs: "Búsqueda de imágenes", price: 18 },
    { id: "video_editing", label: "Video editing", labelEs: "Edición de vídeo", price: 30 },
    { id: "promo_video", label: "Promotional video", labelEs: "Vídeo promocional", price: 60 },
  ],
  optional: true,
};

export const customNoteStep: CatalogueStep = {
  id: "custom_note",
  question: "Anything else we should know?",
  questionEs: "¿Algo más que deberíamos saber?",
  helper: "Optional. If it doesn't fit the options above, describe it and we'll follow up with a custom quote.",
  helperEs: "Opcional. Si no encaja en las opciones anteriores, descríbelo y te enviaremos un presupuesto personalizado.",
  type: "text",
  role: "note",
  optional: true,
};
