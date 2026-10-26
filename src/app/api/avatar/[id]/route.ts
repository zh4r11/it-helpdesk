import { prisma } from "@/lib/prisma";

/** Foto profil pengguna; URL memuat `?v=` sehingga aman di-cache lama. */
export async function GET(_request: Request, { params }: RouteContext<"/api/avatar/[id]">) {
  const { id } = await params;
  const avatar = await prisma.avatar.findUnique({ where: { userId: id } });

  if (!avatar) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(avatar.data), {
    headers: {
      "Content-Type": avatar.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
