/**
 * Table of contents scroll spy.
 * Highlights the ToC link matching the heading currently in view.
 */
(function () {
  'use strict';

  var tocLinks = document.querySelectorAll('.post-toc a');
  if (!tocLinks.length) return;

  var headings = [];
  tocLinks.forEach(function (link) {
    var id = link.getAttribute('href');
    if (!id || id.charAt(0) !== '#') return;
    var el = document.getElementById(id.slice(1));
    if (el) headings.push({ el: el, link: link });
  });

  if (!headings.length) return;

  function onScroll() {
    var scrollY = window.scrollY + 100; // offset for sticky header
    var active = headings[0];

    headings.forEach(function (h) {
      if (h.el.offsetTop <= scrollY) {
        active = h;
      }
    });

    tocLinks.forEach(function (l) { l.classList.remove('active'); });
    if (active) active.link.classList.add('active');
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}());
