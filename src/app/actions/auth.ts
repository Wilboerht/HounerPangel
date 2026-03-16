"use server";

import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helper to get supabase client with cookies for server actions
export async function createServerClient() {
    const cookieStore = await cookies();
    
    // In a real production app with SSR auth, we'd use @supabase/auth-helpers-nextjs
    // or the newer @supabase/ssr package. For simplicity and standard agentic flow,
    // we use the base client. Note: For middleware protection, we need to handle 
    // session persistence.
    
    // For simplicity, we use the pre-configured global client
    return supabase;
}

export async function loginAction(formData: FormData) {
    console.log("Login attempt started for:", formData.get("email"));
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    try {
        console.log("Calling Supabase signInWithPassword...");
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        console.log("Supabase response received. Error:", error?.message || "none");

        if (error) {
            return { error: error.message };
        }

        console.log("Setting session cookie...");
        const cookieStore = await cookies();
        cookieStore.set("admin-session", data.session?.access_token || "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/",
        });
    } catch (e: any) {
        return { error: e.message || "Connection timeout or network error" };
    }

    redirect("/admin");
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete("admin-session");
    await supabase.auth.signOut();
    redirect("/admin/login");
}

export async function getSession() {
    const cookieStore = await cookies();
    return cookieStore.get("admin-session")?.value;
}
