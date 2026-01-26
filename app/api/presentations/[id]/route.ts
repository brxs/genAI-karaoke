import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// GET /api/presentations/[id] - Get single presentation
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const presentation = await prisma.presentation.findUnique({
      where: { id },
      include: { slides: { orderBy: { slideNumber: "asc" } } },
    });

    if (!presentation || presentation.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(presentation);
  } catch (error) {
    console.error("Error fetching presentation:", error);
    return NextResponse.json(
      { error: "Failed to fetch presentation" },
      { status: 500 }
    );
  }
}

// DELETE /api/presentations/[id] - Delete presentation
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const presentation = await prisma.presentation.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!presentation || presentation.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete presentation (slides cascade delete)
    await prisma.presentation.delete({ where: { id } });

    // Note: Storage cleanup should be done separately
    // The client should call deletePresentationImages before this

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting presentation:", error);
    return NextResponse.json(
      { error: "Failed to delete presentation" },
      { status: 500 }
    );
  }
}
