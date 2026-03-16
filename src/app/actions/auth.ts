"use server";

import { createClient } from "@supabase/supabase-js";
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
    
    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false // Server actions are stateless
        }
    });
}

export async function loginAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    // Since we are using standard supabase-js without @supabase/ssr for now, 
    // we'll rely on the client-side auth state for the dashboard, 
    // but we can set a simple cookie for middleware as a basic gate.
    const cookieStore = await cookies();
    cookieStore.set("admin-session", data.session?.access_token || "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
    });

    redirect("/admin");
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete("admin-session");
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    await supabase.auth.signOut();
    
    redirect("/admin/login");
}

export async function getSession() {
    const cookieStore = await cookies();
    return cookieStore.get("admin-session")?.value;
}
