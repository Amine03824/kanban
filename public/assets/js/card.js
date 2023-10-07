import utilsModule from "./utils.js";

const cardModule = {
    base_url: null,
    setBaseUrl(url) {
        this.base_url = url;
    },
    // Ouverture de la popup pour ajouter une carte
    showAddModal(event) {

        // je récupère l'id de ma liste
        const listHTML = event.target.closest(".panel");

        // je récupère ma modal
        const cardModal = document.querySelector("#addCardModal")

        // je mets à jour le champ input avec l'id de ma liste
        // console.log(listHTML.dataset["list-id"]);
        cardModal.querySelector('form input[name="list_id"]').value = listHTML.dataset.listId;

        // j'ajoute la class "is-active" qui permet d'afficher la modal
        cardModal.classList.add("is-active");
    },
    // gestion de l'affichage du formulaire d'édition
    showEditForm(event) {
        // je récupère ma carte
        const cardHTML = event.target.closest(".box");

        // je masque le titre
        cardHTML.querySelector("#name").classList.add("is-hidden");

        // j'affiche le formulaire
        cardHTML.querySelector("form").classList.remove("is-hidden");
    },
    async handleAddForm(event) {
        // Je stoppe le comportement par défaut
        event.preventDefault();

        // Je récupère les valeurs de mon formulaire
        const formData = new FormData(event.target);
        // Je convertis mon FormData en JSON
        const object = {};
        formData.forEach((value, key) => object[key] = value);
        /*
          object = {
            name:"test2"
          }
        */
        // je viens stringifier, je convertis mon objet en JSON
        const json = JSON.stringify(object);
        console.log(json);
        let response;
        try {
            // J'envoie les données du formulaire à l'API
            response = await fetch(`${cardModule.base_url}/cards`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: json
            });
        }
        catch (err) {
            console.error(err);
        }

        if (response.ok) {
            // je récupère la nouvelle liste créée dans mon API
            const card = await response.json();
            console.log(`🃏Carte créée`);
            // J'ajoute le code HTML
            cardModule.makeInDOM(card);
        }

        // je reset le formulaire
        event.target.reset();

        // Je masque la modal
        utilsModule.hideModals();
    },
    // Edition d'une liste
    async handleEditForm(event) {
        // Je stoppe le comportement par défaut
        event.preventDefault();

        // Je récupère les valeurs de mon formulaire
        const formData = new FormData(event.target);

        // Je convertis mon FormData en JSON
        const object = {};
        formData.forEach((value, key) => object[key] = value);
        /*
          object = {
            name:"test2"
          }
        */
        // je viens stringifier, je convertis mon objet en JSON
        const json = JSON.stringify(object);
        console.log(json);
        let response;
        try {
            // J'envoie les données du formulaire à l'API
            response = await fetch(`${cardModule.base_url}/cards/${formData.get("card-id")}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: json
            });
        }
        catch (err) {
            console.error(err);
        }

        // Je récupère le code HTML de ma carte
        const cardHTML = document.querySelector(`[data-card-id="${formData.get("card-id")}"]`);

        if (response && response.ok) {
            const card = await response.json();
            console.log(`🃏Carte modifiée`);
            // Je mets à jour le titre de la carte
            cardHTML.querySelector(`#name`).textContent = card.title;
            
            cardHTML.style["background-color"] = card.color;
        }

        // Je masque le formulaire
        cardHTML.querySelector(`form`).classList.add("is-hidden");

        // J'affiche le titre de la carte
        cardHTML.querySelector(`#name`).classList.remove("is-hidden");

    },
    async handleDelete(event) {
        if (window.confirm("Souhaitez-vous vraiment supprimer cette carte ?")) {
            // la réponse est oui, je supprime la carte

            const cardHTML = event.target.closest(".box");
            const cardId = cardHTML.dataset.cardId;

            let response;
            try {
                // J'envoie les données du formulaire à l'API
                response = await fetch(`${cardModule.base_url}/cards/${cardId}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    }
                });
            }
            catch (err) {
                console.error(err);
            }

            if(response && response.ok){
                console.log(`🃏Carte supprimée`);
                // je supprime le code HTML
                cardHTML.remove();
                
            }
        }
    },
    // Ajout d'une carte HTML dans notre page
    makeInDOM(card) {
        // Je récupère le template
        const template = document.querySelector("#card-template");

        // Je clone le template
        const newCard = document.importNode(template.content, true);

        // Toujours utiliser textContent plutôt que innerHTML (pour éviter des problèmes de sécurité)
        newCard.querySelector("#name").textContent = card.title;
        newCard.querySelector(".box").dataset.cardId = card.id;
        newCard.querySelector(".box").style["background-color"] = card.color;

        // je mets à jour les valeurs dans le formulaire
        newCard.querySelector('[name="card-id"]').value = card.id;
        newCard.querySelector('[name="title"]').value = card.title;
        newCard.querySelector('[name="color"]').value = card.color;

        // Je place un événement sur le bouton "valider" du formulaire d'édition
        newCard.querySelector("form").addEventListener("submit", cardModule.handleEditForm);

        // Je place l'événement d'édition de la carte
        newCard.querySelector("#edit-button").addEventListener("click", cardModule.showEditForm);
        // Je place l'événement de suppression de la carte
        newCard.querySelector("#delete-button").addEventListener("click", cardModule.handleDelete);

        // Je récupère le conteneur de cartes
        const cardContainer = document.querySelector(`[data-list-id="${card.list_id}"] .panel-block`);
        // J'ajoute ma carte en premier
        cardContainer.appendChild(newCard);
    }
};

export default cardModule;