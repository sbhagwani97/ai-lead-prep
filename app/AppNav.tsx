import Link from "next/link";
import "./app.css";

export default function AppNav({ right }: { right?: React.ReactNode }) {
  return (
    <header className="ap-nav">
      <div className="ap-nav-in">
        <Link href="/prep" className="ap-brand">
          <img src="/logo-mark.svg" alt="" width={26} height={26} />
          Preppy
        </Link>
        <div className="ap-right">{right}</div>
      </div>
    </header>
  );
}
