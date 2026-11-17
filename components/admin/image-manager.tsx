'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Link2, Loader2, Trash2, Upload } from 'lucide-react';
import type { MediaDraft } from './product-types';

/**
 * Galería del producto.
 *
 * Si Cloudinary está configurado, sube el archivo con una firma generada en el
 * servidor. Si no, permite pegar una URL pública (modo desarrollo).
 */
export function ImageManager({
  images,
  onChange,
}: {
  images: MediaDraft[];
  onChange: (images: MediaDraft[]) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addUrl() {
    const value = url.trim();
    if (!/^https?:\/\//i.test(value)) {
      setError('Pega una URL que empiece con http:// o https://');
      return;
    }
    if (images.length >= 10) {
      setError('Máximo 10 imágenes.');
      return;
    }
    setError(null);
    onChange([...images, { url: value, alt: alt.trim() }]);
    setUrl('');
    setAlt('');
  }

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);

    try {
      const signResponse = await fetch('/api/uploads/sign');
      const signJson = (await signResponse.json()) as
        | {
            ok: true;
            data: { cloudName: string; apiKey: string; timestamp: number; folder: string; signature: string };
          }
        | { ok: false; error: { message: string } };

      if (!signResponse.ok || !signJson.ok) {
        setError(
          !signJson.ok
            ? signJson.error.message
            : 'La subida de archivos no está configurada. Pega una URL pública.',
        );
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signJson.data.apiKey);
      formData.append('timestamp', String(signJson.data.timestamp));
      formData.append('folder', signJson.data.folder);
      formData.append('signature', signJson.data.signature);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signJson.data.cloudName}/image/upload`,
        { method: 'POST', body: formData },
      );

      if (!uploadResponse.ok) {
        setError('No se pudo subir la imagen. Inténtalo de nuevo.');
        return;
      }

      const uploaded = (await uploadResponse.json()) as {
        secure_url: string;
        public_id: string;
        width?: number;
        height?: number;
      };

      if (images.length >= 10) {
        setError('Máximo 10 imágenes.');
        return;
      }

      onChange([
        ...images,
        {
          url: uploaded.secure_url,
          publicId: uploaded.public_id,
          width: uploaded.width ?? null,
          height: uploaded.height ?? null,
          alt: '',
        },
      ]);
    } catch {
      setError('No se pudo subir la imagen. Revisa tu conexión.');
    } finally {
      setUploading(false);
      if (fileInput.current) {
        fileInput.current.value = '';
      }
    }
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) {
      return;
    }
    const next = [...images];
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  }

  function remove(index: number) {
    onChange(images.filter((_, position) => position !== index));
  }

  function updateAlt(index: number, value: string) {
    onChange(images.map((image, position) => (position === index ? { ...image, alt: value } : image)));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInput}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleFile(file);
            }
          }}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading || images.length >= 10}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-accent disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Upload className="size-4" aria-hidden />
          )}
          Subir imagen
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1 rounded-md border border-input bg-background px-2">
            <Link2 className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://…"
              className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none"
              aria-label="URL de la imagen"
            />
          </div>
          <input
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            placeholder="Texto alternativo"
            className="h-9 w-32 rounded-md border border-input bg-background px-2 text-sm outline-none"
            aria-label="Texto alternativo"
          />
          <button
            type="button"
            onClick={addUrl}
            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-md border border-border px-3 text-sm font-medium hover:bg-accent"
          >
            <ImagePlus className="size-4" aria-hidden />
            Añadir
          </button>
        </div>
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      {images.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
          La primera imagen se usa como portada. Formato recomendado: cuadrada.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <li key={`${image.url}-${index}`} className="overflow-hidden rounded-lg border border-border bg-background">
              <div className="relative aspect-square bg-muted">
                <Image
                  src={image.url}
                  alt={image.alt || 'Imagen del producto'}
                  fill
                  sizes="240px"
                  className="object-cover"
                  unoptimized
                />
                {index === 0 ? (
                  <span className="absolute top-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                    Portada
                  </span>
                ) : null}
              </div>
              <div className="space-y-2 p-2">
                <input
                  value={image.alt}
                  onChange={(event) => updateAlt(index, event.target.value)}
                  placeholder="Texto alternativo"
                  className="h-8 w-full rounded border border-input bg-background px-2 text-xs outline-none"
                  aria-label="Texto alternativo"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="rounded p-1.5 text-muted-foreground hover:bg-accent disabled:opacity-30"
                      aria-label="Mover antes"
                    >
                      <ArrowUp className="size-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === images.length - 1}
                      className="rounded p-1.5 text-muted-foreground hover:bg-accent disabled:opacity-30"
                      aria-label="Mover después"
                    >
                      <ArrowDown className="size-3.5" aria-hidden />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                    aria-label="Quitar imagen"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
