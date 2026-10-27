const setupForm = document.querySelector("#setup-form");
const submitButton = setupForm.querySelector("button");
const successText = submitButton.dataset.successText;

setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitButton.textContent = "Connecting...";

  setTimeout(() => {
    submitButton.textContent = successText;
  }, 700);
});
