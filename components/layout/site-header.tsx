import Link from 'next/link';
import { auth } from '@/lib/auth';
import { logoutAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Store } from 'lucide-react';

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-[var(--r-btn)]"
          aria-label="mikarpa, inicio"
        >
          <span className="flex size-9 items-center justify-center rounded-[var(--r-btn)] bg-primary text-primary-foreground transition-transform duration-150 ease-[var(--ease)] group-hover:-translate-y-px">
            <Store className="size-4" aria-hidden />
          </span>
          <span className="text-[17px] font-medium tracking-[-0.035em]">mikarpa</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm" aria-label="Navegación principal">
          <Link
            href="/explorar"
            className="hidden rounded-[var(--r-btn)] px-3 py-2 text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground sm:inline-flex"
          >
            Explorar tiendas
          </Link>

          {session?.user ? (
            <>
              <Link
                href="/panel"
                className="rounded-[var(--r-btn)] px-3 py-2 font-medium transition-colors duration-150 hover:bg-accent"
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
                className="rounded-[var(--r-btn)] px-3 py-2 transition-colors duration-150 hover:bg-accent"
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
