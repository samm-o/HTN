import { useNavigate } from "react-router-dom";
import Squares from "@/components/Squares";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden flex flex-col">
      {/* Animated squares background - positioned at the very back */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Squares
          direction="diagonal"
          speed={0.6}
          borderColor="rgba(71,85,105,0.15)" /* slate-600 at ~15% */
          hoverFillColor="rgba(30,41,59,0.25)" /* slate-800 at ~25% */
          squareSize={44}
        />
      </div>
      {/* Soft radial vignette to focus center - above squares but below content */}
      <div className="fixed inset-0 pointer-events-none z-10 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0)_0%,rgba(15,23,42,0.4)_70%,rgba(15,23,42,0.75)_100%)]" />

      {/* Top bar */}
      <header className="relative z-20 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/LogoBas.svg" alt="Bastion" className="h-8 w-8" />
          <span className="font-semibold text-lg tracking-wide">Bastion</span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-20 flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            <strong>API-First Fraud</strong> <br /> Shield for Ecommerce
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Suspicious refund? Call Bastion, a B2B ecommerce API that verifies
            claims, assigns a cross-platform customer ID, and exposes repeat
            fraud without storing personal data, so you get revenue, not regret.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-5 py-3 rounded-md bg-gray-800 hover:bg-gray-900 text-slate-100 font-semibold transition shadow-md"
            >
              Dashboard Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 flex items-center justify-center px-6 py-6 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Bastion. All rights reserved.
      </footer>
    </div>
  );
}
