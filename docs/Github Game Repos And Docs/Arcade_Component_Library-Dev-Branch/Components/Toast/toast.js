const bottomToast = document.getElementById("bottom-toast");
const topToast = document.getElementById("top-toast");
const showTopToast = document.getElementById("show-top-toast");
const showBottomToast = document.getElementById("show-bottom-toast");
const dismissBtmToast = document.getElementById("dismiss-btmtoast-btn");
const dismissTopToast = document.getElementById("dismiss-toptoast-btn");

const removeToast = (toast) => {
    toast.setAttribute("style", "display:none");
}

const showToast = (toast) => {
    toast.setAttribute("style", "display:flex");
    if (window.getComputedStyle(toast).display === "none") {
        return;
    } else {
        setTimeout(() => {
            removeToast(toast);
        }, 3000);
    }
}

showBottomToast.addEventListener("click", () => showToast(bottomToast))
showTopToast.addEventListener("click", () => showToast(topToast))
dismissBtmToast.addEventListener("click", () => removeToast(bottomToast))
dismissTopToast.addEventListener("click", () => removeToast(topToast))

// how to dismiss toast properly?