import { supabase } from "./src/lib/supabase";

async function checkLogs() {
    const { count, error } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true });
    
    if (error) {
        console.error("Error checking logs:", error);
    } else {
        console.log(`Current total logs in database: ${count}`);
    }
}

checkLogs();
