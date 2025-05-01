document.addEventListener('DOMContentLoaded', function () {
  // ✅ Μήνυμα επιτυχούς αποστολής φόρμας
  const form = document.getElementById('contact-form');
  if (form) {
      form.addEventListener('submit', function(e) {
          e.preventDefault();
          document.getElementById('message').textContent = "Το μήνυμά σας εστάλη επιτυχώς!";
          this.reset();
      });
  }

  // ✅ Toggle για mobile menu
  window.toggleMenu = function() {
      const nav = document.getElementById("main-nav");
      nav.style.display = nav.style.display === "flex" ? "none" : "flex";
  }

  // ✅ Mobile dropdown συμπεριφορά (διπλό tap για πλοήγηση)
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
      const dropdowns = document.querySelectorAll('.dropdown');

      dropdowns.forEach(dropdown => {
          const link = dropdown.querySelector('.dropdown-toggle');
          const content = dropdown.querySelector('.dropdown-content');
          let tapped = false;

          link.addEventListener('click', function(e) {
              if (!tapped) {
                  e.preventDefault();

                  // Κλείσε άλλα dropdowns
                  document.querySelectorAll('.dropdown-content').forEach(menu => {
                      if (menu !== content) {
                          menu.style.display = 'none';
                      }
                  });

                  content.style.display = 'block';
                  tapped = true;

                  // Reset tap state μετά από λίγο
                  setTimeout(() => tapped = false, 1500);
              } else {
                  // 2ο tap => κανονική πλοήγηση
                  window.location.href = this.getAttribute('href');
              }
          });

          // Κλείσιμο dropdown αν κάνεις κλικ έξω
          document.addEventListener('click', function(e) {
              if (!dropdown.contains(e.target)) {
                  content.style.display = 'none';
              }
          });
      });
  }
});
