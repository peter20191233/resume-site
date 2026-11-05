// Author: Petr Korytov. Accessible native dialog for the existing full BandLink profile.
(() => {
  const dialog = document.getElementById("music-player");
  const openButton = document.querySelector("[data-open-music-player]");
  const closeButton = dialog?.querySelector("[data-close-music-player]");
  const frame = dialog?.querySelector("iframe");
  const profileSrc = frame?.getAttribute("src");
  if (!dialog || !openButton || !closeButton) return;

  openButton.addEventListener("click", () => {
    if (typeof dialog.showModal !== "function") {
      window.open("https://band.link/petrkorytov", "_blank", "noopener,noreferrer");
      return;
    }
    if (!dialog.open) {
      if (frame && profileSrc && frame.getAttribute("src") !== profileSrc) frame.src = profileSrc;
      dialog.showModal();
      document.body.classList.add("music-player-open");
    }
  });
  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    document.body.classList.remove("music-player-open");
    // Unload the cross-origin player so music cannot continue invisibly after closing.
    if (frame) frame.src = "about:blank";
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
})();
