let your_pokemon = "",
  opponent_pokemon = "";
let text_box1 = document.querySelector(".t1");
let text_box2 = document.querySelector(".t2");
let poke_array;

async function get_n_pokemons(n) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${n}`);
  let all = await res.json();
  poke_array = all.results;

  poke_array.forEach((val, ind, arr) => {
    arr[ind] = val.name;
  });

  let s1 = "",
    s2 = "";

  for (let val of poke_array) {
    s1 += `<div class="pokerow">${val} <button class="choose_button ${val} text1" >Choose</button></div>`;
    s2 += `<div class="pokerow">${val} <button class="choose_button ${val} text2" >Choose</button></div>`;
  }

  document.querySelector(".c1").innerHTML = s1;
  document.querySelector(".c2").innerHTML = s2;

  document
    .querySelectorAll(".choose_button")
    .forEach((button) => button.addEventListener("click", clickHandler));
}

function clickHandler(event) {
  const clicked_button = event.target;
  let button_details = clicked_button.className;
  button_details = button_details.split(" ");
  if (button_details[2] == "text1") {
    your_pokemon = button_details[1];
    text_box1.value = your_pokemon;
  } else {
    opponent_pokemon = button_details[1];
    text_box2.value = opponent_pokemon;
  }
}

function start() {
  your_pokemon = text_box1.value;
  opponent_pokemon = text_box2.value;
  let p1 = false,
    p2 = false;
  for (let val of poke_array) {
    if (!p1 && val == your_pokemon) {
      p1 = true;
    }
    if (!p2 && val == opponent_pokemon) {
      p2 = true;
    }
    if (p1 && p2) {
      break;
    }
  }
  if (p1 && p2) {
    sessionStorage.setItem("pA", your_pokemon);
    sessionStorage.setItem("pB", opponent_pokemon);
    window.location.href = "statspage.html";
  } else {
    console.log("No");
  }
  console.log(your_pokemon, opponent_pokemon);
}

sessionStorage.clear();
get_n_pokemons(1500);
