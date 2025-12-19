document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const loginIdInput = document.getElementById("loginId");
  const passwordInput = document.getElementById("password");

  // Supabase is initialized in config.js
  // const supabase = window.supabase.createClient(...)

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const loginId = loginIdInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    let emailToLogin = loginId;

    // Check if input is NOT an email → treat as username
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginId);

    if (!isEmail) {
      // Lookup email from profiles table using username
      const { data: profile, error } = await supabaseClient
        .from("profiles")
        .select("email")
        .eq("username", loginId)
        .maybeSingle();

      if (error || !profile) {
        alert("Username not found. Please check and try again.");
        return;
      }

      emailToLogin = profile.email;
    }

    // Now login using email + password
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: emailToLogin,
      password,
    });

    if (error) {
      alert("Login failed: Invalid email or password.");
    } else {
      alert("Login successful!");
      window.location.href = "dashboard.html"; // or your dashboard/home page
    }
  });
});
