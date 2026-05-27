"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

type FormState = { error: string | null };

export async function createProject(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const name = formData.get("name")?.toString().trim();

  if (!name || name.length < 2) {
    return { error: "Project name must be at least 2 characters." };
  }
  if (name.length > 50) {
    return { error: "Project name must be 50 characters or less." };
  }

  await prisma.project.create({
    data: {
      name,
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Vérification d'ownership : critique pour la sécurité
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true },
  });

  if (!project || project.userId !== session.user.id) {
    throw new Error("Project not found or unauthorized");
  }

  await prisma.project.delete({ where: { id: projectId } });
  revalidatePath("/dashboard");
}