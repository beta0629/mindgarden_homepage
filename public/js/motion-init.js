(function () {
  try {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") return;
    document.documentElement.classList.add("motion-ready");
  } catch (error) {
    return error;
  }
})();
