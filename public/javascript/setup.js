// public/javascript/setup.js
const setupForm = document.querySelector("#setup-form");
const submitButton = setupForm.querySelector("button");
const successText = submitButton.dataset.successText;

setupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Connecting...";

  try {
    const formData = new FormData(setupForm);
    const payload = Object.fromEntries(formData.entries());
    const setupType = window.location.pathname
      .split("/")
      .pop()
      .replace("-setup.html", "");

    await window.gardenGuardApi.saveDeviceSetup(setupType, payload);
    submitButton.textContent = successText || "Connected!";
  } catch (error) {
    console.error("Firebase setup error:", error);
    submitButton.textContent = "Connection failed";
    setTimeout(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }, 2000);
  }
});