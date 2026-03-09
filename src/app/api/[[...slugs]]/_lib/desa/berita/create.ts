import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { createBeritaSchema, type CreateBeritaInput } from "@/lib/validations";
import { sanitizeHtml, sanitizeYouTubeUrl } from "@/lib/sanitizer";

async function beritaCreate(context: Context) {
  try {
    // Validate input with Zod schema
    const validated = createBeritaSchema.parse(context.body);
    
    // Sanitize HTML content untuk mencegah XSS
    const sanitizedContent = sanitizeHtml(validated.content);
    
    // Sanitize YouTube URL jika ada
    const sanitizedLinkVideo = validated.linkVideo 
      ? sanitizeYouTubeUrl(validated.linkVideo)
      : null;

    // Create berita dengan data yang sudah divalidasi dan disanitize
    await prisma.berita.create({
      data: {
        content: sanitizedContent,
        deskripsi: validated.deskripsi,
        imageId: validated.imageId,
        judul: validated.judul,
        kategoriBeritaId: validated.kategoriBeritaId,
        linkVideo: sanitizedLinkVideo,
        // Connect multiple images if provided
        images: validated.imageIds && validated.imageIds.length > 0
          ? {
              connect: validated.imageIds.map((id) => ({ id })),
            }
          : undefined,
      },
    });

    return {
      success: true,
      message: "Sukses menambahkan berita",
      data: {
        ...validated,
        content: sanitizedContent,
        linkVideo: sanitizedLinkVideo,
      },
    };
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof Error && error.constructor.name === 'ZodError') {
      const zodError = error as import('zod').ZodError;
      return {
        success: false,
        message: "Validasi gagal",
        errors: zodError.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      };
    }

    // Re-throw other errors
    throw error;
  }
}

export default beritaCreate;
