import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const taskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    completed: z.boolean().optional(),
    dueDate: z.string().datetime().optional().nullable(),
})

export async function GET() {
    
    const session = await auth();

    if(!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
        where: { userId: Number(session.user.id) },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks, { status: 200 });
}

export async function POST(request: Request) {
    
    const session = await auth();

    if(!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    };

    const body = await request.json();
    const parsed = taskSchema.safeParse(body);

    if(!parsed.success) {
        return NextResponse.json(
            { errors: parsed.error.issues.map((issue) => issue.message) },
            { status: 400}
        )
    };
    
    const task = await prisma.task.create({
        data: {
            title: parsed.data.title,
            description: parsed.data.description,
            completed: parsed.data.completed ?? false,
            dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
            userId: Number(session.user.id),
        },
    });

    return NextResponse.json(task, { status: 201 });
}