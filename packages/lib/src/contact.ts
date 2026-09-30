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
  /** Handles without the @; left empty until the accounts are ready. */
  instagram: "zebraish_studio",
  tiktok: "",
} as const;

/** Who runs the site, for the Aviso legal (Spain's LSSI requires it). Empty
 * values are left off the page until they're filled in. */
export const LEGAL = {
  /** Full legal name of the owner (or company name once incorporated). */
  ownerName: "",
  /** NIE/NIF (or CIF for a company). */
  taxId: "",
  /** Registered postal address. */
  address: "",
  tradeName: "Zebraish Studio",
} as const;

export const whatsappUrl = (text?: string) =>
  `https://wa.me/${CONTACT.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
export const mailtoUrl = `mailto:${CONTACT.email}`;
export const telUrl = `tel:${CONTACT.phone}`;
export const instagramUrl = CONTACT.instagram ? `https://www.instagram.com/${CONTACT.instagram}` : "";
export const tiktokUrl = CONTACT.tiktok ? `https://www.tiktok.com/@${CONTACT.tiktok}` : "";

/** Every way to reach us, in display order; socials appear once their handle is set. */
export function contactLinks(): { label: string; href: string }[] {
  return [
    { label: "WhatsApp", href: whatsappUrl() },
    { label: "Email", href: mailtoUrl },
    { label: "Call Me", href: telUrl },
    { label: "Instagram", href: instagramUrl },
    { label: "TikTok", href: tiktokUrl },
  ].filter((l) => l.href);
}
