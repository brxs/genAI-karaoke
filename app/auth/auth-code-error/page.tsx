import Link from "next/link";

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-md w-full p-6 text-center">
        <h1 className="text-xl font-semibold text-white mb-2">
          Authentication Error
        </h1>
        <p className="text-white/50 text-sm mb-6">
          Something went wrong during sign in. Please try again.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 text-black rounded-xl font-bold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #e4e4e7 100%)",
            boxShadow:
              "0 3px 0 #a1a1aa, 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8)",
          }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
