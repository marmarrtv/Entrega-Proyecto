document.addEventListener('DOMContentLoaded', function () {
      // Elementos del DOM
      const searchInput = document.getElementById('searchInput');
      const searchButton = document.getElementById('searchButton');
      const searchResults = document.getElementById('searchResults');
      const searchTableBody = document.getElementById('searchTableBody');
      const noResults = document.getElementById('noResults');
      const exportBtn = document.getElementById('exportBtn');
      const deleteBtn = document.getElementById('deleteBtn');
      const editBtn = document.getElementById('editBtn');
      const deleteModal = document.getElementById('deleteModal');
      const editModal = document.getElementById('editModal');
      const closeModal = document.querySelector('.close');
      const cancelDelete = document.getElementById('cancelDelete');
      const confirmDelete = document.getElementById('confirmDelete');
      const nextStep = document.getElementById('nextStep');
      const backToStep1 = document.getElementById('backToStep1');
     
      // Elementos del modal de eliminación
      const deleteStep1 = document.getElementById('deleteStep1');
      const deleteStep2 = document.getElementById('deleteStep2');
      const deleteTypeSelect = document.getElementById('deleteTypeSelect');
      const deleteSearchInput = document.getElementById('deleteSearchInput');
      const deleteTableBody = document.getElementById('deleteTableBody');
      const noDeleteResults = document.getElementById('noDeleteResults');
      
      // Elementos del modal de edición
      const closeEditModal = document.getElementById('closeEditModal');
      const cancelEdit = document.getElementById('cancelEdit');
      const saveEdit = document.getElementById('saveEdit');
      const editIndex = document.getElementById('editIndex');
      const editTipo = document.getElementById('editTipo');
      const editNombre = document.getElementById('editNombre');
      const editDescripcion = document.getElementById('editDescripcion');
      const editCantidad = document.getElementById('editCantidad');
      const editFecha = document.getElementById('editFecha');
      const editMarca = document.getElementById('editMarca');
      const editTaller = document.getElementById('editTaller');
      const editDescripcionGroup = document.getElementById('editDescripcionGroup');
      const editCantidadGroup = document.getElementById('editCantidadGroup');
      const editFechaGroup = document.getElementById('editFechaGroup');
      const editMarcaGroup = document.getElementById('editMarcaGroup');
      const editTallerGroup = document.getElementById('editTallerGroup');
     
      // Variables para el proceso de eliminación/edición
      let selectedType = '';
      let selectedItemId = null;
      let filteredItems = [];
      let currentModalType = ''; // 'delete' o 'edit'

      // Event Listeners para búsqueda en tiempo real
      searchInput.addEventListener('input', function() {
        if (this.value.trim() === '') {
          searchResults.classList.remove('show');
        } else {
          realizarBusqueda();
        }
      });

      searchButton.addEventListener('click', realizarBusqueda);

      // Buscar al presionar Enter en el input
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          realizarBusqueda();
        }
      });

      // Función para cargar datos del inventario 
function cargarDatos() {
  const inventario = JSON.parse(localStorage.getItem('inventario')) || [];
  
  // Separar por tipos y ordenar alfabéticamente
  const herramientas = ordenarAlfabeticamente(inventario.filter(item => item.tipo === 'Herramienta'));
  const insumos = ordenarAlfabeticamente(inventario.filter(item => item.tipo === 'Insumo'));
  const docentes = ordenarAlfabeticamente(inventario.filter(item => item.tipo === 'Docente'));
  
  // Actualizar contadores
  document.getElementById('herramientasCount').textContent = herramientas.length;
  document.getElementById('insumosCount').textContent = insumos.length;
  document.getElementById('docentesCount').textContent = docentes.length;
  
  // Mostrar herramientas
  const herramientasBody = document.getElementById('herramientasBody');
  const noHerramientas = document.getElementById('noHerramientas');
  
  herramientasBody.innerHTML = '';
  if (herramientas.length === 0) {
    noHerramientas.style.display = 'block';
  } else {
    noHerramientas.style.display = 'none';
    herramientas.forEach(item => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${item.nombre || '-'}</td>
        <td>${item.descripcion || '-'}</td>
        <td>${item.cantidad || '-'}</td>
        <td>${item.fecha || '-'}</td>
        <td>${item.marca || '-'}</td>
      `;
      herramientasBody.appendChild(fila);
    });
  }
  
  // Mostrar insumos
  const insumosBody = document.getElementById('insumosBody');
  const noInsumos = document.getElementById('noInsumos');
  
  insumosBody.innerHTML = '';
  if (insumos.length === 0) {
    noInsumos.style.display = 'block';
  } else {
    noInsumos.style.display = 'none';
    insumos.forEach(item => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${item.nombre || '-'}</td>
        <td>${item.descripcion || '-'}</td>
        <td>${item.cantidad || '-'}</td>
        <td>${item.fecha || '-'}</td>
        <td>${item.marca || '-'}</td>
      `;
      insumosBody.appendChild(fila);
    });
  }
  
  // Mostrar docentes 
  const docentesBody = document.getElementById('docentesBody');
  const noDocentes = document.getElementById('noDocentes');
  
  docentesBody.innerHTML = '';
  if (docentes.length === 0) {
    noDocentes.style.display = 'block';
  } else {
    noDocentes.style.display = 'none';
    docentes.forEach(item => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${item.nombre || '-'}</td>
        <td>${item.taller || '-'}</td>
      `;
      docentesBody.appendChild(fila);
    });
  }
}

      // Función para ordenar alfabéticamente
      function ordenarAlfabeticamente(array) {
        return array.sort((a, b) => {
          const nombreA = (a.nombre || '').toLowerCase();
          const nombreB = (b.nombre || '').toLowerCase();
          if (nombreA < nombreB) return -1;
          if (nombreA > nombreB) return 1;
          return 0;
        });
      }

      // Función para encontrar el índice real en el array completo
      function encontrarIndiceReal(item) {
        const inventario = JSON.parse(localStorage.getItem('inventario')) || [];
        const docentes = JSON.parse(localStorage.getItem('docentes')) || [];
        
        if (item.tipo === 'Docente') {
          for (let i = 0; i < docentes.length; i++) {
            if (docentes[i].nombre === item.nombre && 
                docentes[i].taller === item.taller) {
              return i;
            }
          }
        } else {
          for (let i = 0; i < inventario.length; i++) {
            if (inventario[i].tipo === item.tipo &&
                inventario[i].nombre === item.nombre &&
                inventario[i].descripcion === item.descripcion) {
              return i;
            }
          }
        }
        return -1;
      }

      // Función para abrir modal de edición desde botón individual
      window.abrirModalEdicion = function(index) {
        const inventario = JSON.parse(localStorage.getItem('inventario')) || [];
        const docentes = JSON.parse(localStorage.getItem('docentes')) || [];
        const item = inventario[index];
        
        // Llenar el formulario con los datos actuales
        editIndex.value = index;
        editTipo.value = item.tipo;
        editNombre.value = item.nombre || '';
        editDescripcion.value = item.descripcion || '';
        editCantidad.value = item.cantidad || '';
        editFecha.value = item.fecha || '';
        editMarca.value = item.marca || '';
        editTaller.value = item.taller || '';
        
        // Mostrar/ocultar campos según el tipo
        toggleCamposEdicion(item.tipo);
        
        // Mostrar el modal
        editModal.style.display = 'block';
      }

      // Función para mostrar/ocultar campos según el tipo
      function toggleCamposEdicion(tipo) {
        if (tipo === 'Docente') {
          editDescripcionGroup.style.display = 'none';
          editCantidadGroup.style.display = 'none';
          editFechaGroup.style.display = 'none';
          editMarcaGroup.style.display = 'none';
          editTallerGroup.style.display = 'block';
        } else {
          editDescripcionGroup.style.display = 'block';
          editCantidadGroup.style.display = 'block';
          editFechaGroup.style.display = 'block';
          editMarcaGroup.style.display = 'block';
          editTallerGroup.style.display = 'none';
        }
      }

      // Función para guardar los cambios
      function guardarEdicion() {
        const inventario = JSON.parse(localStorage.getItem('inventario')) || [];
        const docentes = JSON.parse(localStorage.getItem('docentes')) || [];
        const index = parseInt(editIndex.value);
        
        if (index >= 0 && index < inventario.length) {
          // Mantener la fecha original (no editable)
          const fechaOriginal = inventario[index].fecha;
          
          // Actualizar el item con los nuevos valores
          inventario[index] = {
            tipo: editTipo.value,
            nombre: editNombre.value,
            descripcion: editDescripcion.value,
            cantidad: editCantidad.value,
            fecha: fechaOriginal, // Mantener fecha original
            marca: editMarca.value,
            taller: editTaller.value
          };
          
          // Guardar en localStorage
          localStorage.setItem('inventario', JSON.stringify(inventario));
          
          // Recargar los datos y cerrar el modal
          cargarDatos();
          editModal.style.display = 'none';
          alert('Registro actualizado correctamente');
        }
      }

      // Función para abrir modal de eliminación/edición
      function abrirModal(tipo) {
        currentModalType = tipo;
        const inventario = JSON.parse(localStorage.getItem('inventario')) || [];
        const docentes = JSON.parse(localStorage.getItem('docentes')) || [];
       
        if (inventario.length === 0 && docentes.length === 0) {
          alert('No hay registros para ' + (tipo === 'delete' ? 'eliminar' : 'editar'));
          return;
        }
       
        // Reiniciar el modal
        deleteStep1.classList.add('active');
        deleteStep2.classList.remove('active');
        deleteTypeSelect.value = '';
        deleteSearchInput.value = '';
        deleteTableBody.innerHTML = '';
        noDeleteResults.style.display = 'none';
        nextStep.style.display = 'none';
        confirmDelete.style.display = 'none';
        selectedType = '';
        selectedItemId = null;
       
        // Cambiar título según el tipo
        const modalTitle = document.querySelector('.modal-title');
        modalTitle.textContent = (tipo === 'delete' ? 'Eliminar Registro' : 'Editar Registro');
       
        // Mostrar modal correspondiente
        if (tipo === 'delete') {
          deleteModal.style.display = 'block';
        } else {
          // Para edición, usar el mismo modal de eliminación para seleccionar
          deleteModal.style.display = 'block';
        }
      }

     // Función para cargar registros en el paso 2 - VERSIÓN CORREGIDA
function cargarRegistrosParaModal() {
  const inventario = JSON.parse(localStorage.getItem('inventario')) || [];
  
  if (selectedType === 'Docente') {
    filteredItems = ordenarAlfabeticamente(inventario.filter(item => item.tipo === 'Docente'));
  } else {
    filteredItems = ordenarAlfabeticamente(inventario.filter(item => item.tipo === selectedType));
  }
  
  deleteTableBody.innerHTML = '';
  
  if (filteredItems.length === 0) {
    noDeleteResults.style.display = 'block';
    return;
  }
  
  noDeleteResults.style.display = 'none';
  
  filteredItems.forEach((item, index) => {
    const fila = document.createElement('tr');
    fila.dataset.id = index;
    
    // Mostrar diferentes detalles según el tipo
    let detalles = '';
    if (selectedType === 'Docente') {
      detalles = `Taller: ${item.taller || 'No especificado'}`;
    } else {
      detalles = `Descripción: ${item.descripcion || 'No especificada'} | Cantidad: ${item.cantidad || 0} | Marca: ${item.marca || 'No especificada'}`;
    }
    
    fila.innerHTML = `
      <td><input type="radio" name="modalItem" value="${index}"></td>
      <td>${item.nombre}</td>
      <td>${detalles}</td>
    `;
    
    fila.addEventListener('click', function(e) {
      if (e.target.type === 'radio') return;
      
      const radio = fila.querySelector('input[type="radio"]');
      radio.checked = true;
      
      selectedItemId = parseInt(radio.value);
      
      document.querySelectorAll('#deleteTableBody tr').forEach(row => {
        row.classList.remove('selected');
      });
      
      fila.classList.add('selected');
    });
    
    const radio = fila.querySelector('input[type="radio"]');
    radio.addEventListener('change', function() {
      if (this.checked) {
        selectedItemId = parseInt(this.value);
        
        document.querySelectorAll('#deleteTableBody tr').forEach(row => {
          row.classList.remove('selected');
        });
        
        fila.classList.add('selected');
      }
    });
    
    deleteTableBody.appendChild(fila);
  });
  
  if (deleteSearchInput.value.trim() !== '') {
    filtrarRegistrosModal();
  }
}

      // Función para filtrar registros en el paso 2
      function filtrarRegistrosModal() {
        const termino = deleteSearchInput.value.trim().toLowerCase();
        let resultadosVisibles = 0;
       
        filteredItems.forEach((item, index) => {
          const fila = document.querySelector(`#deleteTableBody tr[data-id="${index}"]`);
         
          if (termino === '') {
            fila.style.display = '';
            resultadosVisibles++;
            return;
          }
         
          const nombre = item.nombre.toLowerCase();
          const detalles = selectedType === 'Docente'
            ? (item.taller || '').toLowerCase()
            : `${item.descripcion || ''} ${item.cantidad || ''} ${item.marca || ''}`.toLowerCase();
         
          if (nombre.includes(termino) || detalles.includes(termino)) {
            fila.style.display = '';
            resultadosVisibles++;
          } else {
            fila.style.display = 'none';
          }
        });
       
        noDeleteResults.style.display = resultadosVisibles === 0 ? 'block' : 'none';
      }

      // Función para eliminar un registro - VERSIÓN CORREGIDA
function eliminarRegistro() {
  if (selectedItemId === null) {
    alert('Por favor seleccione un registro para eliminar');
    return;
  }
  
  const inventario = JSON.parse(localStorage.getItem('inventario')) || [];
  
  // Buscar el índice real en el array completo usando el item seleccionado
  const itemSeleccionado = filteredItems[selectedItemId];
  let realIndex = -1;
  
  for (let i = 0; i < inventario.length; i++) {
    if (inventario[i].tipo === itemSeleccionado.tipo &&
        inventario[i].nombre === itemSeleccionado.nombre) {
      
      // Para docentes, comparar también el taller
      if (itemSeleccionado.tipo === 'Docente') {
        if (inventario[i].taller === itemSeleccionado.taller) {
          realIndex = i;
          break;
        }
      } else {
        // Para herramientas e insumos, comparar descripción
        if (inventario[i].descripcion === itemSeleccionado.descripcion) {
          realIndex = i;
          break;
        }
      }
    }
  }
  
  if (realIndex >= 0) {
    if (confirm('¿Está seguro que desea eliminar este registro?')) {
      inventario.splice(realIndex, 1);
      localStorage.setItem('inventario', JSON.stringify(inventario));
      cargarDatos();
      deleteModal.style.display = 'none';
      alert('Registro eliminado correctamente');
    }
  } else {
    alert('Error: No se pudo encontrar el registro para eliminar');
  }
}

      // Función para procesar la selección de edición
      function procesarSeleccionEdicion() {
        if (selectedItemId === null) {
          alert('Por favor seleccione un registro para editar');
          return;
        }
        
        const itemSeleccionado = filteredItems[selectedItemId];
        const inventario = JSON.parse(localStorage.getItem('inventario')) || [];
        const docentes = JSON.parse(localStorage.getItem('docentes')) || [];
        
        if (selectedType === 'Docente') {
          // Cerrar modal de selección y abrir modal de edición para docente
          deleteModal.style.display = 'none';
          
          // Llenar el formulario con los datos del docente
          editIndex.value = selectedItemId;
          editTipo.value = 'Docente';
          editNombre.value = itemSeleccionado.nombre || '';
          editTaller.value = itemSeleccionado.taller || '';
          
          // Mostrar/ocultar campos según el tipo
          toggleCamposEdicion('Docente');
          
          // Mostrar el modal de edición
          editModal.style.display = 'block';
        } else {
          let realIndex = -1;
          
          // Buscar el índice real
          for (let i = 0; i < inventario.length; i++) {
            if (inventario[i].tipo === itemSeleccionado.tipo &&
                inventario[i].nombre === itemSeleccionado.nombre &&
                inventario[i].descripcion === itemSeleccionado.descripcion) {
              realIndex = i;
              break;
            }
          }
          
          if (realIndex >= 0) {
            // Cerrar modal de selección y abrir modal de edición
            deleteModal.style.display = 'none';
            abrirModalEdicion(realIndex);
          }
        }
      }

      // Event Listeners
      exportBtn.addEventListener('click', exportarExcel);
      deleteBtn.addEventListener('click', () => abrirModal('delete'));
      editBtn.addEventListener('click', () => abrirModal('edit'));
      closeModal.addEventListener('click', () => deleteModal.style.display = 'none');
      cancelDelete.addEventListener('click', () => deleteModal.style.display = 'none');
      
      // Event listeners para edición
      closeEditModal.addEventListener('click', () => editModal.style.display = 'none');
      cancelEdit.addEventListener('click', () => editModal.style.display = 'none');
      saveEdit.addEventListener('click', guardarEdicion);
     
      // Evento para el botón Siguiente en el modal
      nextStep.addEventListener('click', function() {
        if (deleteTypeSelect.value === '') {
          alert('Por favor seleccione un tipo de registro');
          return;
        }
       
        selectedType = deleteTypeSelect.value;
        deleteStep1.classList.remove('active');
        deleteStep2.classList.add('active');
        nextStep.style.display = 'none';
        
        if (currentModalType === 'delete') {
          confirmDelete.style.display = 'block';
          confirmDelete.textContent = 'Eliminar';
        } else {
          confirmDelete.style.display = 'block';
          confirmDelete.textContent = 'Editar';
        }
       
        cargarRegistrosParaModal();
      });
     
      // Evento para el botón Volver en el paso 2
      backToStep1.addEventListener('click', function() {
        deleteStep1.classList.add('active');
        deleteStep2.classList.remove('active');
        nextStep.style.display = 'block';
        confirmDelete.style.display = 'none';
        selectedItemId = null;
      });
     
      // Evento para confirmar acción (eliminar o editar)
      confirmDelete.addEventListener('click', function() {
        if (currentModalType === 'delete') {
          eliminarRegistro();
        } else {
          procesarSeleccionEdicion();
        }
      });
     
      // Mostrar/ocultar botón Siguiente cuando se selecciona un tipo
      deleteTypeSelect.addEventListener('change', function() {
        nextStep.style.display = this.value ? 'block' : 'none';
      });
     
      // Evento para buscar en el paso 2
      deleteSearchInput.addEventListener('input', filtrarRegistrosModal);

      // Cerrar modales al hacer clic fuera de ellos
      window.addEventListener('click', (event) => {
        if (event.target === deleteModal) {
          deleteModal.style.display = 'none';
        }
        if (event.target === editModal) {
          editModal.style.display = 'none';
        }
      });

      // Función para alternar acordeones
      window.toggleAccordion = function(section) {
        const content = document.getElementById(section + 'Content');
        content.classList.toggle('show');
      };

      // Función para realizar búsqueda - VERSIÓN CORREGIDA
function realizarBusqueda() {
  const termino = searchInput.value.trim().toLowerCase();
  const inventario = JSON.parse(localStorage.getItem('inventario')) || [];
  
  if (termino === '') {
    searchResults.classList.remove('show');
    return;
  }
  
  const resultados = [];
  
  // Buscar en todo el inventario (herramientas, insumos y docentes)
  inventario.forEach(item => {
    if ((item.nombre && item.nombre.toLowerCase().includes(termino)) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(termino)) ||
        (item.marca && item.marca.toLowerCase().includes(termino)) ||
        (item.taller && item.taller.toLowerCase().includes(termino))) {
      
      // Para docentes, mostrar información específica
      if (item.tipo === 'Docente') {
        resultados.push({
          tipo: item.tipo,
          nombre: item.nombre,
          descripcion: 'Docente',
          cantidad: '-',
          fecha: '-',
          marca: item.taller // Usamos el campo marca para mostrar el taller
        });
      } else {
        resultados.push({
          tipo: item.tipo,
          nombre: item.nombre,
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          fecha: item.fecha,
          marca: item.marca
        });
      }
    }
  });
  
  mostrarResultadosBusqueda(resultados);
}

      // Función para mostrar resultados de búsqueda
      function mostrarResultadosBusqueda(resultados) {
        searchTableBody.innerHTML = '';
        
        if (resultados.length === 0) {
          noResults.style.display = 'block';
          searchResults.classList.add('show');
          return;
        }
        
        noResults.style.display = 'none';
        
        resultados.forEach(item => {
          const fila = document.createElement('tr');
          
          // Determinar qué mostrar en la columna Marca/Taller según el tipo
          const marcaTaller = item.tipo === 'Docente' ? item.marca || '-' : item.marca || '-';
          
          fila.innerHTML = `
            <td>${item.tipo || '-'}</td>
            <td>${item.nombre || '-'}</td>
            <td>${item.descripcion || '-'}</td>
            <td>${item.cantidad || '-'}</td>
            <td>${item.fecha || '-'}</td>
            <td>${marcaTaller}</td>
          `;
          
          searchTableBody.appendChild(fila);
        });
        
        searchResults.classList.add('show');
      }

      // Función para exportar a Excel (sin cambios)
      function exportarExcel() {
        const inventario = JSON.parse(localStorage.getItem('inventario')) || [];
        const docentes = JSON.parse(localStorage.getItem('docentes')) || [];
        
        if (inventario.length === 0 && docentes.length === 0) {
          alert('No hay datos para exportar');
          return;
        }

        // Separar datos por tipo
        const herramientas = ordenarAlfabeticamente(inventario.filter(item => item.tipo === 'Herramienta'));
        const insumos = ordenarAlfabeticamente(inventario.filter(item => item.tipo === 'Insumo'));
        const docentesOrdenados = ordenarAlfabeticamente(docentes);

        // Crear un libro de trabajo con formato específico
        let workbook = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                xmlns:x="urn:schemas-microsoft-com:office:excel" 
                xmlns="http://www.w3.org/TR/REC-html40">
          <head>
            <meta charset="UTF-8">
            <title>Inventario CET 1</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #ffffff;
                color: #000000;
              }
              
              /* MEMBRETE IDÉNTICO AL HISTORIAL */
              .membrete {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
                border: 2px solid #000000;
              }
              
              .membrete td {
                padding: 10px;
                border: 1px solid #000000;
                text-align: center;
                vertical-align: middle;
              }
              
              .membrete .logo {
                width: 100px;
                background-color: #f0f0f0;
                font-weight: bold;
                font-size: 16px;
              }
              
              .membrete .titulo {
                background-color: #d9ead3;
                font-size: 18px;
                font-weight: bold;
              }
              
              .membrete .subtitulo {
                background-color: #c9daf8;
                font-size: 14px;
                font-weight: bold;
              }
              
              .membrete .info {
                background-color: #fff2cc;
                font-size: 12px;
              }
              
              /* TÍTULOS DE SECCIÓN */
              .seccion {
                margin: 25px 0 15px 0;
                background-color: #4a86e8;
                color: white;
                padding: 12px;
                font-weight: bold;
                font-size: 16px;
                border: 1px solid #000000;
              }
              
              .contador {
                float: right;
                background-color: #ff9900;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 14px;
              }
              
              /* TABLAS CON FORMATO ESPECÍFICO - TÍTULOS MÁS VISIBLES */
              .tabla-inventario {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 25px;
                font-size: 12px;
              }
              
              .tabla-inventario th {
                background-color: #5b9bd5;
                color: #ffffff;
                font-weight: bold;
                text-align: center;
                padding: 12px 8px;
                border: 2px solid #2f75b5;
                font-size: 13px;
                text-transform: uppercase;
              }
              
              .tabla-inventario td {
                padding: 10px 8px;
                border: 1px solid #d0d0d0;
                text-align: left;
              }
              
              .tabla-inventario tr:nth-child(even) {
                background-color: #f9f9f9;
              }
              
              .tabla-inventario tr:hover {
                background-color: #e6f3ff;
              }
              
              /* ESTADO SIN DATOS */
              .sin-datos {
                text-align: center;
                padding: 30px;
                color: #666;
                font-style: italic;
                background-color: #f8f8f8;
                border: 2px dashed #cccccc;
                margin: 20px 0;
                font-size: 14px;
              }
              
              .texto-centrado { text-align: center; }
              .texto-negrita { font-weight: bold; }
              .texto-mayusculas { text-transform: uppercase; }
            </style>
          </head>
          <body>
            <!-- MEMBRETE IDÉNTICO AL HISTORIAL -->
            <table class="membrete">
              <tr>
                <td class="logo" rowspan="3">CET 1</td>
                <td class="titulo" colspan="3">INSTITUCIÓN TÉCNICA CET 1</td>
              </tr>
              <tr>
                <td class="subtitulo" colspan="3">SISTEMA INTEGRAL DE GESTIÓN DE INVENTARIO - DEPÓSITO PAÑOL</td>
              </tr>
              <tr>
                <td class="info">General Roca, Río Negro</td>
                <td class="info">Fecha: ${new Date().toLocaleDateString('es-AR')}</td>
                <td class="info">Hora: ${new Date().toLocaleTimeString('es-AR')}</td>
              </tr>
            </table>
        `;

        // SECCIÓN: HERRAMIENTAS
        workbook += `
            <div class="seccion">
              📊 INVENTARIO DE HERRAMIENTAS
              <span class="contador">${herramientas.length} REGISTROS</span>
            </div>
        `;
        
        if (herramientas.length > 0) {
          workbook += `
            <table class="tabla-inventario">
              <tr>
                <th colspan="5" style="background:#ffe599; color:#222; font-size:15px;">
                  TABLA DE HERRAMIENTAS
                </th>
              </tr>
              <thead>
                <tr>
                  <th width="25%">nombre</th>
                  <th width="30%">descripción</th>
                  <th width="10%">cantidad</th>
                  <th width="15%">fecha de registro</th>
                  <th width="20%">marca</th>
                </tr>
              </thead>
              <tbody>
          `;
            
          herramientas.forEach(item => {
            workbook += `
              <tr>
                <td class="texto-negrita">${item.nombre || 'SIN NOMBRE'}</td>
                <td>${item.descripcion || 'SIN DESCRIPCIÓN'}</td>
                <td class="texto-centrado texto-negrita">${item.cantidad || '0'}</td>
                <td class="texto-centrado">${item.fecha || 'NO ESPECIFICADA'}</td>
                <td>${item.marca || 'SIN MARCA'}</td>
              </tr>
            `;
          });
          
          workbook += `</tbody></table>`;
        } else {
          workbook += `
            <div class="sin-datos">No hay herramientas registradas en el inventario</div>
          `;
        }

        // SECCIÓN: INSUMOS
        workbook += `
            <div class="seccion">
              📦 INVENTARIO DE INSUMOS
              <span class="contador">${insumos.length} REGISTROS</span>
            </div>
        `;
        
        if (insumos.length > 0) {
          workbook += `
            <table class="tabla-inventario">
              <tr>
                <th colspan="5" style="background:#ffe599; color:#222; font-size:15px;">
                  TABLA DE INSUMOS
                </th>
              </tr>
              <thead>
                <tr>
                  <th width="25%">nombre</th>
                  <th width="30%">descripción</th>
                  <th width="10%">cantidad</th>
                  <th width="15%">fecha de registro</th>
                  <th width="20%">marca</th>
                </tr>
              </thead>
              <tbody>
          `;
            
          insumos.forEach(item => {
            workbook += `
              <tr>
                <td class="texto-negrita">${item.nombre || 'SIN NOMBRE'}</td>
                <td>${item.descripcion || 'SIN DESCRIPCIÓN'}</td>
                <td class="texto-centrado texto-negrita">${item.cantidad || '0'}</td>
                <td class="texto-centrado">${item.fecha || 'NO ESPECIFICADA'}</td>
                <td>${item.marca || 'SIN MARCA'}</td>
              </tr>
            `;
          });
          
          workbook += `</tbody></table>`;
        } else {
          workbook += `
            <div class="sin-datos">No hay insumos registrados en el inventario</div>
          `;
        }

        // SECCIÓN: DOCENTES
        workbook += `
            <div class="seccion">
              👨‍🏫 REGISTRO DE DOCENTES
              <span class="contador">${docentesOrdenados.length} REGISTROS</span>
            </div>
        `;
        
        if (docentesOrdenados.length > 0) {
          workbook += `
            <table class="tabla-inventario">
              <tr>
                <th colspan="2" style="background:#cfe2f3; color:#222; font-size:15px;">
                  TABLA DE DOCENTES
                </th>
              </tr>
              <thead>
                <tr>
                  <th width="50%">nombre del docente</th>
                  <th width="50%">taller que imparte</th>
                </tr>
              </thead>
              <tbody>
          `;
            
          docentesOrdenados.forEach(item => {
            workbook += `
              <tr>
                <td class="texto-negrita">${item.nombre || 'SIN NOMBRE'}</td>
                <td>${item.taller || 'NO ESPECIFICADO'}</td>
              </tr>
            `;
          });
          
          workbook += `</tbody></table>`;
        } else {
          workbook += `
            <div class="sin-datos">No hay docentes registrados en el sistema</div>
          `;
        }

        workbook += `</body></html>`;

        // Crear y descargar archivo
        try {
          const blob = new Blob(["\uFEFF" + workbook], { 
            type: 'application/vnd.ms-excel;charset=utf-8' 
          });
          
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          const fecha = new Date().toISOString().split('T')[0];
          
          link.setAttribute('href', url);
          link.setAttribute('download', `Inventario_CET1_${fecha}.xls`);
          link.style.visibility = 'hidden';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          setTimeout(() => URL.revokeObjectURL(url), 100);
          
          alert(`✅ Inventario exportado correctamente\n📊 ${herramientas.length} herramientas\n📦 ${insumos.length} insumos\n👨‍🏫 ${docentesOrdenados.length} docentes`);
          
        } catch (error) {
          console.error('Error al exportar:', error);
          alert('❌ Error al exportar el archivo. Por favor, intente nuevamente.');
        }
      }

      // Cargar datos al iniciar la página
      cargarDatos();
});