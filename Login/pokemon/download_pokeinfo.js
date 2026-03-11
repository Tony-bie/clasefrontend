let count_pokemon = 0
let pokemonDB = {}
let moveDB = {}

    
async function loadEveryPokemon() {
    const URL = 'https://pokeapi.co/api/v2/pokemon';

    const response_count = await fetch(URL);
    const pokemon_json = await response_count.json();
    count_pokemon = 900

    const ids = Array.from({ length: count_pokemon }, (_, i) => i + 1);

    const pokemons = await Promise.all(
        ids.map(id => fetch(`${URL}/${id}`).then(r => r.json()))
    );

    pokemons.forEach((pokemon, index) => {
        const id = index + 1;
        const moves_name = pokemon.moves.slice(0, 4).map(t => t.move.name);
        const types = pokemon.types.map(t => t.type.name).join(", ");

        pokemonDB[id] = {
            name: pokemon.name,
            sprite: pokemon.sprites.front_default,
            type: types,
            stats: {
                hp: pokemon.stats[0].base_stat,
                attack: pokemon.stats[1].base_stat,
                defense: pokemon.stats[2].base_stat,
                special_attack: pokemon.stats[3].base_stat,
                special_defense: pokemon.stats[4].base_stat,
                speed: pokemon.stats[5].base_stat
            },
            moves: moves_name.map(m => moveDB[m] ?? null),
            id: id
        };
    });
}


async function getMoves() {
    const URL = 'https://pokeapi.co/api/v2/move/?limit=919'

    const response_move = await fetch(URL)
    const move_json = await response_move.json()
    
    const moves = await Promise.all(
        move_json.results.map(m => fetch(m.url).then(r => r.json()))
    )

    moves.forEach(m => {
        moveDB[m.name] = {
            power: m.power ?? 0,
            type: m.type.name,
            accuracy: m.accuracy ?? 100,
            pp: m.pp,
            damage_class: m.damage_class.name
        }
    })
}


module.exports = { loadEveryPokemon, getMoves, pokemonDB };