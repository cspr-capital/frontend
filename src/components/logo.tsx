import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
        <span className="text-lg font-bold text-primary-foreground">C</span>
      </div>
      <span className="text-xl font-semibold">CSPR Capital</span>
    </Link>
  );
}
