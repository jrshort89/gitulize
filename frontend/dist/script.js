document.addEventListener("DOMContentLoaded", () => {
    const url = "http://localhost:3000"
    new Visualize(url);
    new GitCommand(url);
})