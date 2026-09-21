import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import { TaskItem } from "@/components/TaskItem";
import { CreateTaskForm } from "@/components/CreateTaskForm";

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const tasks = await prisma.task.findMany({
    where: { userId: Number(session.user.id) },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-zinc-900">
      <Navbar username={session.user.username} />
      <div className="mx-auto max-w-5xl px-6 py-8">
        <CreateTaskForm />

        {tasks.length === 0 ? (
          <p data-testid="no-tasks-message" className="mt-12 text-center text-zinc-500">
            No tasks yet
          </p>
        ) : (
          <div data-testid="task-list" className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}