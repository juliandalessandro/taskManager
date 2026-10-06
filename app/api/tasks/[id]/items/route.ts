import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const itemSchema = z.object({
  text: z.string().trim().min(1, "Text is required"),
});

export async function GET(

    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    };

    const { id } = await params;
    const taskId = Number(id);

    if (isNaN(taskId)) {
        return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
    };

    const task = await prisma.task.findFirst({
        where: { id: taskId, userId: Number(session.user.id) },
    });

    if (!task) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
    };

    const items = await prisma.checklistItem.findMany({
        where: { taskId },
        orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(items, { status: 200 });
};

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    };

    const { id } = await params;
    const taskId = Number(id);

    if (isNaN(taskId)) {
        return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
    };

    const task = await prisma.task.findFirst({
        where: { id: taskId, userId: Number(session.user.id) },
    });

    if (!task) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
    };

    const body = await request.json();
    const parsed = itemSchema.safeParse(body);

    if(!parsed.success) {
        return NextResponse.json(
            { errors: parsed.error.issues.map((issue) => issue.message) },
            { status: 400}
        )
    };

    const item = await prisma.checklistItem.create({
        data: {
            ...parsed.data,
            taskId,
        },
    });

    return NextResponse.json(item, { status: 201 });
}