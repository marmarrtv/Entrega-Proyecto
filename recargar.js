
    document.addEventListener('DOMContentLoaded', function() {
      // Configuración inicial
      document.getElementById("fecha").valueAsDate = new Date();
     
      const insumoInput = document.getElementById("insumo");
      const cantidadInput = document.getElementById("cantidad");
      const fechaInput = document.getElementById("fecha");
      const recargarForm = document.getElementById("recargarForm");
      const mensajeDiv = document.getElementById("mensaje");
      const detallesInsumo = document.getElementById("detallesInsumo");
      const stockActualSpan = document.getElementById("stockActual");
      const descripcionInsumoSpan = document.getElementById("descripcionInsumo");
      const tablaRecargas = document.querySelector("#tablaRecargas tbody");
      const noRecargas = document.getElementById("noRecargas");
     
      let insumoSeleccionado = null;
      let historialRecargas = JSON.parse(localStorage.getItem('historialRecargas')) || [];


      // Función para mostrar mensajes
      function mostrarMensaje(texto, exito = true) {
        mensajeDiv.textContent = texto;
        mensajeDiv.className = `mensaje ${exito ? "exito" : "error"}`;
        mensajeDiv.style.display = "block";
        setTimeout(() => mensajeDiv.style.display = "none", 3000);
      }


      // Función para cargar todos los insumos
      function cargarInsumos() {
        const inventario = JSON.parse(localStorage.getItem('inventario')) || [];
        return inventario.filter(item => item.tipo === "Insumo");
      }


      // Función para autocompletar
      function autocomplete(inp, arr) {
        let currentFocus;
       
        inp.addEventListener("input", function(e) {
          const val = this.value;
          closeAllLists();
          if (!val) {
            detallesInsumo.style.display = "none";
            insumoSeleccionado = null;
            return false;
          }
          currentFocus = -1;
         
          const a = document.createElement("DIV");
          a.setAttribute("id", this.id + "autocomplete-list");
          a.setAttribute("class", "autocomplete-items");
          this.parentNode.appendChild(a);
         
          const insumosFiltrados = arr.filter(item =>
            item.nombre.toLowerCase().includes(val.toLowerCase())
          );
         
          if (insumosFiltrados.length === 0) {
            const b = document.createElement("DIV");
            b.innerHTML = "No se encontraron insumos";
            a.appendChild(b);
          } else {
            insumosFiltrados.forEach(item => {
              const b = document.createElement("DIV");
              b.innerHTML = `<strong>${item.nombre}</strong> (${item.cantidad} en sistema)`;
              if (item.descripcion) {
                b.innerHTML += `<br><small>${item.descripcion}</small>`;
              }
              b.innerHTML += `<input type="hidden" value="${item.nombre}">`;
              b.addEventListener("click", function() {
                inp.value = item.nombre;
                insumoSeleccionado = item;
               
                // Mostrar detalles del insumo seleccionado
                stockActualSpan.textContent = item.cantidad;
                descripcionInsumoSpan.textContent = item.descripcion || "-";
                detallesInsumo.style.display = "block";
               
                closeAllLists();
              });
              a.appendChild(b);
            });
          }
        });
       
        inp.addEventListener("keydown", function(e) {
          let x = document.getElementById(this.id + "autocomplete-list");
          if (x) x = x.getElementsByTagName("div");
          if (e.keyCode == 40) { // Flecha abajo
            currentFocus++;
            addActive(x);
          } else if (e.keyCode == 38) { // Flecha arriba
            currentFocus--;
            addActive(x);
          } else if (e.keyCode == 13) { // Enter
            e.preventDefault();
            if (currentFocus > -1) {
              if (x) x[currentFocus].click();
            }
          }
        });
       
        function addActive(x) {
          if (!x) return false;
          removeActive(x);
          if (currentFocus >= x.length) currentFocus = 0;
          if (currentFocus < 0) currentFocus = (x.length - 1);
          x[currentFocus].classList.add("autocomplete-active");
        }
       
        function removeActive(x) {
          for (let i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
          }
        }
       
        function closeAllLists(elmnt) {
          const x = document.getElementsByClassName("autocomplete-items");
          for (let i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
              x[i].parentNode.removeChild(x[i]);
            }
          }
        }
       
        document.addEventListener("click", function(e) {
          closeAllLists(e.target);
        });
      }


      // Función para actualizar el inventario
      function actualizarInsumo(nombre, cantidadAgregada) {
        const inventario = JSON.parse(localStorage.getItem('inventario')) || [];
        const index = inventario.findIndex(item => item.tipo === "Insumo" && item.nombre === nombre);
       
        if (index !== -1) {
          const cantidadActual = parseInt(inventario[index].cantidad);
          inventario[index].cantidad = cantidadActual + parseInt(cantidadAgregada);
          localStorage.setItem('inventario', JSON.stringify(inventario));
         
          // Actualizar el stock mostrado
          if (insumoSeleccionado && insumoSeleccionado.nombre === nombre) {
            stockActualSpan.textContent = inventario[index].cantidad;
          }
         
          return inventario[index].cantidad;
        }
        return null;
      }


      // Función para guardar en el historial de recargas
      function guardarRecarga(insumo, cantidad, fecha, stockFinal) {
        const recarga = {
          insumo,
          cantidad,
          fecha,
          stockFinal
        };
       
        historialRecargas.unshift(recarga);
        localStorage.setItem('historialRecargas', JSON.stringify(historialRecargas));
      }


      // Función para cargar el historial de recargas (mostrando solo los últimos 3 registros)
      function cargarHistorialRecargas() {
        tablaRecargas.innerHTML = '';
       
        // Obtener solo los últimos 3 registros
        const ultimosRegistros = historialRecargas.slice(0, 3);
       
        if (ultimosRegistros.length === 0) {
          noRecargas.style.display = 'block';
          return;
        }
       
        noRecargas.style.display = 'none';
        ultimosRegistros.forEach(recarga => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${recarga.insumo}</td>
            <td>+${recarga.cantidad}</td>
            <td>${recarga.fecha}</td>
            <td>${recarga.stockFinal}</td>
          `;
          tablaRecargas.appendChild(tr);
        });
      }


      // Evento submit del formulario
      recargarForm.addEventListener('submit', function(e) {
        e.preventDefault();
       
        if (!insumoSeleccionado) {
          mostrarMensaje("Por favor selecciona un insumo válido", false);
          return;
        }
       
        const cantidad = parseInt(cantidadInput.value);
       
        // Validar que la cantidad no exceda el límite de 1000
        if (cantidad > 1000) {
          mostrarMensaje("La cantidad máxima permitida es 1000 unidades", false);
          return;
        }
       
        const fecha = fechaInput.value;
       
        const stockFinal = actualizarInsumo(insumoSeleccionado.nombre, cantidad);
       
        if (stockFinal !== null) {
          guardarRecarga(insumoSeleccionado.nombre, cantidad, fecha, stockFinal);
          mostrarMensaje(`Insumo recargado exitosamente. Stock actual: ${stockFinal}`);
         
          // Resetear formulario
          cantidadInput.value = '';
          fechaInput.valueAsDate = new Date();
          detallesInsumo.style.display = 'none';
          insumoInput.value = '';
          insumoSeleccionado = null;
         
          // Actualizar historial
          cargarHistorialRecargas();
        } else {
          mostrarMensaje("Error al actualizar el inventario", false);
        }
      });


      // Inicializar autocompletado
      autocomplete(insumoInput, cargarInsumos());
     
      // Cargar historial al inicio
      cargarHistorialRecargas();
    });
