const API_URL = "https://pokeapi.co/api/v2/pokemon/";


// ==========================================
// DADOS SALVOS
// ==========================================

let favorites = JSON.parse(
    localStorage.getItem("pokevaultFavorites")
) || [];

let collection = JSON.parse(
    localStorage.getItem("pokevaultCollection")
) || [];


// ==========================================
// BUSCAR POKÉMON
// ==========================================

async function getPokemon(name) {

    try {

        const response = await fetch(
            `${API_URL}${name.toString().toLowerCase()}`
        );

        if (!response.ok) {
            throw new Error("Pokémon não encontrado.");
        }

        return await response.json();

    } catch (error) {

        console.error(
            "Erro ao buscar Pokémon:",
            error
        );

        return null;
    }
}


// ==========================================
// POKÉMON DO HERO
// ==========================================

async function loadHeroPokemon() {

    const pokemon = await getPokemon("gengar");

    if (!pokemon) return;

    const heroImage =
        document.getElementById("hero-pokemon");

    heroImage.src =
        pokemon.sprites.other["official-artwork"].front_default;

    heroImage.alt =
        pokemon.name;
}


// ==========================================
// VERIFICAR FAVORITO
// ==========================================

function isFavorite(id) {

    return favorites.includes(id);

}


// ==========================================
// VERIFICAR COLEÇÃO
// ==========================================

function isInCollection(id) {

    return collection.includes(id);

}


// ==========================================
// SALVAR DADOS
// ==========================================

function saveData() {

    localStorage.setItem(
        "pokevaultFavorites",
        JSON.stringify(favorites)
    );

    localStorage.setItem(
        "pokevaultCollection",
        JSON.stringify(collection)
    );

}


// ==========================================
// ATUALIZAR ESTATÍSTICAS
// ==========================================

function updateStats() {

    const collectionCount =
        document.getElementById("collection-count");

    const favoritesCount =
        document.getElementById("favorites-count");

    const pokedexProgress =
        document.getElementById("pokedex-progress");


    collectionCount.textContent =
        collection.length;


    favoritesCount.textContent =
        favorites.length;


    const percentage =
        Math.min(
            (collection.length / 1025) * 100,
            100
        );


    pokedexProgress.textContent =
        percentage.toFixed(1) + "%";

}


// ==========================================
// FAVORITAR
// ==========================================

async function toggleFavorite(id, button) {

    if (isFavorite(id)) {

        favorites =
            favorites.filter(
                pokemonId => pokemonId !== id
            );

        button.textContent = "♡";

        button.classList.remove("favorite-active");

    } else {

        favorites.push(id);

        button.textContent = "♥";

        button.classList.add("favorite-active");

    }


    saveData();

    updateStats();

    await renderSavedPokemon();

}


// ==========================================
// ADICIONAR À COLEÇÃO
// ==========================================

async function toggleCollection(id, button) {

    if (isInCollection(id)) {

        collection =
            collection.filter(
                pokemonId => pokemonId !== id
            );

        button.textContent =
            "Adicionar à coleção";

        button.classList.remove("collection-active");

    } else {

        collection.push(id);

        button.textContent =
            "✓ Na coleção";

        button.classList.add("collection-active");

    }


    saveData();

    updateStats();

    await renderSavedPokemon();

}


// ==========================================
// CRIAR CARD
// ==========================================

function createPokemonCard(pokemon) {

    const card =
        document.createElement("div");

    card.className =
        "pokemon-card";


    const favorite =
        isFavorite(pokemon.id);

    const collected =
        isInCollection(pokemon.id);


    card.innerHTML = `

        <button
            class="favorite-button ${favorite ? "favorite-active" : ""}"
            title="Favoritar"
        >
            ${favorite ? "♥" : "♡"}
        </button>


        <img
            src="${pokemon.sprites.other["official-artwork"].front_default}"
            alt="${pokemon.name}"
        >


        <div class="pokemon-number">
            #${String(pokemon.id).padStart(3, "0")}
        </div>


        <div class="pokemon-name">
            ${pokemon.name}
        </div>


        <div class="pokemon-types">

            ${pokemon.types.map(type => `

                <span class="type">
                    ${type.type.name}
                </span>

            `).join("")}

        </div>


        <button
            class="collection-button ${collected ? "collection-active" : ""}"
        >
            ${collected ? "✓ Na coleção" : "Adicionar à coleção"}

        </button>

    `;


    // Botão favorito

    const favoriteButton =
        card.querySelector(".favorite-button");


    favoriteButton.addEventListener(
        "click",
        () => {

            toggleFavorite(
                pokemon.id,
                favoriteButton
            );

        }
    );


    // Botão coleção

    const collectionButton =
        card.querySelector(".collection-button");


    collectionButton.addEventListener(
        "click",
        () => {

            toggleCollection(
                pokemon.id,
                collectionButton
            );

        }
    );


    return card;
}


// ==========================================
// CARREGAR POKÉMON
// ==========================================

async function loadPokemonList() {

    const grid =
        document.getElementById("pokemon-grid");


    grid.innerHTML = `

        <div class="loading">
            Carregando Pokémon...
        </div>

    `;


    const pokemonList = [];


    for (let i = 1; i <= 20; i++) {

        const pokemon =
            await getPokemon(i);


        if (pokemon) {

            pokemonList.push(pokemon);

        }

    }


    grid.innerHTML = "";


    pokemonList.forEach(
        pokemon => {

            const card =
                createPokemonCard(pokemon);

            grid.appendChild(card);

        }
    );

}


// ==========================================
// MOSTRAR FAVORITOS E COLEÇÃO
// ==========================================

async function renderSavedPokemon() {

    const favoritesGrid =
        document.getElementById("favorites-grid");

    const collectionGrid =
        document.getElementById("collection-grid");


    favoritesGrid.innerHTML = "";

    collectionGrid.innerHTML = "";


    // FAVORITOS

    if (favorites.length === 0) {

        favoritesGrid.innerHTML = `

            <div class="empty-message">

                <div class="empty-icon">
                    ♡
                </div>

                <h3>
                    Nenhum favorito ainda
                </h3>

                <p>
                    Clique no coração de um Pokémon
                    para adicioná-lo aos favoritos.
                </p>

            </div>

        `;

    } else {

        for (const id of favorites) {

            const pokemon =
                await getPokemon(id);

            if (pokemon) {

                favoritesGrid.appendChild(
                    createPokemonCard(pokemon)
                );

            }

        }

    }


    // COLEÇÃO

    if (collection.length === 0) {

        collectionGrid.innerHTML = `

            <div class="empty-message">

                <div class="empty-icon">
                    ◈
                </div>

                <h3>
                    Sua coleção está vazia
                </h3>

                <p>
                    Explore a Pokédex e adicione
                    seus Pokémon à coleção.
                </p>

            </div>

        `;

    } else {

        for (const id of collection) {

            const pokemon =
                await getPokemon(id);

            if (pokemon) {

                collectionGrid.appendChild(
                    createPokemonCard(pokemon)
                );

            }

        }

    }

}


// ==========================================
// PESQUISA
// ==========================================

async function searchPokemon() {

    const input =
        document.getElementById("search-input");


    const grid =
        document.getElementById("pokemon-grid");


    const search =
        input.value.trim().toLowerCase();


    if (!search) {

        loadPokemonList();

        return;

    }


    grid.innerHTML = `

        <div class="loading">
            Procurando...
        </div>

    `;


    const pokemon =
        await getPokemon(search);


    if (!pokemon) {

        grid.innerHTML = `

            <div class="loading">
                Pokémon não encontrado 😢
            </div>

        `;

        return;

    }


    grid.innerHTML = "";


    grid.appendChild(
        createPokemonCard(pokemon)
    );

}


// ==========================================
// BOTÃO EXPLORAR
// ==========================================

const exploreButton =
    document.getElementById("explore-button");


exploreButton.addEventListener(
    "click",
    () => {

        document
            .getElementById("pokedex")
            .scrollIntoView({
                behavior: "smooth"
            });

    }
);


// ==========================================
// BOTÃO MINHA COLEÇÃO
// ==========================================

const collectionButton =
    document.getElementById("collection-button");


collectionButton.addEventListener(
    "click",
    () => {

        document
            .getElementById("my-collection")
            .scrollIntoView({
                behavior: "smooth"
            });

    }
);


// ==========================================
// BOTÃO VER COLEÇÃO
// ==========================================

const viewCollectionButton =
    document.getElementById(
        "view-collection-button"
    );


viewCollectionButton.addEventListener(
    "click",
    () => {

        document
            .getElementById("my-collection")
            .scrollIntoView({
                behavior: "smooth"
            });

    }
);


// ==========================================
// BOTÃO PESQUISAR
// ==========================================

const searchButton =
    document.getElementById("search-button");


searchButton.addEventListener(
    "click",
    searchPokemon
);


// ==========================================
// ENTER NA PESQUISA
// ==========================================

const searchInput =
    document.getElementById("search-input");


searchInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            searchPokemon();

        }

    }
);


// ==========================================
// INICIAR
// ==========================================

loadHeroPokemon();

loadPokemonList();

renderSavedPokemon();

updateStats();
