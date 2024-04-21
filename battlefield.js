let your_pokemon = sessionStorage.getItem("pA");
let opponent_pokemon = sessionStorage.getItem("pB");
let yourAttacks = [],
  opponentAttacks = [];
let yourHP, opponentHp;
let waitForPressResolve;
let logger = document.querySelector(".logertext");
let logs = ``,
  you,
  him;
let yourAudio, hisAudio;
setstats();

async function pokemon_fetcher(query) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
    if (!res.ok) {
      return query + " is invalid";
    } else {
      let pokemon = await res.json();
      console.log(pokemon);
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

async function setstats() {
  let health_multiplier = 5;
  let your_poke_res = await pokemon_fetcher(your_pokemon);
  yourAttacks = await search_pokemon_and_attacks(your_poke_res);
  yourHP = getHP(your_poke_res) * health_multiplier;
  let your_poke_id = your_poke_res.id;

  let opponent_poke_res = await pokemon_fetcher(opponent_pokemon);
  opponentAttacks = await search_pokemon_and_attacks(opponent_poke_res);
  opponentHp = getHP(opponent_poke_res) * health_multiplier;
  let opponent_poke_id = opponent_poke_res.id;

  let button_html = "";
  for (let val of yourAttacks) {
    button_html += `<button class="attack_buttons ${val[0]}"> ${val[0]} : ${val[2]} </button>`;
  }
  document.querySelector(".attacks").innerHTML = button_html;

  document
    .querySelectorAll(".attack_buttons")
    .forEach((button) => button.addEventListener("click", damager));

  you = document.querySelector(".yourPokemon");
  you.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/${your_poke_id}.gif`;

  him = document.querySelector(".opponentPokemon");
  him.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${opponent_poke_id}.gif`;

  logs = `Welcome to PokeDuels!!!\nYour HP=${yourHP} and Opponent's HP=${opponentHp}`;
  logger.textContent = logs;

  yourAudio = new Audio(
    `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${your_poke_id}.ogg`
  );
  hisAudio = new Audio(
    `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${opponent_poke_id}.ogg`
  );
  gameloop(yourHP, opponentHp);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function damager(event) {
  const clicked_button = event.target;
  let button_details = clicked_button.className;
  button_details = button_details.split(" ");
  for (val of yourAttacks) {
    if (val[0] == button_details[1]) {
      opponentHp -= val[2];
      if (opponentHp < 0) {
        opponentHp = 0;
      }
      yourAudio.play();
      you.style.animationName = "yourattack";
      you.style.animationDuration = "1s";
      await sleep(1000);
      you.style.animationName = "none";
      logs += `\nYou used ${val[0]}\nYour HP=${yourHP} and Opponent's HP=${opponentHp}`;
      logger.textContent = logs;
    }
  }
  btnResolver();
}

async function gameloop() {
  let gameaudio = new Audio("./pokemon-battle.mp3");
  let winaudio = new Audio(
    "./pokemon-red-blue-music-wild-pokemon-victory-theme-1.mp3"
  );
  gameaudio.play();

  let x, his_attack;

  while (yourHP > 0 && opponentHp > 0) {
    gameaudio.play();
    await waitForPress();

    if (opponentHp <= 0) {
      logs +=
        "\n\n You Won!!!\nTo play again reload the page\nTo change the pokemons revert back to previous pages";
      logger.textContent = logs;
      him.src = "";
      gameaudio.pause();
      winaudio.play();
      break;
    }

    x = Math.floor(Math.random() * opponentAttacks.length);
    his_attack = opponentAttacks[x];

    him.style.animationName = "hisattack";
    him.style.animationDuration = "1s";
    await sleep(1000);
    him.style.animationName = "none";

    yourHP -= his_attack[2];
    if (yourHP < 0) {
      yourHP = 0;
    }
    hisAudio.play();

    logs += `\nOpponent used ${his_attack[0]}\nYour HP=${yourHP} and Opponent's HP=${opponentHp}`;
    logger.textContent = logs;

    if (yourHP <= 0) {
      logs +=
        "\n\nYou lost!!!\nTo play again reload the page\nTo change the pokemons revert back to previous pages";
      logger.textContent = logs;
      you.src = "";
      break;
    }
  }
  document
    .querySelectorAll(".attack_buttons")
    .forEach((button) => button.removeEventListener("click", damager));
}

function waitForPress() {
  return new Promise((resolve) => (waitForPressResolve = resolve));
}

function btnResolver() {
  if (waitForPressResolve) waitForPressResolve();
}
