(function () {
  function closeDesktopMenus(except) {
    document.querySelectorAll('.nav-item[data-open="true"]').forEach(function (item) {
      if (item !== except) {
        item.dataset.open = 'false';
        var button = item.querySelector('[aria-expanded]');
        if (button) button.setAttribute('aria-expanded', 'false');
      }
    });
  }

  document.querySelectorAll('[data-dropdown-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      var item = button.closest('.nav-item');
      var willOpen = item.dataset.open !== 'true';
      closeDesktopMenus(item);
      item.dataset.open = String(willOpen);
      button.setAttribute('aria-expanded', String(willOpen));
    });
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.nav-item')) closeDesktopMenus();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeDesktopMenus();
      document.querySelectorAll('[data-mobile-toggle][aria-expanded="true"]').forEach(function (button) {
        var menu = document.getElementById(button.getAttribute('aria-controls'));
        button.setAttribute('aria-expanded', 'false');
        if (menu) menu.hidden = true;
        button.focus();
      });
    }
  });

  document.querySelectorAll('[data-mobile-toggle]').forEach(function (button) {
    var menu = document.getElementById(button.getAttribute('aria-controls'));
    if (!menu) return;

    button.addEventListener('click', function () {
      var willOpen = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(willOpen));
      menu.hidden = !willOpen;
      if (willOpen) {
        var firstLink = menu.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });

    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        button.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
      }
    });
  });

  document.querySelectorAll('form[action="https://api.web3forms.com/submit"]').forEach(function (form) {
    var feedback = form.querySelector('.form-feedback');
    if (!feedback) {
      feedback = document.createElement('p');
      feedback.className = 'form-feedback';
      feedback.setAttribute('role', 'status');
      feedback.setAttribute('aria-live', 'polite');
      form.appendChild(feedback);
    }

    form.addEventListener('invalid', function () {
      feedback.dataset.state = 'error';
      feedback.textContent = 'Please complete the required fields and check your entries.';
    }, true);

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      var button = form.querySelector('button[type="submit"]');
      var originalLabel = button ? button.textContent : '';
      feedback.dataset.state = '';
      feedback.textContent = 'Sending your inquiry...';
      if (button) {
        button.disabled = true;
        button.textContent = 'Sending...';
      }
      form.setAttribute('aria-busy', 'true');

      try {
        var response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        var result = await response.json();
        if (!response.ok || !result.success) throw new Error('Submission failed');
        form.reset();
        feedback.dataset.state = 'success';
        feedback.textContent = 'Thank you. Your inquiry has been sent successfully.';
      } catch (error) {
        feedback.dataset.state = 'error';
        feedback.textContent = 'We could not send your inquiry. Please try again shortly.';
      } finally {
        form.removeAttribute('aria-busy');
        if (button) {
          button.disabled = false;
          button.textContent = originalLabel;
        }
      }
    });
  });
}());
