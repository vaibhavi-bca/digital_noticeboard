const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    console.log("Username being sent:", username);
    console.log("Password entered:", password);

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        console.log("HTTP status:", response.status);

        const data = await response.json();

        console.log("Server response:", data);

        if (data.success) {
            loginMessage.textContent = "Login successful!";
            window.location.href = "/admin.html";
        } else {
            loginMessage.textContent = data.message;
        }

    } catch (error) {
        console.error("Login error:", error);
        loginMessage.textContent = "Unable to connect to the server.";
    }
});