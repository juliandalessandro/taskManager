import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const itemUpdateSchema = z.object({
  text: z.string().trim().min(1, "Text is required").optional(),
  completed: z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  "At least one field is required"
);

export async function PATCH (
    
    request: Request,
    { params }: { params: Promise<{ id: string; itemId: string }> }
) {

    const session = await auth();

    if(!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    };

    const { itemId } = await params;
    const itemIdNum = Number(itemId);

    if (isNaN(itemIdNum)) {
        return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
    };

    const body = await request.json();
    const parsed = itemUpdateSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
        { errors: parsed.error.issues.map((issue) => issue.message) },
        { status: 400 }
        );
    };

    const result = await prisma.checklistItem.updateMany({
        where: {
            id: itemIdNum,
            task: { userId: Number(session.user.id) },
        },
        data: parsed.data,
    });

    if (result.count === 0) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
    };

    const updatedItem = await prisma.checklistItem.findUnique({ where: { id: itemIdNum } });
    return NextResponse.json(updatedItem, { status: 200 });

};

export async function DELETE (

    request: Request,
    { params }: { params: Promise<{ id: string; itemId: string }> }
) {

    const session = await auth();

    if(!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    };

    const { itemId } = await params;
    const itemIdNum = Number(itemId);

    if (isNaN(itemIdNum)) {
        return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
    };

    const result = await prisma.checklistItem.deleteMany({
        where: {
            id: itemIdNum,
            task: { userId: Number(session.user.id) },
        },
    });

    if (result.count === 0) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
    };

    return NextResponse.json({ message: "Item deleted successfully" }, { status: 200 });

};