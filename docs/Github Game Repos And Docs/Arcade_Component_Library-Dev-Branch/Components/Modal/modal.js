const modalBtnDemo = document.querySelector("#modal-btn-demo");
const modalBtnClose = document.getElementById("modal-btn-close");
const modalBtnCancel = document.getElementById("modal-btn-cancel");
const modalBtnOk = document.getElementById("modal-btn-ok");
const modalWrapper = document.getElementById("modal-wrapper");

const removeModal = () => modalWrapper.setAttribute("style", "display: none");

modalBtnDemo.addEventListener("click", () => {
    modalWrapper.setAttribute("style", "display: flex");
});

modalBtnCancel.addEventListener("click", () => {
    removeModal();
});

modalBtnClose.addEventListener("click", () => {
    removeModal();
});

modalBtnOk.addEventListener("click", () => {
    removeModal();
});