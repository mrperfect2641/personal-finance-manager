document.addEventListener("DOMContentLoaded", function () {
  // Element references
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const passwordToggle = document.getElementById("passwordToggle");
  const matchMessage = document.getElementById("match-message");
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");

  // Supabase initialization
  // Supabase is initialized in config.js
  // const supabase = window.supabase.createClient(...)

  // Password validation rules
  const rules = {
    length: document.getElementById("length-rule"),
    uppercase: document.getElementById("uppercase-rule"),
    lowercase: document.getElementById("lowercase-rule"),
    number: document.getElementById("number-rule"),
    special: document.getElementById("special-rule"),
  };

  // Show/hide password
  passwordToggle.addEventListener("click", function () {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
  });

  // Update rule visuals
  function updateRule(ruleElement, isValid) {
    if (isValid) {
      ruleElement.classList.remove("invalid");
      ruleElement.classList.add("valid");
      ruleElement.querySelector("i").className = "fas fa-check-circle";
    } else {
      ruleElement.classList.remove("valid");
      ruleElement.classList.add("invalid");
      ruleElement.querySelector("i").className = "fas fa-circle";
    }
  }

  // Validate individual rules
  function validatePassword(password) {
    updateRule(rules.length, password.length >= 8);
    updateRule(rules.uppercase, /[A-Z]/.test(password));
    updateRule(rules.lowercase, /[a-z]/.test(password));
    updateRule(rules.number, /\d/.test(password));
    updateRule(rules.special, /[!@#$%^&*(),.?":{}|<>]/.test(password));
  }

  // Check if passwords match
  function checkPasswordMatch() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password === confirmPassword && password !== "") {
      matchMessage.classList.remove("invalid");
      matchMessage.classList.add("valid");
      matchMessage.innerHTML =
        '<i class="fas fa-check-circle"></i> Passwords match';
    } else {
      matchMessage.classList.remove("valid");
      matchMessage.classList.add("invalid");
      matchMessage.innerHTML =
        '<i class="fas fa-times-circle"></i> Passwords must match';
    }
  }

  passwordInput.addEventListener("input", function () {
    validatePassword(this.value);
    checkPasswordMatch();
  });

  confirmPasswordInput.addEventListener("input", checkPasswordMatch);

  // FORM SUBMISSION
  document
    .getElementById("signupForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = emailInput.value.trim().toLowerCase();
      const username = usernameInput.value.trim().toLowerCase();
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      const allRulesValid = Object.values(rules).every((rule) =>
        rule.classList.contains("valid")
      );
      const passwordsMatch = password === confirmPassword;

      if (!allRulesValid || !passwordsMatch) {
        alert(
          "Please complete all password requirements and make sure passwords match."
        );
        return;
      }

      // 1️⃣ Check if username already exists in 'profiles' table
      const { data: userWithUsername } = await supabaseClient
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (userWithUsername) {
        document
          .getElementById("usernameExistsModal")
          .classList.remove("d-none");
        return;
      }

      // 2️⃣ Check if email is already registered in auth.users
      const { data: emailCheck, error: emailError } =
        await supabaseClient.auth.signInWithPassword({
          email,
          password: "dummy", // invalid password just to test existence
        });

      if (!emailError?.message.includes("Invalid login credentials")) {
        document.getElementById("emailExistsModal").classList.remove("d-none");
        return;
      }

      // 3️⃣ Register user with auth
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert("Signup failed: " + error.message);
        return;
      }

      const user = data.user;
      if (!user) {
        alert("Signup succeeded, but user not returned.");
        return;
      }

      // 4️⃣ Insert user into 'profiles' table
      const { error: profileError } = await supabaseClient.from("profiles").insert([
        {
          id: user.id,
          username: username,
          email: email,
        },
      ]);

      if (profileError) {
        alert("Profile insert failed: " + profileError.message);
        return;
      }

      alert("Signup successful! You may now log in.");
      window.location.href = "login.html";
    });

  // Modal button handlers
  window.closeUsernameModal = () => {
    document.getElementById("usernameExistsModal").classList.add("d-none");
  };

  window.closeEmailModal = () => {
    document.getElementById("emailExistsModal").classList.add("d-none");
  };

  window.redirectToLogin = () => {
    window.location.href = "login.html";
  };
});
