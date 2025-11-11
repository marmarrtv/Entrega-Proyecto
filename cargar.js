document.addEventListener('DOMContentLoaded', function() {
  // Configuración inicial
  document.getElementById("fecha").valueAsDate = new Date();

  const formulario = document.getElementById("formulario");
  const tablaHerramientas = document.getElementById("tabla-herramientas").querySelector("tbody");
  const tablaInsumos = document.getElementById("tabla-insumos").querySelector("tbody");
  const tablaDocentes = document.getElementById("tabla-docentes").querySelector("tbody");
  const clearBtn = document.getElementById("clearBtn");
  const tipoSelect = document.getElementById("tipo");
  const docenteFields = document.getElementById("docente-fields");
  const defaultFields = document.getElementById("default-fields");
  const cantidadInput = document.getElementById("cantidad");

  // Validar que la cantidad no exceda 6 dígitos
  cantidadInput.addEventListener("input", function() {
    if (this.value.length > 6) {
      this.value = this.value.slice(0, 6);
      mostrarMensaje('La cantidad no puede exceder los 6 dígitos', true);
    }
  });

  // Manejar cambio en el selector de tipo
  tipoSelect.addEventListener("change", function() {
    if (this.value === "Docente") {
      docenteFields.classList.remove("hidden-field");
      defaultFields.classList.add("hidden-field");
     
      // Hacer solo los campos de docente requeridos
      document.getElementById("nombre-docente").required = true;
      document.getElementById("taller").required = true;
      document.getElementById("nombre").required = false;
      document.getElementById("cantidad").required = false;
      document.getElementById("fecha").required = false;
    } else {
      docenteFields.classList.add("hidden-field");
      defaultFields.classList.remove("hidden-field");
     
      // Restaurar requeridos para campos normales
      document.getElementById("nombre").required = true;
      document.getElementById("cantidad").required = true;
      document.getElementById("fecha").required = true;
      document.getElementById("nombre-docente").required = false;
      document.getElementById("taller").required = false;
    }
  });

  // Función para mostrar mensajes de error/éxito
  function mostrarMensaje(mensaje, esError = false) {
    const div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.top = '20px';
    div.style.right = '20px';
    div.style.padding = '15px';
    div.style.backgroundColor = esError ? '#ff4444' : '#4CAF50';
    div.style.color = 'white';
    div.style.borderRadius = '5px';
    div.style.zIndex = '1000';
    div.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    div.style.animation = 'fadeIn 0.5s ease-out';
    div.textContent = mensaje;
    document.body.appendChild(div);
   
    setTimeout(() => {
      div.style.animation = 'fadeIn 0.5s ease-out reverse';
      setTimeout(() => {
        div.remove();
      }, 500);
    }, 3000);
  }

  // Función para verificar duplicados
  function verificarDuplicados(item) {
    try {
      const inventario = JSON.parse(localStorage.getItem('inventario')) || [];
      
      if (item.tipo === "Docente") {
        // Verificar si ya existe un docente con el mismo nombre o taller
        const duplicado = inventario.find(existente => 
          existente.tipo === "Docente" && 
          (existente.nombre.toLowerCase() === item.nombre.toLowerCase() || 
           existente.taller.toLowerCase() === item.taller.toLowerCase())
        );
        
        if (duplicado) {
          if (duplicado.nombre.toLowerCase() === item.nombre.toLowerCase()) {
            return `Ya existe un docente registrado con el nombre "${duplicado.nombre}"`;
          } else {
            return `Ya existe un docente registrado para el taller "${duplicado.taller}"`;
          }
        }
      } else {
        // Verificar si ya existe una herramienta o insumo con el mismo nombre
        const duplicado = inventario.find(existente => 
          existente.tipo === item.tipo && 
          existente.nombre.toLowerCase() === item.nombre.toLowerCase()
        );
        
        if (duplicado) {
          return `Ya existe un ${item.tipo.toLowerCase()} registrado con el nombre "${duplicado.nombre}"`;
        }
      }
      
      return null; // No hay duplicados
    } catch (e) {
      console.error('Error al verificar duplicados:', e);
      return 'Error al verificar duplicados';
    }
  }

  // Función mejorada para guardar en localStorage
  function guardarEnInventario(item) {
    try {
      let inventario = JSON.parse(localStorage.getItem('inventario')) || [];
      inventario.push(item);
      localStorage.setItem('inventario', JSON.stringify(inventario));
      return true;
    } catch (e) {
      console.error('Error al guardar:', e);
      mostrarMensaje('Error al guardar los datos', true);
      return false;
    }
  }

  // Función para actualizar todas las tablas
  function actualizarTablas() {
    try {
      const inventario = JSON.parse(localStorage.getItem('inventario')) || [];
     
      // Limpiar todas las tablas
      tablaHerramientas.innerHTML = '';
      tablaInsumos.innerHTML = '';
      tablaDocentes.innerHTML = '';
     
      if (inventario.length === 0) {
        const filaH = document.createElement("tr");
        filaH.innerHTML = `<td colspan="5" style="text-align: center;">No hay herramientas registradas</td>`;
        tablaHerramientas.appendChild(filaH);
       
        const filaI = document.createElement("tr");
        filaI.innerHTML = `<td colspan="5" style="text-align: center;">No hay insumos registrados</td>`;
        tablaInsumos.appendChild(filaI);
       
        const filaD = document.createElement("tr");
        filaD.innerHTML = `<td colspan="2" style="text-align: center;">No hay docentes registrados</td>`;
        tablaDocentes.appendChild(filaD);
        return;
      }
     
      // Separar los datos por tipo y obtener los últimos 3 elementos de cada tipo
      const herramientas = inventario.filter(item => item.tipo === "Herramienta").slice(-3).reverse();
      const insumos = inventario.filter(item => item.tipo === "Insumo").slice(-3).reverse();
      const docentes = inventario.filter(item => item.tipo === "Docente").slice(-3).reverse();
     
      // Mostrar herramientas (solo últimos 3)
      if (herramientas.length === 0) {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td colspan="5" style="text-align: center;">No hay herramientas registradas</td>`;
        tablaHerramientas.appendChild(fila);
      } else {
        herramientas.forEach(item => {
          const fila = document.createElement("tr");
          fila.innerHTML = `
            <td>${item.nombre || '-'}</td>
            <td>${item.descripcion || '-'}</td>
            <td>${item.cantidad || '-'}</td>
            <td>${item.fecha || '-'}</td>
            <td>${item.marca || '-'}</td>
          `;
          tablaHerramientas.appendChild(fila);
        });
      }
     
      // Mostrar insumos (solo últimos 3)
      if (insumos.length === 0) {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td colspan="5" style="text-align: center;">No hay insumos registrados</td>`;
        tablaInsumos.appendChild(fila);
      } else {
        insumos.forEach(item => {
          const fila = document.createElement("tr");
          fila.innerHTML = `
            <td>${item.nombre || '-'}</td>
            <td>${item.descripcion || '-'}</td>
            <td>${item.cantidad || '-'}</td>
            <td>${item.fecha || '-'}</td>
            <td>${item.marca || '-'}</td>
          `;
          tablaInsumos.appendChild(fila);
        });
      }
     
      // Mostrar docentes (solo últimos 3)
      if (docentes.length === 0) {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td colspan="2" style="text-align: center;">No hay docentes registrados</td>`;
        tablaDocentes.appendChild(fila);
      } else {
        docentes.forEach(item => {
          const fila = document.createElement("tr");
          fila.innerHTML = `
            <td>${item.nombre || '-'}</td>
            <td>${item.taller || '-'}</td>
          `;
          tablaDocentes.appendChild(fila);
        });
      }
    } catch (e) {
      console.error('Error al cargar datos:', e);
      mostrarMensaje('Error al cargar los datos', true);
    }
  }

  // Función para limpiar todos los datos con confirmación
  function limpiarDatos() {
    // Crear un modal de confirmación personalizado
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '2000';
    
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '30px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
    modalContent.style.maxWidth = '500px';
    modalContent.style.width = '90%';
    modalContent.style.textAlign = 'center';
    
    modalContent.innerHTML = `
      <h3 style="color: #d32f2f; margin-top: 0;">Confirmar eliminación de datos</h3>
      <p style="margin-bottom: 25px; font-size: 16px; line-height: 1.5;">
        <strong>¿Está seguro de que desea eliminar TODOS los datos del sistema?</strong><br>
        Esta acción borrará permanentemente toda la información almacenada, incluyendo herramientas, insumos y docentes.
      </p>
      <div style="display: flex; justify-content: center; gap: 15px;">
        <button id="confirmDelete" style="background-color: #d32f2f; padding: 10px 20px; border: none; border-radius: 5px; color: white; cursor: pointer; font-weight: bold;">
          Sí, eliminar todo
        </button>
        <button id="cancelDelete" style="background-color: #757575; padding: 10px 20px; border: none; border-radius: 5px; color: white; cursor: pointer; font-weight: bold;">
          Cancelar
        </button>
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Manejar la confirmación
    document.getElementById('confirmDelete').addEventListener('click', function() {
      try {
        localStorage.removeItem('inventario');
        actualizarTablas();
        mostrarMensaje('Todos los datos del sistema han sido eliminados correctamente');
        document.body.removeChild(modal);
      } catch (e) {
        console.error('Error al limpiar datos:', e);
        mostrarMensaje('Error al eliminar los datos', true);
        document.body.removeChild(modal);
      }
    });
    
    // Manejar la cancelación
    document.getElementById('cancelDelete').addEventListener('click', function() {
      document.body.removeChild(modal);
    });
    
    // Cerrar modal al hacer clic fuera del contenido
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  // Evento submit del formulario - Versión mejorada
  formulario.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validar que la cantidad no exceda 6 dígitos
    const cantidad = document.getElementById("cantidad").value;
    if (cantidad && cantidad.length > 6) {
      mostrarMensaje('La cantidad no puede exceder los 6 dígitos', true);
      return;
    }

    let item;
    const tipo = document.getElementById("tipo").value;

    if (tipo === "Docente") {
      item = {
        tipo: tipo,
        nombre: document.getElementById("nombre-docente").value,
        taller: document.getElementById("taller").value,
        descripcion: "",
        cantidad: "",
        fecha: "",
        marca: ""
      };
    } else {
      item = {
        tipo: tipo,
        nombre: document.getElementById("nombre").value,
        descripcion: document.getElementById("descripcion").value,
        cantidad: document.getElementById("cantidad").value,
        fecha: document.getElementById("fecha").value,
        marca: document.getElementById("marca").value,
        taller: ""
      };
    }

    // Verificar duplicados antes de guardar
    const mensajeDuplicado = verificarDuplicados(item);
    if (mensajeDuplicado) {
      mostrarMensaje(mensajeDuplicado, true);
      return;
    }

    if (guardarEnInventario(item)) {
      actualizarTablas();
      formulario.reset();
      document.getElementById("fecha").valueAsDate = new Date();
      mostrarMensaje('Datos guardados correctamente');
     
      // Restablecer visibilidad de campos según el tipo seleccionado
      if (tipoSelect.value === "Docente") {
        docenteFields.classList.remove("hidden-field");
        defaultFields.classList.add("hidden-field");
      } else {
        docenteFields.classList.add("hidden-field");
        defaultFields.classList.remove("hidden-field");
      }
    }
  });

  // Evento para limpiar datos
  clearBtn.addEventListener("click", limpiarDatos);

  // Cargar datos al iniciar la página
  actualizarTablas();
});