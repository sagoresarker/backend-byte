/**
 * Client-side category filter for the posts listing page.
 * Uses data-category attributes on list items — no framework needed.
 */
(function () {
  'use strict';

  var pills = document.querySelectorAll('.filter-pill');
  var items = document.querySelectorAll('.post-list__item');

  if (!pills.length || !items.length) return;

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      var filter = this.getAttribute('data-filter');

      // Update active pill
      pills.forEach(function (p) { p.classList.remove('is-active'); });
      this.classList.add('is-active');

      // Show/hide items
      items.forEach(function (item) {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}());
