import type { CatalogueStep } from "@zebraish/lib/catalogue/types";

// Shared, reusable steps referenced by multiple flows. Curated from the Zebraish pricing
// catalogue — grouped by category, only wired into the flows where they're relevant so a
// client is never shown an option that doesn't apply to what they're building.

export const designStep: CatalogueStep = {
  id: "design",
  question: "How should it look?",
  helper: "A standard design system is included — pick anything beyond that.",
  type: "multi",
  options: [
    { id: "custom_ui", label: "Custom UI design", price: 60 },
    { id: "premium_ui", label: "Premium UI/UX", price: 90 },
    { id: "figma_first", label: "Design mockups before development (Figma)", price: 60 },
    { id: "custom_typography", label: "Custom typography", price: 18 },
    { id: "custom_color", label: "Custom color system", price: 15 },
    { id: "custom_icons", label: "Custom iconography", price: 25 },
    { id: "custom_illustrations", label: "Custom illustrations", price: 30 },
    { id: "custom_graphics", label: "Custom graphics", price: 25 },
    { id: "custom_3d", label: "Custom 3D elements", price: 60 },
    { id: "interactive_ui", label: "Interactive UI", price: 60 },
    { id: "micro_interactions", label: "Advanced micro-interactions", price: 45 },
    { id: "parallax", label: "Parallax effects", price: 25 },
    { id: "scroll_animations", label: "Scroll animations", price: 30 },
    { id: "page_transitions", label: "Page transition animations", price: 30 },
    { id: "custom_animation", label: "Custom animation", price: 60 },
    { id: "video_backgrounds", label: "Video backgrounds", price: 30 },
    { id: "advanced_visual_effects", label: "Advanced visual effects", price: 60 },
    { id: "accessibility", label: "Accessibility optimization", price: 45 },
  ],
  optional: true,
};

export const websiteFunctionalityStep: CatalogueStep = {
  id: "website_functionality",
  question: "What should it do?",
  type: "multi",
  options: [
    { id: "contact_form", label: "Contact form", price: 12 },
    { id: "newsletter", label: "Newsletter signup", price: 15 },
    { id: "search", label: "Search", price: 25 },
    { id: "advanced_search", label: "Advanced search / filtering", price: 45 },
    { id: "user_accounts", label: "User accounts", price: 60 },
    { id: "user_dashboard", label: "User dashboard", price: 90 },
    { id: "notifications", label: "Notifications", price: 45 },
    { id: "favorites", label: "Favorites / wishlist", price: 30 },
    { id: "reviews", label: "Reviews / ratings", price: 35 },
    { id: "file_upload", label: "File upload", price: 30 },
    { id: "booking", label: "Booking system", price: 60 },
    { id: "appointments", label: "Appointment scheduling", price: 60 },
    { id: "membership", label: "Membership system", price: 90 },
    { id: "subscriptions", label: "Subscription system", price: 90 },
    { id: "coupons", label: "Coupon / discount system", price: 30 },
    { id: "loyalty", label: "Loyalty / rewards system", price: 90 },
  ],
  optional: true,
};

export const ecommerceStep: CatalogueStep = {
  id: "ecommerce",
  question: "What should your store handle?",
  helper: "Product catalog, cart, checkout, and basic payment are already included in an e-commerce base.",
  type: "multi",
  options: [
    { id: "product_variants", label: "Product variants (size, color, etc.)", price: 30 },
    { id: "product_filtering", label: "Product filtering", price: 30 },
    { id: "multiple_payment_methods", label: "Multiple payment methods", price: 30 },
    { id: "discount_codes", label: "Discount codes", price: 30 },
    { id: "tax_calculation", label: "Automatic tax calculation", price: 30 },
    { id: "shipping_calculation", label: "Shipping calculation", price: 45 },
    { id: "order_tracking", label: "Order tracking", price: 45 },
    { id: "wishlist", label: "Wishlist", price: 30 },
    { id: "product_reviews", label: "Product reviews", price: 30 },
    { id: "inventory_management", label: "Inventory management", price: 60 },
    { id: "stock_alerts", label: "Stock alerts", price: 25 },
    { id: "abandoned_cart", label: "Abandoned-cart recovery", price: 45 },
    { id: "product_recommendations", label: "Product recommendations", price: 60 },
    { id: "subscription_products", label: "Subscription products", price: 60 },
    { id: "digital_products", label: "Digital products", price: 45 },
  ],
  optional: true,
};

export const cmsAdminStep: CatalogueStep = {
  id: "cms_admin",
  question: "Do you need a way to manage content or the business yourself?",
  type: "multi",
  options: [
    { id: "basic_cms", label: "Basic content management", price: 60 },
    { id: "admin_dashboard", label: "Admin dashboard", price: 90 },
    { id: "custom_admin_dashboard", label: "Custom-built admin dashboard", price: 145 },
    { id: "user_management", label: "User management", price: 60 },
    { id: "order_management", label: "Order management", price: 60 },
    { id: "customer_management", label: "Customer management", price: 60 },
    { id: "analytics_dashboard", label: "Analytics dashboard", price: 75 },
    { id: "role_permissions", label: "Different permissions for different users", price: 60 },
    { id: "multiple_admin_accounts", label: "Multiple admin accounts", price: 30 },
    { id: "activity_logs", label: "Activity logs", price: 45 },
    { id: "automated_reports", label: "Automated reports", price: 60 },
    { id: "export_data", label: "Export data", price: 25 },
    { id: "import_data", label: "Import data", price: 30 },
  ],
  optional: true,
};

export const backendStep: CatalogueStep = {
  id: "backend",
  question: "Any backend requirements?",
  type: "multi",
  options: [
    { id: "custom_database", label: "Custom database architecture", price: 90 },
    { id: "rest_api", label: "REST API", price: 90 },
    { id: "graphql_api", label: "GraphQL API", price: 120 },
    { id: "webhooks", label: "Webhooks", price: 45 },
    { id: "realtime", label: "Real-time functionality", price: 90 },
    { id: "file_storage", label: "File storage", price: 45 },
    { id: "background_jobs", label: "Background jobs", price: 60 },
    { id: "automated_processing", label: "Automated processing", price: 75 },
    { id: "advanced_backend_logic", label: "Advanced backend logic", price: 120 },
  ],
  optional: true,
};

export const authSecurityStep: CatalogueStep = {
  id: "auth_security",
  question: "How should people log in, and how secure should it be?",
  type: "multi",
  options: [
    { id: "email_auth", label: "Email + password login", price: 30 },
    { id: "google_login", label: "Google login", price: 30 },
    { id: "apple_login", label: "Apple login", price: 45 },
    { id: "social_login", label: "Other social login", price: 30 },
    { id: "two_factor", label: "Two-factor authentication", price: 45 },
    { id: "otp", label: "OTP verification", price: 30 },
    { id: "phone_verification", label: "Phone verification", price: 30 },
    { id: "role_based_access", label: "Role-based access", price: 45 },
    { id: "advanced_security", label: "Advanced security configuration", price: 60 },
    { id: "security_audit", label: "Security audit", price: 90 },
  ],
  optional: true,
};

export const paymentsStep: CatalogueStep = {
  id: "payments",
  question: "How should people pay?",
  type: "multi",
  options: [
    { id: "payment_gateway_integration", label: "Payment integration", price: 45 },
    { id: "card_payments", label: "Card payments", price: 30 },
    { id: "bank_transfer", label: "Bank transfer", price: 25 },
    { id: "mobile_money", label: "Mobile money", price: 30 },
    { id: "multiple_currencies", label: "Multiple currencies", price: 60 },
    { id: "recurring_payments", label: "Recurring / subscription billing", price: 75 },
    { id: "automatic_invoices", label: "Automatic invoices", price: 30 },
    { id: "payment_receipts", label: "Payment receipts", price: 18 },
    { id: "refund_system", label: "Refund system", price: 30 },
    { id: "split_payments", label: "Split payments", price: 60 },
    { id: "marketplace_payments", label: "Marketplace payments (pay out multiple parties)", price: 120 },
  ],
  optional: true,
};

export const integrationsStep: CatalogueStep = {
  id: "integrations",
  question: "Anything this should connect to?",
  type: "multi",
  options: [
    { id: "google_services", label: "Google services", price: 30 },
    { id: "google_maps", label: "Google Maps", price: 30 },
    { id: "google_analytics", label: "Google Analytics", price: 18 },
    { id: "meta_instagram", label: "Meta / Instagram", price: 45 },
    { id: "tiktok", label: "TikTok", price: 45 },
    { id: "whatsapp_integration", label: "WhatsApp", price: 60 },
    { id: "mailchimp", label: "Mailchimp", price: 30 },
    { id: "hubspot", label: "HubSpot", price: 60 },
    { id: "salesforce", label: "Salesforce", price: 90 },
    { id: "slack", label: "Slack", price: 30 },
    { id: "custom_api_integration", label: "Custom API", price: 90 },
  ],
  optional: true,
};

export const revisionsStep: CatalogueStep = {
  id: "revisions",
  question: "How many rounds of revisions do you want?",
  helper: "2 rounds are included.",
  type: "single",
  options: [
    { id: "included", label: "2 rounds (included)", price: 0, included: true },
    { id: "three", label: "3 rounds", price: 30 },
    { id: "four", label: "4 rounds", price: 45 },
    { id: "five", label: "5 rounds", price: 60 },
  ],
  optional: true,
};

export const complexityStep: CatalogueStep = {
  id: "complexity",
  question: "How complex is this, realistically?",
  helper: "This adjusts the whole project price to reflect the extra work.",
  type: "single",
  role: "multiplier",
  options: [
    { id: "standard", label: "Standard — normal functionality", multiplier: 1.0 },
    { id: "advanced", label: "Advanced — more custom UI, logic, or integrations", multiplier: 1.2 },
    { id: "complex", label: "Complex — substantial custom functionality, multiple integrations", multiplier: 1.4 },
  ],
};

export const deliveryStep: CatalogueStep = {
  id: "delivery",
  question: "How quickly do you need it?",
  type: "single",
  role: "multiplier",
  options: [
    { id: "standard", label: "Standard", multiplier: 1.0 },
    { id: "priority", label: "Priority (+15%)", multiplier: 1.15 },
    { id: "rush", label: "Rush (+30%)", multiplier: 1.3 },
    { id: "emergency", label: "Emergency (+50%)", multiplier: 1.5 },
  ],
};

export const hostingStep: CatalogueStep = {
  id: "hosting",
  question: "Do you need hosting and infrastructure set up?",
  type: "multi",
  options: [
    { id: "hosting_setup", label: "Hosting setup", price: 30 },
    { id: "domain_setup", label: "Domain setup", price: 12 },
    { id: "cdn_setup", label: "CDN setup", price: 30 },
    { id: "database_hosting", label: "Database hosting setup", price: 30 },
    { id: "file_storage_setup", label: "File storage setup", price: 25 },
    { id: "email_service_setup", label: "Email service setup", price: 25 },
    { id: "monitoring", label: "Monitoring", price: 30 },
    { id: "backup_system", label: "Backup system", price: 45 },
    { id: "production_deployment", label: "Production deployment", price: 30 },
  ],
  optional: true,
};

export const maintenanceStep: CatalogueStep = {
  id: "maintenance",
  question: "Want ongoing support after launch?",
  helper: "30 days of post-launch support is included either way.",
  type: "single",
  options: [
    { id: "none", label: "Just the 30-day post-launch support (included)", price: 0, included: true },
    { id: "monthly", label: "Monthly maintenance — €30/month", price: 30, unit: "per_month" },
    { id: "full", label: "Full maintenance package — €90/month", price: 90, unit: "per_month" },
  ],
  optional: true,
};

export const contentStep: CatalogueStep = {
  id: "content",
  question: "Do you need us to write or produce content too?",
  type: "multi",
  options: [
    { id: "copywriting", label: "Copywriting", price: 45 },
    { id: "website_copy", label: "Website copy", price: 45 },
    { id: "image_sourcing", label: "Image sourcing", price: 18 },
    { id: "video_editing", label: "Video editing", price: 30 },
    { id: "promo_video", label: "Promotional video", price: 60 },
  ],
  optional: true,
};

export const customNoteStep: CatalogueStep = {
  id: "custom_note",
  question: "Anything else we should know?",
  helper: "Optional. If it doesn't fit the options above, describe it and we'll follow up with a custom quote.",
  type: "text",
  role: "note",
  optional: true,
};
