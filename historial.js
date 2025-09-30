    // Variables globales
    const fechaConsultaInput = document.getElementById('fechaConsulta');
    const consultarBtn = document.getElementById('consultarBtn');
    const exportarBtn = document.getElementById('exportarBtn');
    const tablaPedidos = document.getElementById('tablaPedidos').getElementsByTagName('tbody')[0];
    const sinResultados = document.getElementById('sinResultados');
    const alertContainer = document.getElementById('alertContainer');
    let alertTimers = [];


    // Establecer fecha actual por defecto
    window.addEventListener('DOMContentLoaded', function() {
      const hoy = new Date();
      const fechaFormateada = hoy.toISOString().split('T')[0];
      fechaConsultaInput.value = fechaFormateada;
     
      // Cargar pedidos del día actual al iniciar
      consultarPedidos();
    });


    // Evento para el botón de consultar
    consultarBtn.addEventListener('click', consultarPedidos);


    // Evento para el botón de exportar
    exportarBtn.addEventListener('click', exportarAExcel);


    // Función para mostrar alertas temporales
    function mostrarAlerta(mensaje, tipo) {
      // Limpiar alertas previas y temporizadores
      alertContainer.innerHTML = '';
      alertTimers.forEach(timer => clearTimeout(timer));
      alertTimers = [];
     
      const alertDiv = document.createElement('div');
      alertDiv.className = `alert-message alert-${tipo}`;
      alertDiv.textContent = mensaje;
     
      // Agregar barra de tiempo
      const timerBar = document.createElement('div');
      timerBar.className = 'alert-timer';
      alertDiv.appendChild(timerBar);
     
      alertContainer.appendChild(alertDiv);
     
      // Configurar temporizador para eliminar la alerta después de 5 segundos
      const timer = setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
          if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
          }
        }, 500);
      }, 5000);
     
      alertTimers.push(timer);
    }


    // Función para validar fecha
    function validarFecha(fecha) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Eliminar la parte de la hora para comparar solo fechas
     
      const fechaSeleccionada = new Date(fecha);
     
      if (fechaSeleccionada > hoy) {
        mostrarAlerta("Por favor, seleccione una fecha válida (hoy o anterior)", "warning");
        return false;
      }
     
      return true;
    }


    // Función para consultar pedidos
    function consultarPedidos() {
      const fechaSeleccionada = fechaConsultaInput.value;
     
      if (!fechaSeleccionada) {
        mostrarAlerta('Por favor seleccione una fecha', 'warning');
        return;
      }


      // Validar fecha
      if (!validarFecha(fechaSeleccionada)) {
        return;
      }


      // Obtener pedidos del localStorage
      const pedidosPorFecha = JSON.parse(localStorage.getItem('pedidosPorFecha')) || {};
      const pedidosDelDia = pedidosPorFecha[fechaSeleccionada] || [];
     
      mostrarPedidos(pedidosDelDia, fechaSeleccionada);
    }


    // Función para mostrar pedidos en la tabla
    function mostrarPedidos(pedidos, fechaSeleccionada) {
      // Limpiar tabla
      tablaPedidos.innerHTML = '';
     
      if (pedidos.length === 0) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaSel = new Date(fechaSeleccionada);
       
        if (fechaSel.getTime() < hoy.getTime()) {
          mostrarAlerta("No se realizaron pedidos en la fecha seleccionada", "info");
        }
       
        sinResultados.style.display = 'block';
        return;
      }
     
      sinResultados.style.display = 'none';
     
      // Llenar tabla con los pedidos
      pedidos.forEach(pedido => {
        const fila = document.createElement('tr');
       
        // Determinar el nombre del item según el tipo
        const nombreItem = pedido.tipo === 'Herramienta' ? pedido.herramienta : pedido.insumo;
       
        fila.innerHTML = `
          <td>${pedido.tipo}</td>
          <td>${pedido.profesor}</td>
          <td>${pedido.asignatura}</td>
          <td>${nombreItem}</td>
          <td>${pedido.cantidad}</td>
          <td>${pedido.hora || 'No especificada'}</td>
        `;
       
        tablaPedidos.appendChild(fila);
      });
    }


    // Función para exportar a Excel
    function exportarAExcel() {
      const fechaSeleccionada = fechaConsultaInput.value;
     
      if (!fechaSeleccionada) {
        mostrarAlerta('Por favor seleccione una fecha primero', 'warning');
        return;
      }


      // Obtener pedidos del localStorage
      const pedidosPorFecha = JSON.parse(localStorage.getItem('pedidosPorFecha')) || {};
      const pedidosDelDia = pedidosPorFecha[fechaSeleccionada] || [];
     
      if (pedidosDelDia.length === 0) {
        mostrarAlerta('No hay pedidos para exportar en esta fecha', 'warning');
        return;
      }


      try {
        const fecha = fechaSeleccionada;
        const fechaFormateada = fecha.split('-').reverse().join('-');
       
        // Crear contenido HTML para el Excel
        let html = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
          <head>
            <meta charset="UTF-8">
            <style>
              .header-container {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
                border-bottom: 2px solid #003366;
                padding-bottom: 10px;
              }
              .logo {
                height: 50px;
                margin-right: 15px;
              }
              .header-text {
                flex: 1;
              }
              .titulo {
                font-size: 16px;
                font-weight: bold;
                text-align: center;
                color: #003366;
              }
              .subtitulo {
                font-size: 12px;
                text-align: center;
                margin-bottom: 3px;
                color: #555;
              }
              th {
                background-color: #003366;
                color: white;
                font-weight: bold;
                text-align: center;
                padding: 6px;
                font-size: 12px;
              }
              td {
                padding: 5px;
                border: 1px solid #ddd;
                font-size: 11px;
              }
              table {
                border-collapse: collapse;
                width: 100%;
                margin-bottom: 15px;
              }
            </style>
          </head>
          <body>
            <div class="header-container">
              <div class="header-text">
                <div class="titulo">INSTITUCIÓN TÉCNICA CET 1 - Historial de Pedidos</div>
                <div class="subtitulo">Fecha: ${fechaFormateada}</div>
                <div class="subtitulo">Total de pedidos: ${pedidosDelDia.length}</div>
              </div>
            </div>
           
            <table>
              <tr>
                <th>Tipo</th>
                <th>Profesor</th>
                <th>Asignatura</th>
                <th>Item</th>
                <th>Cantidad</th>
                <th>Hora</th>
              </tr>
        `;


        pedidosDelDia.forEach(pedido => {
          const nombreItem = pedido.tipo === 'Herramienta' ? pedido.herramienta : pedido.insumo;
         
          html += `
            <tr>
              <td>${pedido.tipo}</td>
              <td>${pedido.profesor}</td>
              <td>${pedido.asignatura}</td>
              <td>${nombreItem}</td>
              <td>${pedido.cantidad}</td>
              <td>${pedido.hora || 'No especificada'}</td>
            </tr>
          `;
        });


        html += `</table></body></html>`;


        // Crear archivo y descargar
        const blob = new Blob(["\uFEFF" + html], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Historial_Pedidos_${fecha}.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
       
        mostrarAlerta('Reporte exportado correctamente', 'success');
      } catch (e) {
        console.error('Error al exportar:', e);
        mostrarAlerta('Error al exportar el reporte', 'warning');
      }
    }
