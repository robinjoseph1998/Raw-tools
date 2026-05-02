import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-4xl font-bold text-zinc-200">404</h1>
      <p className="text-zinc-500 text-sm">Page not found</p>
      <Link
        href="/"
        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
