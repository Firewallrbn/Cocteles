
const btnRandom = document.getElementById("buscar-aleatorio");
const loader = document.getElementById("loader");
const resultado = document.getElementById("resultado");
const listaFavoritos = document.getElementById("lista-favoritos");

const API_URL = "https://www.thecocktaildb.com/api/json/v1/1/";

mostrarFavoritos();

btnRandom.addEventListener("click", async () => {
  loader.style.display = "block"; 

  try {
    const response = await fetch(API_URL + "random.php");
    const data = await response.json();
    const drink = data.drinks[0];

    loader.style.display = "none"; 

    mostrarCoctel(drink);

  } catch (error) {
    loader.style.display = "none";
    console.error("Error al obtener cóctel aleatorio:", error);
    resultado.innerHTML = "<p>Ocurrió un error. Intenta de nuevo.</p>";
  }
});

function mostrarCoctel(drink) {
  resultado.innerHTML = `
    <h2>${drink.strDrink} (ID: ${drink.idDrink})</h2>
    <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" />
    <p><strong>Categoría:</strong> ${drink.strCategory}</p>
    <p><strong>Instrucciones:</strong> ${drink.strInstructions}</p>
    ${mostrarIngredientes(drink)}
    <button onclick="guardarEnFavoritos('${drink.idDrink}', '${drink.strDrink}')">Guardar en Favoritos</button>
  `;
}

function mostrarIngredientes(drink) {
  let ingredientes = "";
  for (let i = 1; i <= 15; i++) {
    const ingrediente = drink[`strIngredient${i}`];
    const medida = drink[`strMeasure${i}`];
    if (ingrediente) {
      ingredientes += `<li>${ingrediente} - ${medida ? medida : ""}</li>`;
    }
  }
  return `<ul><strong>Ingredientes:</strong> ${ingredientes}</ul>`;
}

function guardarEnFavoritos(idDrink, nombreCoctel) {
  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  
  if (!favoritos.some(fav => fav.id === idDrink)) {
    favoritos.push({ id: idDrink, nombre: nombreCoctel });
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
    alert(`Se agregó "${nombreCoctel}" a favoritos.`);
    mostrarFavoritos();
  } else {
    alert("Este cóctel ya se encuentra en favoritos.");
  }
}

function mostrarFavoritos() {
  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  
  // Si no hay favoritos, mostrar un mensaje
  if (!favoritos.length) {
    listaFavoritos.innerHTML = "<p>No hay favoritos guardados.</p>";
    return;
  }

  listaFavoritos.innerHTML = favoritos
  .map(fav => `
    <li onclick="verFavorito('${fav.id}')" id="${fav.id}">${fav.nombre}</li>
    <button class="bFavorito" id="C${fav.id}">X</button>
  `)
  .join("");

  favoritos.forEach(fav => {
    let botonBorrar = document.getElementById(`btn-${fav.id}`);
    let favElement = document.getElementById(`fav-${fav.id}`);

    if (botonBorrar && favElement) {
      botonBorrar.addEventListener("click", function() {
        borrarDeFavoritos(fav.id); 
      });
    }
  });
}

function borrarDeFavoritos(idDrink) {
  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  favoritos = favoritos.filter(fav => fav.id !== idDrink);

  localStorage.setItem("favoritos", JSON.stringify(favoritos));

  mostrarFavoritos();
}

async function verFavorito(idDrink) {
  try {
    loader.style.display = "block";

    const response = await fetch(`${API_URL}lookup.php?i=${idDrink}`);
    const data = await response.json();
    const drink = data.drinks[0];

    loader.style.display = "none";
    
    mostrarCoctel(drink);

  } catch (error) {
    loader.style.display = "none";
    console.error("Error al mostrar detalle de favorito:", error);
  }
}

window.verFavorito = verFavorito;
