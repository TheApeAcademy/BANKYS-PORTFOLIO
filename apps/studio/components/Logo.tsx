import Image from "next/image";
import Link from "next/link";

export function Logo({ href = "/", label }: { href?: string; label?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 shrink-0">
      <Image src="/zebraish-mark.png" alt="Zebraish" width={28} height={28} className="rounded" />
      <span className="font-semibold tracking-tight text-fg">
        Zebraish
        {label ? <span className="text-fg-muted font-normal"> · {label}</span> : null}
      </span>
    </Link>
  );
}
