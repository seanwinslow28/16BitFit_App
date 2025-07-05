const fabToTop = document.getElementById('fab-totop')
const scrollContainer = document.getElementById('scroll-container')

fabToTop.addEventListener("click", () => {
    scrollContainer.scrollTo(0, 0);
})
