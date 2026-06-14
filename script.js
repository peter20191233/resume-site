console.log("Сайт-резюме загружен");

const links = document.querySelectorAll('a[href^="#"]');

links.forEach(function(link) {
  link.addEventListener("click", function(event) {
    event.preventDefault();

    const targetId = link.getAttribute("href");
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth"
      });
    }
  });
});