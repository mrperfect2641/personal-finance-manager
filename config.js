const SUPABASE_URL = "https://teafrrntffzraoiuurie.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlYWZycm50ZmZ6cmFvaXV1cmllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1OTMwMzgsImV4cCI6MjA2OTE2OTAzOH0.EZ7Lkxo_H1lZMMMH9OmjqKm3ALcIRripTzYrz7FosZs";

// Create a single supabase instance to be used across the app
// Check if supabase global exists (it should be loaded from CDN)
let supabaseClient;
if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("Supabase Client initialized successfully");
} else {
    console.error("Supabase library not found! Make sure the CDN script is loaded before config.js");
}
