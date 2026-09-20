import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";

export default async function TasksPage() {

    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div>
            <Navbar username={session.user.username}></Navbar>
            
            <div className="flex justify-center p-6 bg-white">
                <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
            </div>
        </div>
    )
}