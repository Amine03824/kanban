const utils = {
  // Fermeture de toutes les popup
  hideModals() {
    // j'enlève la class "is-active" qui permet de masquer la modal
    document.querySelectorAll(".modal").forEach(modal => modal.classList.remove("is-active"));
  },
};

export default utils;