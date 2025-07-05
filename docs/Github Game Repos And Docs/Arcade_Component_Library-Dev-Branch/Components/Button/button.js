const starToggleBtn = document.getElementById("star-toggle-btn");

starToggleBtn.setAttribute("style", "color: var(--light-grey)")
starToggleBtn.addEventListener("click", () => {
    console.log("MEOW")
    if (starToggleBtn.style.color === "var(--yellow-color)") {
        starToggleBtn.setAttribute("style", "color: var(--light-grey)")
    }
    else {
        starToggleBtn.setAttribute("style", "color: var(--yellow-color)")
    }
})