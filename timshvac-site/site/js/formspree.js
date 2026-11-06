/*
 * Sends Webflow forms to Formspree via AJAX instead of the Webflow backend.
 *
 * Applies to every <form data-formspree action="https://formspree.io/f/...">.
 * It keeps the usual Webflow look: on success the form is hidden and
 * .w-form-done is shown, on error .w-form-fail is shown.
 * Without JS the form still works: the browser POSTs straight to Formspree.
 */
(function () {
  'use strict';

  function show(el, visible) {
    if (el) el.style.display = visible ? 'block' : 'none';
  }

  function bind(form) {
    var wrapper = form.closest('.w-form') || form.parentNode;
    var done = wrapper.querySelector('.w-form-done');
    var fail = wrapper.querySelector('.w-form-fail');
    var submit = form.querySelector('[type="submit"]');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      // Keep webflow.js from intercepting the submit and sending it to Webflow.
      event.stopImmediatePropagation();

      var action = form.getAttribute('action') || '';
      if (action.indexOf('formspree.io/f/') === -1 || action.indexOf('__') !== -1) {
        console.error('[formspree] Form ID not configured: set FORMSPREE_FORM_ID and rebuild the site.');
        show(fail, true);
        return;
      }

      var label = submit && submit.value;
      if (submit) {
        submit.disabled = true;
        if (submit.dataset.wait) submit.value = submit.dataset.wait;
      }
      show(fail, false);

      fetch(action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          form.reset();
          show(form, false);
          show(done, true);
        })
        .catch(function (err) {
          console.error('[formspree]', err);
          show(fail, true);
        })
        .then(function () {
          if (submit) {
            submit.disabled = false;
            submit.value = label;
          }
        });
    }, true);
  }

  function init() {
    var forms = document.querySelectorAll('form[data-formspree]');
    for (var i = 0; i < forms.length; i++) bind(forms[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
