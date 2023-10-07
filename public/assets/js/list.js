import cardModule from "./card.js";
import utilsModule from "./utils.js";

const listModule = {
    base_url: null,
    setBaseUrl(url) {
        // this est le contexte - correspond à mon module
        this.base_url = url;
    },
    // Ouverture de la popup pour ajouter une liste
    showAddModal() {
        // j'ajoute la class "is-active" qui permet d'afficher la modal
        document.querySelector("#addListModal").classList.add("is-active");
    },
    // gestion de l'affichage du formulaire d'édition
    showEditForm(event) {
        // je masque le titre
        event.target.classList.add("is-hidden");

        // j'affiche le formulaire
        event.target.nextElementSibling.classList.remove("is-hidden");
    },
    // Gestion du formulaire pour ajouter une liste
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
            response = await fetch(`${listModule.base_url}/lists`, {
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

        if (response && response.ok) {
            // je récupère la nouvelle liste créée dans mon API
            const list = await response.json();
            console.log(`📋Liste créée`);
            // J'ajoute le code HTML
            listModule.makeInDOM(list);
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
            response = await fetch(`${listModule.base_url}/lists/${formData.get("list-id")}`, {
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

        // Je récupère le code HTML de ma liste
        const listHTML = document.querySelector(`[data-list-id="${formData.get("list-id")}"]`);

        if (response && response.ok) {
            const list = await response.json();
            console.log(`📋Liste modifiée`);
            // Je mets à jour le titre de la liste
            listHTML.querySelector(`h2`).textContent = list.name;
        }

        // Je masque le formulaire
        listHTML.querySelector(`form`).classList.add("is-hidden");

        // J'affiche le titre de la liste
        listHTML.querySelector(`h2`).classList.remove("is-hidden");

    },
    async handleDelete(event) {
        // popup qui demande une confirmation
        if (window.confirm("Souhaitez-vous vraiment supprimer cette liste et les cartes associées ?")) {
            // la réponse est oui, je supprime la carte

            const listHTML = event.target.closest("[data-list-id]");
            const listId = listHTML.dataset.listId;

            let response;
            try {
                // J'envoie les données du formulaire à l'API
                response = await fetch(`${listModule.base_url}/lists/${listId}`, {
                    method: "DELETE"
                });
            }
            catch (err) {
                console.error(err);
            }

            if (response && response.ok) {
                // je supprime le code HTML
                listHTML.remove();
                console.log(`📋Liste supprimée`);
            }
        }
    },
    // Ajout d'une liste HTML dans notre page
    makeInDOM(list) {
        // Je récupère le template
        const template = document.querySelector("#list-template");

        // Je clone le template
        const newList = document.importNode(template.content, true);

        // Toujours utiliser textContent plutôt que innerHTML (pour éviter des problèmes de sécurité)
        newList.querySelector("h2").textContent = list.name;
        newList.querySelector(".panel").dataset.listId = list.id;

        // je mets à jour les valeurs dans le formulaire
        // mon querySelector va faire une requête sur un élément qui a un attribut "name" avec la valeur "list-id" et "list-name"
        newList.querySelector('[name="list-id"]').value = list.id;
        newList.querySelector('[name="name"]').value = list.name;

        // Je place un événement sur le bouton "valider" du formulaire d'édition
        newList.querySelector("form").addEventListener("submit", listModule.handleEditForm);

        // Je place un événement sur le bouton +
        newList.querySelector("#edit-button").addEventListener("click", cardModule.showAddModal);
        // Je place l'événement de suppression de la carte
        newList.querySelector("#delete-button").addEventListener("click", listModule.handleDelete);

        // Je place un événement sur le titre
        newList.querySelector("h2").addEventListener("dblclick", listModule.showEditForm);

        // Je viens ajouter ma liste tout à gauche de la liste de listes
        // (je récupère la première liste et je place ma liste juste avant)
        //document.querySelector("#lists .panel").before(newList);

        const listContainer = document.querySelector("#lists");
        listContainer.insertBefore(newList, listContainer.firstChild);
    },
};

export default listModule;