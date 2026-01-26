import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// GET /api/presentations - List user's presentations
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const presentations = await prisma.presentation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        slides: {
          orderBy: { slideNumber: "asc" },
          take: 1, // Just get first slide for thumbnail
        },
        _count: {
          select: { slides: true },
        },
      },
    });

    const summaries = presentations.map((p: (typeof presentations)[number]) => ({
      id: p.id,
      topic: p.topic,
      style: p.style,
      slideCount: p._count.slides,
      thumbnailUrl: p.slides[0]?.imageUrl,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json(summaries);
  } catch (error) {
    console.error("Error fetching presentations:", error);
    return NextResponse.json(
      { error: "Failed to fetch presentations" },
      { status: 500 }
    );
  }
}

// POST /api/presentations - Create or update presentation
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, topic, style, absurdity, customStylePrompt, context, slides } =
      body;

    // If id is provided, update existing presentation
    if (id) {
      // Verify ownership
      const existing = await prisma.presentation.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!existing || existing.userId !== user.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      // Update presentation and replace slides
      const presentation = await prisma.presentation.update({
        where: { id },
        data: {
          topic,
          style,
          absurdity,
          customStylePrompt,
          context,
          slides: {
            deleteMany: {},
            create: slides.map(
              (s: {
                id: string;
                slideNumber: number;
                title: string;
                bulletPoints: string[];
                imagePrompt?: string;
                imageUrl?: string;
                imageError?: string;
                isTitleSlide?: boolean;
              }) => ({
                id: s.id,
                slideNumber: s.slideNumber,
                title: s.title,
                bulletPoints: s.bulletPoints,
                imagePrompt: s.imagePrompt,
                imageUrl: s.imageUrl,
                imageError: s.imageError,
                isTitleSlide: s.isTitleSlide ?? false,
              })
            ),
          },
        },
        include: { slides: { orderBy: { slideNumber: "asc" } } },
      });

      return NextResponse.json(presentation);
    }

    // Create new presentation
    const presentation = await prisma.presentation.create({
      data: {
        userId: user.id,
        topic,
        style,
        absurdity,
        customStylePrompt,
        context,
        slides: {
          create: slides.map(
            (s: {
              id: string;
              slideNumber: number;
              title: string;
              bulletPoints: string[];
              imagePrompt?: string;
              imageUrl?: string;
              imageError?: string;
              isTitleSlide?: boolean;
            }) => ({
              id: s.id,
              slideNumber: s.slideNumber,
              title: s.title,
              bulletPoints: s.bulletPoints,
              imagePrompt: s.imagePrompt,
              imageUrl: s.imageUrl,
              imageError: s.imageError,
              isTitleSlide: s.isTitleSlide ?? false,
            })
          ),
        },
      },
      include: { slides: { orderBy: { slideNumber: "asc" } } },
    });

    return NextResponse.json(presentation);
  } catch (error) {
    console.error("Error saving presentation:", error);
    return NextResponse.json(
      { error: "Failed to save presentation" },
      { status: 500 }
    );
  }
}
