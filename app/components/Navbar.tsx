import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-8 lg:px-16 py-4 md:py-5 backdrop-blur-xl bg-black/20 border-b border-white/10">
      <div>
        <span className="text-white font-bold text-lg md:text-xl tracking-[0.25em] uppercase">
          Sadheeya
        </span>
        <span className="hidden sm:block text-primary-extra-light text-[10px] tracking-[0.35em] uppercase font-light mt-0.5">
          Pure · Natural · Raw
        </span>
      </div>

      <Link href="https://sadheeya.com/products/pure-wildflower-honey-a-golden-essence-of-nature-s-untamed-beauty" target="_blank" className="group relative px-5 py-2 md:px-7 md:py-2.5 text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase text-white border border-white/30 rounded-full overflow-hidden transition-all duration-500 hover:border-primary-extra-light/80">
        <span className="absolute inset-0 bg-primary-extra-light/0 group-hover:bg-primary-extra-light/15 transition-all duration-500 rounded-full" />
        <span className="relative">Shop Now</span>
      </Link>
    </nav>
  );
}
