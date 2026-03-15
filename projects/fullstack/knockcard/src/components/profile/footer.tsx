'use client'

export function Footer() {
  return (
    <footer className="mt-auto flex flex-col items-center gap-2 px-5 pb-8 pt-6">
      <a href="/" className="flex flex-col items-center gap-2">
        <img src="/logo.png" alt="KnockCard" className="h-12" />
        <span className="text-[9px] font-semibold uppercase tracking-[3px] text-[#ccc]">
          Powered by KnockCard
        </span>
      </a>
    </footer>
  )
}
