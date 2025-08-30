export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-10">
      <div className="container max-w-6xl py-8 text-sm flex flex-col md:flex-row gap-2 md:gap-6 md:items-center justify-between">
        <div>© {new Date().getFullYear()} Netababu</div>
        <div className="text-white/70">Sources • Disclaimer • Contact • X/Twitter • GitHub</div>
      </div>
    </footer>
  );
}
