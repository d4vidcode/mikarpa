import Link from 'next/link';
import { auth } from '@/lib/auth';
import { logoutAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Store } from 'lucide-react';

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2" aria-label="mikarpa, inicio">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="size-4" aria-hidden />
          </span>
          <span className="text-base font-semibold tracking-tight">mikarpa</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/explorar"
            className="hidden rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Explorar tiendas
          </Link>

          {session?.user ? (
            <>
              <Link
                href="/panel"
                className="rounded-md px-3 py-2 font-medium transition-colors hover:bg-accent"
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
              <Link href="/iniciar-sesion" className="rounded-md px-3 py-2 transition-colors hover:bg-accent">
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
