import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Schéma de validation — on n'accepte QUE ces champs
const feedbackSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(2000, "Message must be 2000 characters or less"),
  email: z.string().email().optional().or(z.literal("")),
  pageUrl: z.string().url().optional().or(z.literal("")),
});

// Headers CORS — autorise n'importe quel domaine à appeler cette API
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Handler CORS preflight (les navigateurs envoient un OPTIONS avant le POST cross-origin)
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectKey: string }> }
) {
  const { projectKey } = await params;

  try {
    // Étape 1 : parser le body
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Étape 2 : valider avec Zod
    const result = feedbackSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Étape 3 : vérifier que le projet existe
    const project = await prisma.project.findUnique({
      where: { apiKey: projectKey },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Invalid project key" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Étape 4 : créer le feedback en DB
    await prisma.feedback.create({
      data: {
        message: result.data.message,
        email: result.data.email || null,
        pageUrl: result.data.pageUrl || null,
        projectId: project.id,
      },
    });

    return NextResponse.json(
      { success: true },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error("[/api/feedback] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}