import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 text-center">
      <Image src="/zebraish-lockup.png" alt="Zebraish" width={220} height={64} priority />
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/portal"
          className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-hover"
        >
          Start a project
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-border px-5 py-2.5 font-medium text-fg transition hover:bg-bg-raised"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
