const star1 = document.getElementById("star-1");
const star2 = document.getElementById("star-2");
const star3 = document.getElementById("star-3");
const star4 = document.getElementById("star-4");
const star5 = document.getElementById("star-5");
const resetBtn = document.getElementById("rating-reset-btn");
const displayValue = document.getElementById("rating-val");

const ratingArray = [
    star1, star2, star3, star4, star5
]

star1.addEventListener("click", () => colorStars(1));
star2.addEventListener("click", () => colorStars(2));
star3.addEventListener("click", () => colorStars(3));
star4.addEventListener("click", () => colorStars(4));
star5.addEventListener("click", () => colorStars(5));

const colorStars = (starNum) => {
    let i = 0;
    for (i = 0; i < starNum; i++) {
        ratingArray[i].setAttribute("style", "color: var(--yellow-color)")
    }
    while (i !== 5) {
        ratingArray[i].setAttribute("style", "color: var(--grey)")
        i++;
    }
    displayValue.innerHTML = `Rating: ${starNum}`
}

resetBtn.addEventListener("click", () => colorStars(0))