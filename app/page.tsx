import { Navbar } from "@/components/navbar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ConnectionTest } from "@/components/connection-test";
import { CreateWorkspaceButton } from "@/components/create-workspace-button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <Navbar />
        
        <div className="flex-1 flex flex-col items-center justify-center p-5 space-y-8">
          <ConnectionTest />
          
          <div className="w-full max-w-lg">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2">Finance Workspace</h1>
              <h2 className="text-xl font-semibold text-muted-foreground mb-2">Collaborative Financial Planning</h2>
              <p className="text-muted-foreground text-sm">
                Create a shared workspace for financial planning and collaboration - no sign-up required
              </p>
            </div>
            <CreateWorkspaceButton />
          </div>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
