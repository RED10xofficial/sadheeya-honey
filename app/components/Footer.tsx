export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 text-white">
      <div className="mx-auto max-w-6xl px-8 md:px-16 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm font-semibold tracking-[0.2em] uppercase">
          Sadheeya
        </p>
        <p className="text-xs text-white/50 tracking-wide">
          © {new Date().getFullYear()} Sadheeya. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
