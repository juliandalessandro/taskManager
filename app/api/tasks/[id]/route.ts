import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const taskSchema = z.object({
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().optional().nullable(),
    completed: z.boolean().optional(),
    dueDate: z.string().datetime().optional().nullable(),
}).refine(
        (data) => Object.keys(data).length > 0,
        "At least one field is required"
    );

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    
    const session = await auth();

    if(!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    };
    
    const { id } = await params;
    const taskId = Number(id);

    if (isNaN(taskId)) {
        return NextResponse.json({ error: "Invalid task id" }, { status: 400 })
    };

    const body = await request.json();
    const parsed = taskSchema.safeParse(body);
    
    if (!parsed.success) {
        return NextResponse.json(
            { errors: parsed.error.issues.map((issue) => issue.message) },
            { status: 400 }
        )
    };

    const result = await prisma.task.updateMany({
        where: {
            id: taskId,
            userId: Number(session.user.id),
        },
        data: {
            ...parsed.data,
            dueDate:
                parsed.data.dueDate !== undefined
                    ? parsed.data.dueDate
                        ? new Date(parsed.data.dueDate)
                        : null
                    : undefined,
        }
    });

    if (result.count === 0) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
    };

    const updatedTask = await prisma.task.findUnique({ where: { id: taskId } });
    return NextResponse.json(updatedTask, { status: 200 });
};

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {

    const session = await auth();

    if(!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    };
    
    const { id } = await params;
    const taskId = Number(id);

    if (isNaN(taskId)) {
        return NextResponse.json({ error: "Invalid task id" }, { status: 400 })
    };

    const result = await prisma.task.deleteMany({
        where: {
            id: taskId,
            userId: Number(session.user.id),
        }
    });

    if (result.count === 0) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
    };

    return NextResponse.json({ message: "Task deleted successfully" }, { status: 200 });
};