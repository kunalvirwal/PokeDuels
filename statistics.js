async function pokemon_fetcher(query) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
    if (!res.ok) {
      return query + " is invalid";
    } else {
      let pokemon = await res.json();
      return pokemon;
    }
  } catch (error) {
    console.log("An error occured");
    console.log(error);
  }
}

async function search_pokemon_and_attacks(pokemon) {
  let attacks = [];
  for (let val of pokemon["moves"]) {
    if (
      val.version_group_details.some(
        (method) => method.move_learn_method.name === "level-up"
      )
    ) {
      let move_name = val["move"]["name"];
      let damage = await attack_damage(move_name);
      if (damage[1] != null) {
        attacks.push([move_name, damage[0], damage[1]]);
      }
    }
  }
  return attacks;
}

async function attack_damage(query) {
  const res = await fetch(`https://pokeapi.co/api/v2/move/${query}`);
  if (!res.ok) {
    return query + " is invalid";
  } else {
    let attack = await res.json();
    if (
      attack.damage_class.name == "physical" ||
      attack.damage_class.name == "special"
    ) {
      return [attack.damage_class.name, attack["power"]];
    } else {
      return [attack.damage_class.name, null];
    }
  }
}

function getHP(data) {
  for (let stat of data.stats) {
    if (stat.stat.name == "hp") {
      return Number(stat["base_stat"]);
    }
  }
}

function battle() {
  window.location.href = "battlepage.html";
}

async function setstats() {
  let health_multiplier = 5;

  let your_poke_res = await pokemon_fetcher(your_pokemon);
  let your_poke_id = your_poke_res.id;

  let opponent_poke_res = await pokemon_fetcher(opponent_pokemon);
  let opponent_poke_id = opponent_poke_res.id;


  let img1 = document.querySelector(".image1");
  img1.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${your_poke_id}.gif`;

  let img2 = document.querySelector(".image2");
  img2.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${opponent_poke_id}.gif`;

  let yourAttacks = await search_pokemon_and_attacks(your_poke_res);
  let yourHP = getHP(your_poke_res) * health_multiplier;

  let opponentAttacks = await search_pokemon_and_attacks(opponent_poke_res);
  let opponentHp = getHP(opponent_poke_res) * health_multiplier;

  let name1 = document.querySelector(".name1");
  name1.textContent = your_pokemon.toUpperCase();

  let name2 = document.querySelector(".name2");
  name2.textContent = opponent_pokemon.toUpperCase();
  document.querySelector(".loader").style.display="none"
  let s1 = `Your Pokemon\n\n\nHP : ${yourHP} \n\nAttacks\n`;
  for (let val of yourAttacks) {
    let n = val[0].charAt(0).toUpperCase() + val[0].slice(1);
    s1 += n + " : " + val[2] + "\n";
  }

  let moves1 = document.querySelector(".moves1-content");
  moves1.innerHTML = `<pre>${s1}</pre>`;

  let s2 = `Opponent Pokemon\n\n\nHP : ${opponentHp} \n\nAttacks\n`;
  for (let val of opponentAttacks) {
    n = val[0].charAt(0).toUpperCase() + val[0].slice(1);
    s2 += n + " : " + val[2] + "\n";
  }

  let moves2 = document.querySelector(".moves2-content");
  moves2.innerHTML = `<pre>${s2}</pre>`;
}

let your_pokemon = sessionStorage.getItem("pA");
let opponent_pokemon = sessionStorage.getItem("pB");
setstats();
