// Selección de elementos en el DOM
const btnRandom = document.getElementById("buscar-aleatorio");
const loader = document.getElementById("loader");
const resultado = document.getElementById("resultado");
const listaFavoritos = document.getElementById("lista-favoritos");

const API_URL = "https://www.thecocktaildb.com/api/json/v1/1/";

// Al cargar la página, mostramos los favoritos guardados (si existen)
mostrarFavoritos();

// Evento para obtener un cóctel aleatorio
btnRandom.addEventListener("click", async () => {
  loader.style.display = "block"; // Muestra el loader

  try {
    const response = await fetch(API_URL + "random.php");
    const data = await response.json();
    const drink = data.drinks[0];

    loader.style.display = "none"; // Oculta el loader

    mostrarCoctel(drink);

  } catch (error) {
    loader.style.display = "none";
    console.error("Error al obtener cóctel aleatorio:", error);
    resultado.innerHTML = "<p>Ocurrió un error. Intenta de nuevo.</p>";
  }
});

/**
 * Muestra los datos de un cóctel en el área principal (#resultado).
 */
function mostrarCoctel(drink) {
  // Creamos el contenido HTML
  resultado.innerHTML = `
    <h2>${drink.strDrink} (ID: ${drink.idDrink})</h2>
    <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" />
    <p><strong>Categoría:</strong> ${drink.strCategory}</p>
    <p><strong>Instrucciones:</strong> ${drink.strInstructions}</p>
    ${mostrarIngredientes(drink)}
    <button onclick="guardarEnFavoritos('${drink.idDrink}', '${drink.strDrink}')">Guardar en Favoritos</button>
  `;
}

/**
 * Genera una lista de ingredientes con sus respectivas medidas.
 */
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

/**
 * Guarda en localStorage SOLO el id y el nombre del cóctel.
 */
function guardarEnFavoritos(idDrink, nombreCoctel) {
  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  
  // Verificar si ya está en la lista de favoritos
  if (!favoritos.some(fav => fav.id === idDrink)) {
    favoritos.push({ id: idDrink, nombre: nombreCoctel });
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
    alert(`Se agregó "${nombreCoctel}" a favoritos.`);
    mostrarFavoritos();
  } else {
    alert("Este cóctel ya se encuentra en favoritos.");
  }
}

/**
 * Muestra la lista de favoritos (id y nombre) en la barra lateral.
 */
function mostrarFavoritos() {
  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  
  if (!favoritos.length) {
    listaFavoritos.innerHTML = "<p>No hay favoritos guardados.</p>";
    return;
  }

  listaFavoritos.innerHTML = favoritos
    .map(fav => `
      <li onclick="verFavorito('${fav.id}')" id="fav-${fav.id}">${fav.nombre}</li>
      <button class="bFavorito" id="btn-${fav.id}">Borrar</button>
    `)
    .join("");

  // Agregar eventos a los botones de borrar
  favoritos.forEach(fav => {
    let botonBorrar = document.getElementById(`btn-${fav.id}`);
    let favElement = document.getElementById(`fav-${fav.id}`);

    if (botonBorrar && favElement) {
      botonBorrar.addEventListener("click", function() {
        borrarDeFavoritos(fav.id); // Función para eliminar del localStorage
      });
    }
  });
}

/**
 * Elimina un cóctel de la lista de favoritos en el DOM y en localStorage.
 */
function borrarDeFavoritos(idDrink) {
  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  // Filtrar los favoritos para excluir el que queremos eliminar
  favoritos = favoritos.filter(fav => fav.id !== idDrink);

  // Guardar la nueva lista en localStorage
  localStorage.setItem("favoritos", JSON.stringify(favoritos));

  // Volver a renderizar la lista
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

// Hacer verFavorito accesible desde el HTML (si no usas type="module")
window.verFavorito = verFavorito;
