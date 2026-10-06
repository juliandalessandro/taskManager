import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const taskSchema = z.object({
    title: z.string().trim().optional().default(""),
    description: z.string().optional(),
    completed: z.boolean().optional(),
    isChecklist: z.boolean().optional(),
});

export async function GET() {
    
    const session = await auth();

    if(!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
        where: { userId: Number(session.user.id) },
        orderBy: { createdAt: "desc" },
        include: {
            items: {
                orderBy: { createdAt: "asc" },
            },
        },
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
            isChecklist: parsed.data.isChecklist ?? false,
            userId: Number(session.user.id),
        },
    });

    return NextResponse.json(task, { status: 201 });
}