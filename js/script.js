document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("helloBtn");
    const response = document.getElementById("response");

    button.addEventListener("click", () => {
        response.textContent = "Welcome to Tabibi!";
    });
});
