import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/RegisterForm";

export default async function LoginPage() {
    
    const session = await auth();

    if (session?.user) {
        redirect("/tasks");
    }

    return <RegisterForm />;
    
};