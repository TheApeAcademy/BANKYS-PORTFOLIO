export type Lang = "es" | "en";

export const LANG_COOKIE = "zb_lang";
export const DEFAULT_LANG: Lang = "es";

// Flat key/value dictionaries. Values may contain {placeholder} tokens filled
// in by t() at call sites. Keep `en` and `es` key sets identical — a missing
// `es` key would silently fall back to English via the lookup in
// LanguageProvider, which is deliberate (never show a raw key to a user).
const en = {
  // Configurator — done screen
  "config.done.title": "You're set, {name}.",
  "config.done.reference": "Your project reference:",
  "config.done.saveLink.title": "Save your tracking link",
  "config.done.saveLink.body":
    "This is the only way back into your project, so use it to check progress, pay, or message us. We've also included it in the WhatsApp message below.",
  "config.done.copy": "Copy",
  "config.done.copied": "Copied",
  "config.done.whatsappNote":
    "WhatsApp should have opened with your project details and this link. Send it across and we'll pick up the conversation from there.",
  "config.done.payNow": "Pay now: {amount}",
  "config.done.chatWhatsapp": "Chat on WhatsApp →",
  "config.done.bookmark": "Bookmark this page so you can come back anytime to review, edit, or pay later.",

  // Configurator — type picker
  "config.type.title": "What are you building?",
  "config.type.subtitle": "Pick one to see the questions that actually matter.",

  // Configurator — steps
  "config.steps.back": "← Back",
  "config.steps.next": "Next →",
  "config.steps.review": "Review →",

  // Configurator — details/review
  "config.details.title": "Your project",
  "config.details.subtitle": "Here's everything you selected.",
  "config.details.complexityAdjustment": "Complexity adjustment",
  "config.details.deliveryAdjustment": "Delivery speed adjustment",
  "config.details.total": "Total",
  "config.details.customQuoteNote":
    "You added a note we'll need to review manually. We'll follow up with a final quote before anything's charged.",
  "config.details.yourName": "Your name",
  "config.details.howReach": "How should we reach you?",
  "config.details.contactEmail": "Email",
  "config.details.contactPhone": "Phone / WhatsApp",
  "config.details.continue": "Continue →",
  "config.details.saving": "Saving…",
  "config.details.edit": "← Edit",
  "config.details.errorRequired": "Please enter your name and a way to reach you.",
  "config.details.errorNetwork":
    "Couldn't reach the server to save your project ({message}). Check your connection and try again. Nothing was lost.",

  // WhatsApp draft message
  "wa.greeting": "Hi Zebraish! I just configured a project.",
  "wa.reference": "*Reference:*",
  "wa.building": "*Building:*",
  "wa.total": "*Total:*",
  "wa.trackingLink": "My tracking link:",

  // Payment method selector
  "pay.method.card": "Card",
  "pay.method.cardHelper": "Pay securely with your card",
  "pay.method.bankTransfer": "Bank Transfer",
  "pay.method.bankTransferHelper": "Transfer directly using your bank's app",
  "pay.method.bankCharge": "Pay with Bank",
  "pay.method.bankChargeHelper": "Authorize instantly from your own bank (Spain/EU/UK)",
  "pay.method.changeMethod": "← Choose a different method",

  // Card checkout
  "pay.card.needsEmail": "Card payment needs an email for your receipt.",
  "pay.card.emailPlaceholder": "you@example.com",
  "pay.card.redirecting": "Redirecting to payment…",

  // Pay with Bank (Flutterwave, automated)
  "pay.bankCharge.needsContact": "We need both an email and a phone number to verify your bank payment.",
  "pay.bankCharge.emailPlaceholder": "you@example.com",
  "pay.bankCharge.phonePlaceholder": "Phone number",
  "pay.bankCharge.redirecting": "Redirecting to your bank…",

  // Bank transfer panel
  "pay.bank.settingUp": "Setting up your transfer…",
  "pay.bank.genericError": "Could not start a bank transfer.",
  "pay.bank.notSetUp":
    "Bank transfer isn't set up for {currency} yet. Choose Card instead, or reach out on WhatsApp and we'll sort it out directly.",
  "pay.bank.instructionsTitle": "Transfer instructions",
  "pay.bank.beneficiary": "Beneficiary",
  "pay.bank.amount": "Amount",
  "pay.bank.reference": "Reference",
  "pay.bank.footnote":
    "Include the reference above in your transfer so we can match it. We'll confirm and update your project once we see it arrive. This can take longer for international transfers.",

  // Pay page
  "pay.page.alreadyPaid": "This project has already been paid. Thank you.",

  // Start page
  "start.logoLabel": "Start a Project",
  "start.paymentFailed": "That payment didn't go through. You can try again below.",
  "start.paymentReceived": "Payment received, thank you! We'll be in touch shortly to kick things off.",
  "start.alreadyStatus": "This project is already {status}. Reach out on WhatsApp if you need anything.",
  "start.status.complete": "complete",
  "start.status.inProgress": "in progress",

  // Collaborate — apply page
  "collab.apply.title": "Become a collaborator",
  "collab.apply.subtitle":
    "Tell us a bit about yourself. If we approve your application, we'll send you a private access code. No account or email confirmation required.",
  "collab.apply.alreadyCollaborator": "Already a collaborator?",
  "collab.apply.enterCode": "Enter your code",

  // Collaborate — form
  "collab.form.name": "Name",
  "collab.form.email": "Email",
  "collab.form.phone": "Phone / WhatsApp",
  "collab.form.portfolio": "Portfolio, LinkedIn, or website",
  "collab.form.optional": "(optional)",
  "collab.form.about": "Tell us about yourself: your background, what you do, and why you'd be a good fit to collaborate with Zebraish",
  "collab.form.pitch": "What kind of clients or projects would you bring us?",
  "collab.form.attachments": "Attach anything relevant: resume, portfolio, ID",
  "collab.form.attachmentsHelper": "(optional, up to 5 files, 10MB each)",
  "collab.form.submit": "Submit application",
  "collab.form.sending": "Sending…",
  "collab.form.successTitle": "Submitted. Your application is under review.",
  "collab.form.successBody":
    "We'll go through it and follow up. If you're approved, you'll get a private access code to sign in to the collaborator dashboard. No account needed.",
  "collab.error.required": "Name, and both questions below, are required.",
  "collab.error.tooManyFiles": "Attach up to {max} files.",
  "collab.error.fileTooLarge": "\"{name}\" is too large. 10MB max per file.",
  "collab.error.rateLimited": "Too many attempts. Wait a few minutes and try again.",
  "collab.error.uploadFailed": "Could not upload \"{name}\". Try again.",
  "collab.error.generic": "Something went wrong submitting your application. Try again.",

  // Login
  "login.title": "Collaborator access",
  "login.subtitle": "Enter the access code Zebraish gave you.",
  "login.accessCode": "Access code",
  "login.enter": "Enter",
  "login.signingIn": "Signing in…",
  "login.error.required": "Enter your access code.",
  "login.error.rateLimited": "Too many attempts. Wait a few minutes and try again.",
  "login.error.invalid": "Invalid access code.",

  // Collaborator nav
  "nav.thisWeek": "This week",
  "nav.payoutHistory": "Payout history",
  "nav.signOut": "Sign out",
  "nav.collaboratorLabel": "Collaborator",

  // Dashboard — this week
  "dash.title": "This week",
  "dash.weekOf": "Week of {date}",
  "dash.runningTotal": "This week's running total",
  "dash.termToDate": "Term-to-date total",
  "dash.transactions": "This week's transactions",
  "dash.col.projectId": "Project ID",
  "dash.col.payment": "Payment",
  "dash.col.commission": "Commission",
  "dash.col.status": "Status",
  "dash.empty": "No transactions this week yet.",

  // Dashboard — payouts
  "payouts.title": "Payout history",
  "payouts.subtitle": "Every payout marked paid, by week.",
  "payouts.col.week": "Week covered",
  "payouts.col.datePaid": "Date paid",
  "payouts.col.amount": "Amount",
  "payouts.empty": "No payouts yet.",

  // Track page
  "track.title": "Track your project",
  "track.inputPlaceholder": "Paste your project link's token",
  "track.submit": "Track",
  "track.rateLimited": "Too many attempts. Wait a few minutes and try again.",
  "track.notFound": "We couldn't find a project for that link. Double-check the link we sent you, or reach out if you think this is a mistake.",
  "track.started": "Started {date}",
  "track.percentComplete": "{percent}% complete",
  "track.currentlyStage": "Currently: {stage}",
  "track.settingUp": "Your project is being set up. A detailed stage checklist will appear here shortly.",
  "track.messages": "Messages",
  "track.hold.onHold": "This project is currently on hold.",
  "track.hold.awaitingClient": "We're waiting on information from you to continue.",
  "track.hold.generic": "This project is currently paused.",
  "track.status.draft": "Draft",
  "track.status.awaiting_payment": "Awaiting payment",
  "track.status.in_progress": "In progress",
  "track.status.completed": "Completed",
  "track.status.cancelled": "Cancelled",

  // Message box
  "messages.empty": "No messages yet. Say hello.",
  "messages.placeholder": "Message Zebraish about this project…",
  "messages.send": "Send",
  "messages.sending": "…",
  "messages.fromZebraish": "Zebraish",
  "messages.error.empty": "Write a message first.",
  "messages.error.sendFailed": "Could not send your message. Check your link.",

  // Status pill (payment/commission status shown to collaborators)
  "status.PAID": "PAID",
  "status.PENDING": "PENDING",
  "status.EXCLUDED": "EXCLUDED",

  // Client payment confirmation email
  "email.paymentConfirmation.subject": "Payment received: {projectCode}",
  "email.paymentConfirmation.body":
    "<p>Hi {clientName},</p><p>We've received your payment of <strong>{amount}</strong> for project <strong>{projectCode}</strong>. We'll be in touch shortly to get started.</p><p>Zebraish</p>",

  // Language toggle
  "lang.toggle.aria": "Switch language",
} as const;

const es: Record<keyof typeof en, string> = {
  // Configurator — done screen
  "config.done.title": "Todo listo, {name}.",
  "config.done.reference": "Referencia de tu proyecto:",
  "config.done.saveLink.title": "Guarda tu enlace de seguimiento",
  "config.done.saveLink.body":
    "Es la única forma de volver a tu proyecto, así que úsalo para ver el progreso, pagar o escribirnos. También lo incluimos en el mensaje de WhatsApp de abajo.",
  "config.done.copy": "Copiar",
  "config.done.copied": "Copiado",
  "config.done.whatsappNote":
    "WhatsApp debería haberse abierto con los detalles de tu proyecto y este enlace. Envíalo y seguimos la conversación desde ahí.",
  "config.done.payNow": "Pagar ahora: {amount}",
  "config.done.chatWhatsapp": "Chatear por WhatsApp →",
  "config.done.bookmark": "Guarda esta página en marcadores para poder volver cuando quieras a revisar, editar o pagar más tarde.",

  // Configurator — type picker
  "config.type.title": "¿Qué vas a construir?",
  "config.type.subtitle": "Elige uno para ver solo las preguntas que importan.",

  // Configurator — steps
  "config.steps.back": "← Atrás",
  "config.steps.next": "Siguiente →",
  "config.steps.review": "Revisar →",

  // Configurator — details/review
  "config.details.title": "Tu proyecto",
  "config.details.subtitle": "Esto es todo lo que seleccionaste.",
  "config.details.complexityAdjustment": "Ajuste por complejidad",
  "config.details.deliveryAdjustment": "Ajuste por tiempo de entrega",
  "config.details.total": "Total",
  "config.details.customQuoteNote":
    "Añadiste una nota que revisaremos manualmente. Te enviaremos un presupuesto final antes de cobrar nada.",
  "config.details.yourName": "Tu nombre",
  "config.details.howReach": "¿Cómo prefieres que te contactemos?",
  "config.details.contactEmail": "Correo electrónico",
  "config.details.contactPhone": "Teléfono / WhatsApp",
  "config.details.continue": "Continuar →",
  "config.details.saving": "Guardando…",
  "config.details.edit": "← Editar",
  "config.details.errorRequired": "Por favor, indica tu nombre y una forma de contactarte.",
  "config.details.errorNetwork":
    "No se pudo conectar con el servidor para guardar tu proyecto ({message}). Revisa tu conexión e inténtalo de nuevo. No se perdió nada.",

  // WhatsApp draft message
  "wa.greeting": "¡Hola Zebraish! Acabo de configurar un proyecto.",
  "wa.reference": "*Referencia:*",
  "wa.building": "*Construyendo:*",
  "wa.total": "*Total:*",
  "wa.trackingLink": "Mi enlace de seguimiento:",

  // Payment method selector
  "pay.method.card": "Tarjeta",
  "pay.method.cardHelper": "Paga de forma segura con tu tarjeta",
  "pay.method.bankTransfer": "Transferencia bancaria",
  "pay.method.bankTransferHelper": "Transfiere directamente desde la app de tu banco",
  "pay.method.bankCharge": "Pagar con el banco",
  "pay.method.bankChargeHelper": "Autoriza al instante desde tu propio banco (España/UE/Reino Unido)",
  "pay.method.changeMethod": "← Elegir otro método",

  // Card checkout
  "pay.card.needsEmail": "El pago con tarjeta necesita un correo electrónico para tu recibo.",
  "pay.card.emailPlaceholder": "tucorreo@ejemplo.com",
  "pay.card.redirecting": "Redirigiendo al pago…",

  // Pay with Bank (Flutterwave, automated)
  "pay.bankCharge.needsContact": "Necesitamos un correo electrónico y un número de teléfono para verificar tu pago bancario.",
  "pay.bankCharge.emailPlaceholder": "tucorreo@ejemplo.com",
  "pay.bankCharge.phonePlaceholder": "Número de teléfono",
  "pay.bankCharge.redirecting": "Redirigiendo a tu banco…",

  // Bank transfer panel
  "pay.bank.settingUp": "Preparando tu transferencia…",
  "pay.bank.genericError": "No se pudo iniciar la transferencia bancaria.",
  "pay.bank.notSetUp":
    "La transferencia bancaria aún no está disponible en {currency}. Elige Tarjeta en su lugar, o escríbenos por WhatsApp y lo resolvemos directamente.",
  "pay.bank.instructionsTitle": "Instrucciones de transferencia",
  "pay.bank.beneficiary": "Beneficiario",
  "pay.bank.amount": "Importe",
  "pay.bank.reference": "Referencia",
  "pay.bank.footnote":
    "Incluye la referencia anterior en tu transferencia para que podamos identificarla. Confirmaremos y actualizaremos tu proyecto en cuanto la recibamos. Las transferencias internacionales pueden tardar más.",

  // Pay page
  "pay.page.alreadyPaid": "Este proyecto ya ha sido pagado. Gracias.",

  // Collaborate — apply page
  "collab.apply.title": "Conviértete en colaborador",
  "collab.apply.subtitle":
    "Cuéntanos un poco sobre ti. Si aprobamos tu solicitud, te enviaremos un código de acceso privado. Sin necesidad de cuenta ni confirmación por correo.",
  "collab.apply.alreadyCollaborator": "¿Ya eres colaborador?",
  "collab.apply.enterCode": "Introduce tu código",

  // Collaborate — form
  "collab.form.name": "Nombre",
  "collab.form.email": "Correo electrónico",
  "collab.form.phone": "Teléfono / WhatsApp",
  "collab.form.portfolio": "Portafolio, LinkedIn o sitio web",
  "collab.form.optional": "(opcional)",
  "collab.form.about": "Cuéntanos sobre ti: tu trayectoria, a qué te dedicas y por qué encajarías bien colaborando con Zebraish",
  "collab.form.pitch": "¿Qué tipo de clientes o proyectos nos traerías?",
  "collab.form.attachments": "Adjunta lo que consideres relevante: currículum, portafolio, identificación",
  "collab.form.attachmentsHelper": "(opcional, hasta 5 archivos, 10MB cada uno)",
  "collab.form.submit": "Enviar solicitud",
  "collab.form.sending": "Enviando…",
  "collab.form.successTitle": "Enviado. Tu solicitud está en revisión.",
  "collab.form.successBody":
    "La revisaremos y te avisaremos. Si te aprobamos, recibirás un código de acceso privado para entrar al panel de colaborador. Sin necesidad de cuenta.",
  "collab.error.required": "El nombre y ambas preguntas de abajo son obligatorios.",
  "collab.error.tooManyFiles": "Adjunta un máximo de {max} archivos.",
  "collab.error.fileTooLarge": "\"{name}\" es demasiado grande. 10MB máximo por archivo.",
  "collab.error.rateLimited": "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
  "collab.error.uploadFailed": "No se pudo subir \"{name}\". Inténtalo de nuevo.",
  "collab.error.generic": "Algo salió mal al enviar tu solicitud. Inténtalo de nuevo.",

  // Login
  "login.title": "Acceso de colaborador",
  "login.subtitle": "Introduce el código de acceso que te dio Zebraish.",
  "login.accessCode": "Código de acceso",
  "login.enter": "Entrar",
  "login.signingIn": "Entrando…",
  "login.error.required": "Introduce tu código de acceso.",
  "login.error.rateLimited": "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
  "login.error.invalid": "Código de acceso inválido.",

  // Collaborator nav
  "nav.thisWeek": "Esta semana",
  "nav.payoutHistory": "Historial de pagos",
  "nav.signOut": "Cerrar sesión",
  "nav.collaboratorLabel": "Colaborador",

  // Dashboard — this week
  "dash.title": "Esta semana",
  "dash.weekOf": "Semana del {date}",
  "dash.runningTotal": "Total acumulado esta semana",
  "dash.termToDate": "Total del periodo hasta la fecha",
  "dash.transactions": "Transacciones de esta semana",
  "dash.col.projectId": "ID de proyecto",
  "dash.col.payment": "Pago",
  "dash.col.commission": "Comisión",
  "dash.col.status": "Estado",
  "dash.empty": "Aún no hay transacciones esta semana.",

  // Dashboard — payouts
  "payouts.title": "Historial de pagos",
  "payouts.subtitle": "Cada pago marcado como pagado, por semana.",
  "payouts.col.week": "Semana cubierta",
  "payouts.col.datePaid": "Fecha de pago",
  "payouts.col.amount": "Importe",
  "payouts.empty": "Aún no hay pagos.",

  // Track page
  "track.title": "Sigue tu proyecto",
  "track.inputPlaceholder": "Pega el token de tu enlace de proyecto",
  "track.submit": "Buscar",
  "track.rateLimited": "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
  "track.notFound": "No encontramos ningún proyecto con ese enlace. Revisa el enlace que te enviamos, o contáctanos si crees que es un error.",
  "track.started": "Iniciado el {date}",
  "track.percentComplete": "{percent}% completado",
  "track.currentlyStage": "Actualmente: {stage}",
  "track.settingUp": "Tu proyecto se está preparando. Aquí aparecerá pronto un listado detallado de sus etapas.",
  "track.messages": "Mensajes",
  "track.hold.onHold": "Este proyecto está actualmente en pausa.",
  "track.hold.awaitingClient": "Estamos esperando información de tu parte para continuar.",
  "track.hold.generic": "Este proyecto está actualmente en pausa.",
  "track.status.draft": "Borrador",
  "track.status.awaiting_payment": "Esperando pago",
  "track.status.in_progress": "En curso",
  "track.status.completed": "Completado",
  "track.status.cancelled": "Cancelado",

  // Message box
  "messages.empty": "Aún no hay mensajes. Saluda.",
  "messages.placeholder": "Escribe a Zebraish sobre este proyecto…",
  "messages.send": "Enviar",
  "messages.sending": "…",
  "messages.fromZebraish": "Zebraish",
  "messages.error.empty": "Escribe un mensaje primero.",
  "messages.error.sendFailed": "No se pudo enviar tu mensaje. Revisa tu enlace.",

  // Start page
  "start.logoLabel": "Iniciar un proyecto",
  "start.paymentFailed": "El pago no se completó. Puedes intentarlo de nuevo abajo.",
  "start.paymentReceived": "Pago recibido, ¡gracias! Nos pondremos en contacto en breve para empezar.",
  "start.alreadyStatus": "Este proyecto ya está {status}. Escríbenos por WhatsApp si necesitas algo.",
  "start.status.complete": "completado",
  "start.status.inProgress": "en curso",

  // Status pill
  "status.PAID": "PAGADO",
  "status.PENDING": "PENDIENTE",
  "status.EXCLUDED": "EXCLUIDO",

  // Client payment confirmation email
  "email.paymentConfirmation.subject": "Pago recibido: {projectCode}",
  "email.paymentConfirmation.body":
    "<p>Hola {clientName},</p><p>Hemos recibido tu pago de <strong>{amount}</strong> para el proyecto <strong>{projectCode}</strong>. Nos pondremos en contacto contigo en breve para comenzar.</p><p>Zebraish</p>",

  // Language toggle
  "lang.toggle.aria": "Cambiar idioma",
};

export const dictionaries = { en, es };
export type DictKey = keyof typeof en;

export function translate(lang: Lang, key: DictKey, vars?: Record<string, string | number>): string {
  const raw = dictionaries[lang][key] ?? dictionaries.en[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
}
