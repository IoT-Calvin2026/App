const localTimeElements = document.querySelectorAll("[data-local-time]");

const updateLocalTime = () => {
  const currentTime = new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  localTimeElements.forEach((element) => {
    element.textContent = currentTime;
  });
};

updateLocalTime();
setInterval(updateLocalTime, 1000);
