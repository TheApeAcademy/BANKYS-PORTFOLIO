import Image from "next/image";
import Link from "next/link";

export function Logo({
  href = "/",
  label,
  name = "Zebraish",
}: {
  href?: string;
  label?: string;
  name?: string;
}) {
  return (
    <Link href={href} className="flex min-w-0 items-center gap-2.5">
      <Image src="/zebraish-mark.png" alt="Zebraish" width={28} height={28} className="shrink-0 rounded" />
      <span className="break-words font-semibold leading-tight tracking-tight text-fg">
        {name}
        {label ? <span className="text-fg-muted font-normal"> · {label}</span> : null}
      </span>
    </Link>
  );
}
