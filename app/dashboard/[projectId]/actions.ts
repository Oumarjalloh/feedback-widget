"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function getOwnedFeedback(feedbackId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const feedback = await prisma.feedback.findUnique({
    where: { id: feedbackId },
    include: { project: { select: { userId: true, id: true } } },
  });

  if (!feedback || feedback.project.userId !== session.user.id) {
    throw new Error("Feedback not found or unauthorized");
  }
  return feedback;
}

export async function toggleReadFeedback(feedbackId: string) {
  const feedback = await getOwnedFeedback(feedbackId);
  await prisma.feedback.update({
    where: { id: feedbackId },
    data: { read: !feedback.read },
  });
  revalidatePath(`/dashboard/${feedback.project.id}`);
}

export async function deleteFeedback(feedbackId: string) {
  const feedback = await getOwnedFeedback(feedbackId);
  await prisma.feedback.delete({ where: { id: feedbackId } });
  revalidatePath(`/dashboard/${feedback.project.id}`);
}