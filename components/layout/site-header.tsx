import Link from 'next/link';
import { auth } from '@/lib/auth';
import { logoutAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Store } from 'lucide-react';

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-2">
        <Link
          href="/"
          className="group flex items-center gap-2 rounded-[var(--r-sm)]"
          aria-label="mikarpa, inicio"
        >
          <span className="flex size-8 items-center justify-center rounded-[var(--r-sm)] bg-primary text-primary-foreground transition-transform duration-150 ease-[var(--ease)] group-hover:-translate-y-px">
            <Store className="size-3.5" aria-hidden />
          </span>
          <span className="text-[14px] font-semibold tracking-tight">mikarpa</span>
          <span className="kbd hidden sm:inline-flex">beta</span>
        </Link>

        <nav className="flex items-center gap-1 text-[12px]" aria-label="Navegación principal">
          <Link
            href="/explorar"
            className="hidden rounded-[var(--r-sm)] px-2.5 py-2 text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground sm:inline-flex"
          >
            Explorar tiendas
          </Link>

          {session?.user ? (
            <>
              <Link
                href="/panel"
                className="rounded-[var(--r-sm)] px-2.5 py-2 font-medium transition-colors duration-150 hover:bg-accent"
              >
                Mi panel
              </Link>
              <form action={logoutAction}>
                <Button type="submit" variant="outline" size="sm">
                  Salir
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/iniciar-sesion"
                className="rounded-[var(--r-sm)] px-2.5 py-2 transition-colors duration-150 hover:bg-accent"
              >
                Ingresar
              </Link>
              <Button asChild size="sm">
                <Link href="/registrarse">Crear mi tienda</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
