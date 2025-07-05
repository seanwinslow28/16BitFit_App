const slider = document.getElementById("range-slider");
const output = document.getElementById("slider-value");

output.innerHTML = `Value: ${slider.value}`;

slider.oninput = () => output.innerHTML = `Value: ${slider.value}`;