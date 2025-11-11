// Definir variables globales
const insumoInput = document.getElementById("insumo");
const fechaInput = document.getElementById("fecha");
const mensajeDiv = document.getElementById("mensaje");
const profesorInput = document.getElementById("profesor");
const tallerSelect = document.getElementById("taller");
const asignaturaContainer = document.getElementById("asignatura-container");

// Fecha actual para el input
fechaInput.valueAsDate = new Date();

// Función para obtener los docentes del inventario
function obtenerDocentes() {
  const inventario = JSON.parse(localStorage.getItem('inventario')) || [];
  return inventario.filter(item => item.tipo === 'Docente');
}

// Función para obtener los insumos del inventario
function obtenerInsumos() {
  const inventario = JSON.parse(localStorage.getItem('inventario')) || [];
  return inventario.filter(item => item.tipo === 'Insumo' && parseInt(item.cantidad) > 0);
}

// Función para autocompletar profesores con sus talleres
function autocompleteProfesores(inp) {
  let currentFocus;
  const docentes = obtenerDocentes();
 
  inp.addEventListener("input", function(e) {
    let val = this.value;
    closeAllLists();
    if (!val) { return false; }
    currentFocus = -1;
   
    const container = document.createElement("DIV");
    container.setAttribute("id", this.id + "autocomplete-list");
    container.setAttribute("class", "autocomplete-items");
    this.parentNode.appendChild(container);
   
    // Filtrar docentes que coincidan con la búsqueda
    const resultados = docentes.filter(docente =>
      docente.nombre.toLowerCase().includes(val.toLowerCase())
    ).slice(0, 5); // Mostrar máximo 5 resultados
   
    if (resultados.length === 0) {
      const item = document.createElement("DIV");
      item.innerHTML = "No se encontraron profesores";
      item.style.padding = "10px";
      item.style.color = "#666";
      container.appendChild(item);
     
      // Si no hay coincidencias, permitir escribir manualmente
      asignaturaContainer.innerHTML = `
        <label for="taller">Taller/Asignatura:</label>
        <input type="text" id="taller" required>
      `;
      return;
    }
   
    resultados.forEach(docente => {
      const item = document.createElement("DIV");
      item.innerHTML = "<strong>" + docente.nombre.substr(0, val.length) + "</strong>";
      item.innerHTML += docente.nombre.substr(val.length);
      item.innerHTML += "<input type='hidden' value='" + docente.nombre + "'>";
     
      item.addEventListener("click", function() {
        inp.value = this.getElementsByTagName("input")[0].value;
        closeAllLists();
       
        // Actualizar el selector de talleres/asignaturas
        const docenteSeleccionado = docentes.find(d => d.nombre === inp.value);
       
        if (docenteSeleccionado && docenteSeleccionado.taller) {
          const talleres = docenteSeleccionado.taller.split(',').map(t => t.trim());
         
          if (talleres.length === 1) {
            // Si solo tiene un taller, mostrarlo como texto
            asignaturaContainer.innerHTML = `
              <label for="taller">Taller/Asignatura:</label>
              <input type="text" id="taller" value="${talleres[0]}" readonly>
            `;
          } else {
            // Si tiene múltiples talleres, mostrar select
            asignaturaContainer.innerHTML = `
              <label for="taller">Taller/Asignatura:</label>
              <select id="taller" required>
                ${talleres.map(t => `<option value="${t}">${t}</option>`).join('')}
              </select>
            `;
          }
        } else {
          // Si no tiene talleres registrados, permitir ingresar manualmente
          asignaturaContainer.innerHTML = `
            <label for="taller">Taller/Asignatura:</label>
            <input type="text" id="taller" required>
          `;
        }
      });
     
      container.appendChild(item);
    });
  });
 
  inp.addEventListener("keydown", function(e) {
    let items = document.getElementById(this.id + "autocomplete-list");
    if (items) items = items.getElementsByTagName("div");
    if (e.keyCode == 40) { // Flecha abajo
      currentFocus++;
      addActive(items);
    } else if (e.keyCode == 38) { // Flecha arriba
      currentFocus--;
      addActive(items);
    } else if (e.keyCode == 13) { // Enter
      e.preventDefault();
      if (currentFocus > -1) {
        if (items) items[currentFocus].click();
      }
    }
  });
 
  function addActive(items) {
    if (!items) return false;
    removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (items.length - 1);
    items[currentFocus].classList.add("autocomplete-active");
    }
 
  function removeActive(items) {
    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove("autocomplete-active");
    }
  }
 
  function closeAllLists(elmnt) {
    const items = document.getElementsByClassName("autocomplete-items");
    for (let i = 0; i < items.length; i++) {
      if (elmnt != items[i] && elmnt != inp) {
        items[i].parentNode.removeChild(items[i]);
      }
    }
  }
 
  document.addEventListener("click", function(e) {
    closeAllLists(e.target);
  });
}

// Función para autocompletar insumos
function autocompleteInsumos(inp) {
  let currentFocus;
  const insumos = obtenerInsumos();
 
  inp.addEventListener("input", function(e) {
    let val = this.value;
    closeAllLists();
    if (!val) { return false; }
    currentFocus = -1;
   
    const container = document.createElement("DIV");
    container.setAttribute("id", this.id + "autocomplete-list");
    container.setAttribute("class", "autocomplete-items");
    this.parentNode.appendChild(container);
   
    // Filtrar insumos que coincidan con la búsqueda
    const resultados = insumos.filter(insumo =>
      insumo.nombre.toLowerCase().includes(val.toLowerCase())
    ).slice(0, 5); // Mostrar máximo 5 resultados
   
    if (resultados.length === 0) {
      const item = document.createElement("DIV");
      item.innerHTML = "No se encontraron insumos";
      item.style.padding = "10px";
      item.style.color = "#666";
      container.appendChild(item);
      return;
    }
   
    resultados.forEach(insumo => {
      const item = document.createElement("DIV");
      item.innerHTML = "<strong>" + insumo.nombre.substr(0, val.length) + "</strong>";
      item.innerHTML += insumo.nombre.substr(val.length);
      item.innerHTML += " <span style='color:#666;font-size:0.9em;'>(" + insumo.cantidad + " disponibles)</span>";
      item.innerHTML += "<input type='hidden' value='" + insumo.nombre + "'>";
     
      item.addEventListener("click", function() {
        inp.value = this.getElementsByTagName("input")[0].value;
        closeAllLists();
      });
     
      container.appendChild(item);
    });
  });
 
  inp.addEventListener("keydown", function(e) {
    let items = document.getElementById(this.id + "autocomplete-list");
    if (items) items = items.getElementsByTagName("div");
    if (e.keyCode == 40) { // Flecha abajo
      currentFocus++;
      addActive(items);
    } else if (e.keyCode == 38) { // Flecha arriba
      currentFocus--;
      addActive(items);
    } else if (e.keyCode == 13) { // Enter
      e.preventDefault();
      if (currentFocus > -1) {
        if (items) items[currentFocus].click();
      }
    }
  });
 
  function addActive(items) {
    if (!items) return false;
    removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (items.length - 1);
    items[currentFocus].classList.add("autocomplete-active");
  }
 
  function removeActive(items) {
    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove("autocomplete-active");
    }
  }
 
  function closeAllLists(elmnt) {
    const items = document.getElementsByClassName("autocomplete-items");
    for (let i = 0; i < items.length; i++) {
      if (elmnt != items[i] && elmnt != inp) {
        items[i].parentNode.removeChild(items[i]);
      }
    }
  }
 
  document.addEventListener("click", function(e) {
    closeAllLists(e.target);
  });
}

// Inicializar autocompletado para profesores e insumos
autocompleteProfesores(profesorInput);
autocompleteInsumos(insumoInput);

function mostrarMensaje(texto, exito = true) {
  mensajeDiv.textContent = texto;
  mensajeDiv.className = `mensaje ${exito ? "exito" : "error"}`;
  mensajeDiv.style.display = "block";
  setTimeout(() => mensajeDiv.style.display = "none", 3000);
}

function validarPedido(nombreInsumo, cantidadSolicitada) {
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const insumo = inventario.find(item => item.tipo === "Insumo" && item.nombre === nombreInsumo);
  if (!insumo) return false;
  return parseInt(insumo.cantidad) >= cantidadSolicitada;
}

function guardarPedido(pedido) {
  const pedidos = JSON.parse(localStorage.getItem("pedidosInsumos")) || [];
 
  // Verificar si el insumo ya está pedido por este profesor
  const existePedido = pedidos.some(p =>
    p.profesor === pedido.profesor &&
    p.insumo === pedido.insumo &&
    p.asignatura === pedido.asignatura
  );
 
  if (existePedido) {
    mostrarMensaje("Este profesor ya tiene un pedido activo para este insumo en el mismo taller", false);
    return false;
  }
 
  pedidos.push(pedido);
  localStorage.setItem("pedidosInsumos", JSON.stringify(pedidos));
  return true;
}

function guardarPedido(pedido) {
  const pedidosInsumos = JSON.parse(localStorage.getItem("pedidosInsumos")) || [];
  const pedidosPorFecha = JSON.parse(localStorage.getItem("pedidosPorFecha")) || {};
 
  // Agregar tipo al pedido
  pedido.tipo = "Insumo";
 
  // Agregar hora exacta
  const ahora = new Date();
  pedido.hora = ahora.toLocaleTimeString();
 
  // Guardar en pedidos de insumos
  pedidosInsumos.push(pedido);
  localStorage.setItem("pedidosInsumos", JSON.stringify(pedidosInsumos));
 
  // Guardar en historial por fecha
  const fechaKey = pedido.fecha;
  if (!pedidosPorFecha[fechaKey]) {
    pedidosPorFecha[fechaKey] = [];
  }
  pedidosPorFecha[fechaKey].push(pedido);
  localStorage.setItem("pedidosPorFecha", JSON.stringify(pedidosPorFecha));
 
  return true;
}

// Listener para el formulario
document.getElementById("pedidoForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const profesor = document.getElementById("profesor").value.trim();
  const tallerElement = document.getElementById("taller");
  const asignatura = tallerElement.tagName === "SELECT" ? tallerElement.value : tallerElement.value.trim();
  const nombreInsumo = insumoInput.value.trim();
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const fecha = fechaInput.value;

  if (!profesor || !asignatura || !nombreInsumo || !cantidad) {
    mostrarMensaje("Por favor complete todos los campos", false);
    return;
  }

  if (!validarPedido(nombreInsumo, cantidad)) {
    mostrarMensaje("Cantidad solicitada no disponible", false);
    return;
  }

  const pedido = {
    profesor,
    asignatura,
    insumo: nombreInsumo,
    cantidad,
    fecha
  };

  if (!guardarPedido(pedido)) {
    return;
  }

  // Restar del inventario
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const index = inventario.findIndex(item => item.tipo === "Insumo" && item.nombre === nombreInsumo);
  if (index !== -1) {
    inventario[index].cantidad = parseInt(inventario[index].cantidad) - cantidad;
    localStorage.setItem("inventario", JSON.stringify(inventario));
  }

  mostrarMensaje("Pedido realizado con éxito");
  this.reset();
  fechaInput.valueAsDate = new Date();
 
  // Restaurar el campo de asignatura a select
  asignaturaContainer.innerHTML = `
    <label for="taller">Taller/Asignatura:</label>
    <select id="taller" required disabled>
      <option value="" selected>Seleccione un profesor primero</option>
    </select>
  `;
});

// Inicializamos las listas al cargar la página
window.onload = function() {
  // No es necesario cargar insumos ya que se manejan con autocompletado
};