// Zebraish's public contact details: the one place the site, the emails and
// the legal pages read them from. Change a value here and it changes everywhere.
export const CONTACT = {
  /** WhatsApp Business, digits only with country code (for wa.me links). */
  whatsapp: "2349051717561",
  /** Same number for tel: links and for showing on the page. */
  phone: "+2349051717561",
  phoneDisplay: "+234 905 171 7561",
  /** Swap for the domain inbox (e.g. hello@zebraish.com) once it's set up. */
  email: "j0shbankole19@gmail.com",
  snapchat: "j0shh.b",
  /** Handles without the @; left empty until the accounts are ready. */
  instagram: "",
  tiktok: "",
} as const;

export const whatsappUrl = (text?: string) =>
  `https://wa.me/${CONTACT.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
export const mailtoUrl = `mailto:${CONTACT.email}`;
export const telUrl = `tel:${CONTACT.phone}`;
export const snapchatUrl = `https://www.snapchat.com/add/${CONTACT.snapchat}`;
