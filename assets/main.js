// Menu mobile, tiroirs (être rappelé / pièces à fournir), effets et formulaires
(function () {
  var btn = document.querySelector(".menu-toggle");
  var nav = document.getElementById("menu");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Tiroirs latéraux
  var dernierFocus = null;
  function ouvrir(id) {
    var t = document.getElementById(id);
    if (!t) return;
    dernierFocus = document.activeElement;
    t.hidden = false;
    document.body.classList.add("tiroir-ouvert");
    var champ = t.querySelector(".tiroir-x");
    if (champ) champ.focus();
  }
  function fermer(t) {
    t.hidden = true;
    document.body.classList.remove("tiroir-ouvert");
    if (dernierFocus) dernierFocus.focus();
  }
  document.addEventListener("click", function (e) {
    var o = e.target.closest("[data-ouvre]");
    if (o) { e.preventDefault(); if (nav) nav.classList.remove("open"); ouvrir(o.getAttribute("data-ouvre")); return; }
    var f = e.target.closest("[data-ferme]");
    if (f) fermer(f.closest(".tiroir"));
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var t = document.querySelector(".tiroir:not([hidden])");
    if (t) fermer(t);
  });

  // Carrousel d'avis
  [].forEach.call(document.querySelectorAll(".rail-btn"), function (b) {
    b.addEventListener("click", function () {
      var rail = b.closest(".wrap").querySelector(".avis-rail");
      rail.scrollBy({ left: +b.dataset.rail * rail.clientWidth * 0.8, behavior: "smooth" });
    });
  });

  // Effets : en-tête, apparitions, parallaxe
  var calme = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var aVoir = [].slice.call(document.querySelectorAll(".revele, .galerie figure, .faq details, .avis-card, .section .t-cer"))
    .filter(function (e) { return !e.closest(".hero-wrap") && !e.closest(".tiroir"); });
  aVoir.forEach(function (e) {
    e.classList.add("revele");
    var freres = [].slice.call(e.parentNode.parentNode.children);
    var i = Math.max(freres.indexOf(e.parentNode), [].indexOf.call(e.parentNode.children, e));
    if (!e.style.getPropertyValue("--d")) e.style.setProperty("--d", Math.min(i, 5) * 90 + "ms");
  });
  var paraImgs = [].slice.call(document.querySelectorAll("[data-parallaxe-img]"));
  var compteurs = [].slice.call(document.querySelectorAll("[data-compte]"));
  var barre = document.querySelector(".progression");
  var voiture = document.querySelector(".voiture");

  function compter(el) {
    var fin = +el.dataset.compte, dec = +(el.dataset.decimales || 0);
    var dep = fin > 1000 ? fin - 50 : 0, suf = el.dataset.suffixe || "", t0 = Date.now(), duree = 1800;
    (function pas() {
      var k = Math.min(1, (Date.now() - t0) / duree), v = dep + (fin - dep) * (1 - Math.pow(1 - k, 3));
      el.textContent = (dec ? v.toFixed(dec).replace(".", ",") : Math.round(v)) + suf;
      if (k < 1) setTimeout(pas, 16);
    })();
  }

  // Inclinaison 3D qui suit la souris (ordinateur uniquement)
  if (!calme && window.matchMedia("(hover: hover)").matches) {
    [].forEach.call(document.querySelectorAll(".tuile-photo, .formule"), function (el) {
      el.classList.add("tilt");
      var reflet = document.createElement("span");
      reflet.className = "reflet";
      el.appendChild(reflet);
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transform = "perspective(900px) rotateX(" + ((0.5 - y) * 8).toFixed(2) + "deg) rotateY(" + ((x - 0.5) * 10).toFixed(2) + "deg) translateY(-4px)";
        el.style.setProperty("--mx", x * 100 + "%");
        el.style.setProperty("--my", y * 100 + "%");
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  function maj() {
    document.body.classList.toggle("scrolle", window.scrollY > 30);
    // certains navigateurs intégrés (WhatsApp, Messenger…) annoncent une hauteur nulle au chargement
    var h = window.innerHeight || document.documentElement.clientHeight || screen.height || 800;
    aVoir = aVoir.filter(function (e) {
      if (calme || e.getBoundingClientRect().top < h * 0.95) { e.classList.add("vu"); return false; }
      return true;
    });
    compteurs = compteurs.filter(function (e) {
      if (e.getBoundingClientRect().top < h * 0.92) { if (!calme) compter(e); return false; }
      return true;
    });
    var doc = document.documentElement, max = doc.scrollHeight - h;
    if (barre) barre.style.setProperty("--p", max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0);
    if (voiture && !calme) {
      var r = voiture.parentNode.getBoundingClientRect();
      var k = Math.max(0, Math.min(1, (h - r.top) / (h + r.height)));
      voiture.style.setProperty("--x", ((r.width - voiture.getBoundingClientRect().width) * k).toFixed(1) + "px");
    }
    if (!calme) paraImgs.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect();
      if (r.bottom > 0 && r.top < h) var lim = r.height * 0.07, v = Math.max(-lim, Math.min(lim, r.top * -0.12));
        el.style.transform = "translate3d(0," + v.toFixed(1) + "px,0)";
    });
  }
  window.addEventListener("scroll", maj, { passive: true });
  window.addEventListener("resize", maj);
  window.addEventListener("load", maj);
  document.addEventListener("visibilitychange", maj);
  maj();
  // filet de sécurité : rien ne doit rester invisible
  setTimeout(function () {
    aVoir.forEach(function (e) { e.classList.add("vu"); });
    aVoir = [];
  }, 2500);

  // Formulaires (contact + être rappelé)
  var params = new URLSearchParams(location.search);
  var pre = params.get("formation");
  [].forEach.call(document.querySelectorAll("form.js-form"), function (form) {
    if (pre && form.formation && form.formation.tagName === "SELECT") form.formation.value = pre;
    var status = form.querySelector(".form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form-status";
      if (!form.nom.value.trim() || !form.telephone.value.trim()) {
        status.textContent = "Merci d'indiquer votre nom et votre téléphone.";
        status.classList.add("err");
        return;
      }
      if (form.querySelector('input[type="radio"][required]') && !form.querySelector('input[name="formation"]:checked')) {
        status.textContent = "Merci de choisir une formation.";
        status.classList.add("err");
        return;
      }
      if (!form.consentement.checked) {
        status.textContent = "Merci de cocher la case d'accord.";
        status.classList.add("err");
        return;
      }
      var data = new FormData(form);
      var endpoint = form.getAttribute("action");
      if (endpoint) {
        status.textContent = "Envoi en cours…";
        fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (r) {
            if (!r.ok) throw new Error();
            form.reset();
            status.textContent = "Merci ! Votre demande est bien envoyée. Nous vous recontactons rapidement.";
            status.classList.add("ok");
          })
          .catch(function () {
            status.textContent = "L'envoi n'a pas fonctionné. Appelez-nous directement, nous sommes là pour vous aider.";
            status.classList.add("err");
          });
        return;
      }
      // Pas encore de service d'envoi : on ouvre la messagerie du visiteur
      var email = form.getAttribute("data-email");
      var lignes = {};
      data.forEach(function (v, k) { if (k !== "consentement" && v) lignes[k] = lignes[k] ? lignes[k] + ", " + v : v; });
      var corps = Object.keys(lignes).map(function (k) { return k + " : " + lignes[k]; }).join("\n");
      if (email) {
        location.href = "mailto:" + email + "?subject=" + encodeURIComponent((form.dataset.sujet || "Demande") + " – " + (data.get("demande") || "")) + "&body=" + encodeURIComponent(corps);
        status.textContent = "Votre messagerie s'ouvre : il ne reste qu'à envoyer le message.";
        status.classList.add("ok");
      } else {
        status.textContent = "Le formulaire sera bientôt actif. En attendant, appelez-nous : nous répondons à toutes vos questions.";
        status.classList.add("err");
      }
    });
  });
})();
