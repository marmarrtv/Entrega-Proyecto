const herramientaInput = document.getElementById("herramienta");
const fechaInput = document.getElementById("fecha");
const mensajeDiv = document.getElementById("mensaje");
const profesorInput = document.getElementById("profesor");
const tallerSelect = document.getElementById("taller");
const asignaturaContainer = document.getElementById("asignatura-container");
const tablaPedidos = document.getElementById("tablaPedidos").getElementsByTagName('tbody')[0];

fechaInput.valueAsDate = new Date();

function obtenerDocentes() {
  const inventario = JSON.parse(localStorage.getItem('inventario')) || [];
  return inventario.filter(item => item.tipo === 'Docente');
}

function obtenerHerramientas() {
  const inventario = JSON.parse(localStorage.getItem('inventario')) || [];
  return inventario.filter(item => item.tipo === 'Herramienta' && parseInt(item.cantidad) > 0);
}

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
   
    const resultados = docentes.filter(docente =>
      docente.nombre.toLowerCase().includes(val.toLowerCase())
    ).slice(0, 5); // Mostrar máximo 5 resultados
   
    if (resultados.length === 0) {
      const item = document.createElement("DIV");
      item.innerHTML = "No se encontraron profesores";
      item.style.padding = "10px";
      item.style.color = "#666";
      container.appendChild(item);
     
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
       
        const docenteSeleccionado = docentes.find(d => d.nombre === inp.value);
       
        if (docenteSeleccionado && docenteSeleccionado.taller) {
          const talleres = docenteSeleccionado.taller.split(',').map(t => t.trim());
         
          if (talleres.length === 1) {
            asignaturaContainer.innerHTML = `
              <label for="taller">Taller/Asignatura:</label>
              <input type="text" id="taller" value="${talleres[0]}" readonly>
            `;
          } else {
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

function autocompleteHerramientas(inp) {
  let currentFocus;
  const herramientas = obtenerHerramientas();
 
  inp.addEventListener("input", function(e) {
    let val = this.value;
    closeAllLists();
    if (!val) { return false; }
    currentFocus = -1;
   
    const container = document.createElement("DIV");
    container.setAttribute("id", this.id + "autocomplete-list");
    container.setAttribute("class", "autocomplete-items");
    this.parentNode.appendChild(container);
   
    const resultados = herramientas.filter(herramienta =>
      herramienta.nombre.toLowerCase().includes(val.toLowerCase())
    ).slice(0, 5); // Mostrar máximo 5 resultados
   
    if (resultados.length === 0) {
      const item = document.createElement("DIV");
      item.innerHTML = "No se encontraron herramientas";
      item.style.padding = "10px";
      item.style.color = "#666";
      container.appendChild(item);
      return;
    }
   
    resultados.forEach(herramienta => {
      const item = document.createElement("DIV");
      item.innerHTML = "<strong>" + herramienta.nombre.substr(0, val.length) + "</strong>";
      item.innerHTML += herramienta.nombre.substr(val.length);
      item.innerHTML += " <span style='color:#666;font-size:0.9em;'>(" + herramienta.cantidad + " disponibles)</span>";
      item.innerHTML += "<input type='hidden' value='" + herramienta.nombre + "'>";
     
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

// Inicializar autocompletado para profesores y herramientas
autocompleteProfesores(profesorInput);
autocompleteHerramientas(herramientaInput);

function mostrarMensaje(texto, exito = true) {
  mensajeDiv.textContent = texto;
  mensajeDiv.className = `mensaje ${exito ? "exito" : "error"}`;
  mensajeDiv.style.display = "block";
  setTimeout(() => mensajeDiv.style.display = "none", 3000);
}

function validarPedido(nombreHerramienta, cantidadSolicitada) {
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const herramienta = inventario.find(item => item.tipo === "Herramienta" && item.nombre === nombreHerramienta);
  if (!herramienta) return false;
  return parseInt(herramienta.cantidad) >= cantidadSolicitada;
}

function guardarPedido(pedido) {
  const pedidos = JSON.parse(localStorage.getItem("pedidosHerramientas")) || [];
 
  // Verificar si la herramienta ya está pedida por este profesor
  const existePedido = pedidos.some(p =>
    p.profesor === pedido.profesor &&
    p.herramienta === pedido.herramienta &&
    p.asignatura === pedido.asignatura
  );
 
  if (existePedido) {
    mostrarMensaje("Este profesor ya tiene un pedido activo para esta herramienta en el mismo taller", false);
    return false;
  }
 
  pedidos.push(pedido);
  localStorage.setItem("pedidosHerramientas", JSON.stringify(pedidos));
  return true;
}

function cargarTablaPedidos() {
  const pedidos = JSON.parse(localStorage.getItem("pedidosHerramientas")) || [];
  tablaPedidos.innerHTML = "";

  pedidos.forEach((pedido, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${pedido.profesor}</td>
      <td>${pedido.asignatura}</td>
      <td>${pedido.herramienta}</td>
      <td>${pedido.cantidad}</td>
      <td>${pedido.fecha}</td>
      <td><button onclick="devolverPedido(${index})">Devolver</button></td>
    `;

    tablaPedidos.appendChild(tr);
  });
}

function devolverPedido(index) {
  const pedidos = JSON.parse(localStorage.getItem("pedidosHerramientas")) || [];
  const pedido = pedidos[index];

  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const herramienta = inventario.find(item => item.nombre === pedido.herramienta && item.tipo === "Herramienta");
  if (herramienta) {
    herramienta.cantidad = parseInt(herramienta.cantidad) + parseInt(pedido.cantidad);
    localStorage.setItem("inventario", JSON.stringify(inventario));
  }

  pedidos.splice(index, 1);
  localStorage.setItem("pedidosHerramientas", JSON.stringify(pedidos));

  cargarTablaPedidos();
  mostrarMensaje("Herramienta devuelta con éxito");
}

function devolverTodos() {
  const pedidos = JSON.parse(localStorage.getItem("pedidosHerramientas")) || [];
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];

  pedidos.forEach(pedido => {
    const herramienta = inventario.find(item => item.nombre === pedido.herramienta && item.tipo === "Herramienta");
    if (herramienta) {
      herramienta.cantidad = parseInt(herramienta.cantidad) + parseInt(pedido.cantidad);
    }
  });

  localStorage.setItem("inventario", JSON.stringify(inventario));
  localStorage.removeItem("pedidosHerramientas");

  cargarTablaPedidos();
  mostrarMensaje("Todas las herramientas han sido devueltas");
}

// Listener para el formulario
document.getElementById("pedidoForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const profesor = document.getElementById("profesor").value.trim();
  const tallerElement = document.getElementById("taller");
  const asignatura = tallerElement.tagName === "SELECT" ? tallerElement.value : tallerElement.value.trim();
  const nombreHerramienta = herramientaInput.value.trim();
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const fecha = fechaInput.value;

  if (!profesor || !asignatura || !nombreHerramienta || !cantidad) {
    mostrarMensaje("Por favor complete todos los campos", false);
    return;
  }

  if (!validarPedido(nombreHerramienta, cantidad)) {
    mostrarMensaje("Cantidad solicitada no disponible", false);
    return;
  }

  const pedido = {
    profesor,
    asignatura,
    herramienta: nombreHerramienta,
    cantidad,
    fecha
  };

  if (!guardarPedido(pedido)) {
    return;
  }

  // Restar del inventario
  const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  const index = inventario.findIndex(item => item.tipo === "Herramienta" && item.nombre === nombreHerramienta);
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
 
  cargarTablaPedidos();
});

// Inicializamos las listas al cargar la página
window.onload = function() {
  cargarTablaPedidos();
};