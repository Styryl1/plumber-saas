export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Plumber <span className="text-[hsl(280,100%,70%)]">SaaS</span>
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <div className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20">
            <h3 className="text-2xl font-bold">AI Business Partner →</h3>
            <div className="text-lg">
              Your 24/7 Dutch-speaking AI receptionist and business advisor
            </div>
          </div>
          <div className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20">
            <h3 className="text-2xl font-bold">Complete Automation →</h3>
            <div className="text-lg">
              Scheduling, invoicing, emergency dispatch - fully automated
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}