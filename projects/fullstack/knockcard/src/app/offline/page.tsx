export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0a0a0a]">
        <span className="text-2xl font-extrabold text-white">K</span>
      </div>
      <h1 className="mt-6 text-2xl font-bold text-[#1a1a1a]">You are offline</h1>
      <p className="mt-2 text-[14px] text-[#999]">Check your internet connection and try again.</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-6 rounded-full bg-[#1a1a1a] px-6 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#333]"
      >
        Try again
      </button>
    </div>
  )
}
