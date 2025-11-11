// Variables globales
const fechaConsultaInput = document.getElementById('fechaConsulta');
const consultarBtn = document.getElementById('consultarBtn');
const exportarBtn = document.getElementById('exportarBtn');
const periodoExportacionSelect = document.getElementById('periodoExportacion');
const alertContainer = document.getElementById('alertContainer');
const sinResultados = document.getElementById('sinResultados');
const resumenContainer = document.getElementById('resumenContainer');
const totalHerramientas = document.getElementById('totalHerramientas');
const totalInsumos = document.getElementById('totalInsumos');
const totalGeneral = document.getElementById('totalGeneral');

// Tablas
const tablaHerramientas = document.getElementById('tablaHerramientas').getElementsByTagName('tbody')[0];
const tablaInsumos = document.getElementById('tablaInsumos').getElementsByTagName('tbody')[0];
const seccionHerramientas = document.getElementById('seccionHerramientas');
const seccionInsumos = document.getElementById('seccionInsumos');
const sinHerramientas = document.getElementById('sinHerramientas');
const sinInsumos = document.getElementById('sinInsumos');

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
  
  // Obtener pedidos de herramientas
  const pedidosHerramientas = JSON.parse(localStorage.getItem('pedidosHerramientas')) || [];
  const herramientasDelDia = pedidosHerramientas.filter(pedido => pedido.fecha === fechaSeleccionada);
 
  mostrarPedidos(pedidosDelDia, herramientasDelDia, fechaSeleccionada);
}

// Función para mostrar pedidos en las tablas
function mostrarPedidos(pedidosInsumos, pedidosHerramientas, fechaSeleccionada) {
  // Limpiar tablas
  tablaHerramientas.innerHTML = '';
  tablaInsumos.innerHTML = '';
  
  // Ocultar todas las secciones inicialmente
  sinResultados.style.display = 'none';
  seccionHerramientas.style.display = 'none';
  seccionInsumos.style.display = 'none';
  sinHerramientas.style.display = 'none';
  sinInsumos.style.display = 'none';
  resumenContainer.style.display = 'none';

  // Contadores para el resumen
  let contadorHerramientas = 0;
  let contadorInsumos = 0;

  // Mostrar pedidos de herramientas
  if (pedidosHerramientas.length > 0) {
    seccionHerramientas.style.display = 'block';
    contadorHerramientas = pedidosHerramientas.length;
    
    pedidosHerramientas.forEach(pedido => {
      const fila = document.createElement('tr');
     
      fila.innerHTML = `
        <td>${pedido.profesor}</td>
        <td>${pedido.asignatura}</td>
        <td>${pedido.herramienta}</td>
        <td>${pedido.cantidad}</td>
        <td>${pedido.fecha}</td>
        <td>${pedido.hora || 'No especificada'}</td>
      `;
     
      tablaHerramientas.appendChild(fila);
    });
  } else {
    sinHerramientas.style.display = 'block';
  }

  // Mostrar pedidos de insumos
  if (pedidosInsumos.length > 0) {
    seccionInsumos.style.display = 'block';
    contadorInsumos = pedidosInsumos.length;
    
    pedidosInsumos.forEach(pedido => {
      const fila = document.createElement('tr');
      
      // Determinar el nombre del item
      const nombreItem = pedido.insumo;
     
      fila.innerHTML = `
        <td>${pedido.profesor}</td>
        <td>${pedido.asignatura}</td>
        <td>${nombreItem}</td>
        <td>${pedido.cantidad}</td>
        <td>${pedido.fecha}</td>
        <td>${pedido.hora || 'No especificada'}</td>
      `;
     
      tablaInsumos.appendChild(fila);
    });
  } else {
    sinInsumos.style.display = 'block';
  }

  // Mostrar mensaje si no hay resultados
  if (pedidosHerramientas.length === 0 && pedidosInsumos.length === 0) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaSel = new Date(fechaSeleccionada);
   
    if (fechaSel.getTime() < hoy.getTime()) {
      mostrarAlerta("No se realizaron pedidos en la fecha seleccionada", "info");
    }
   
    sinResultados.style.display = 'block';
  } else {
    // Mostrar resumen
    resumenContainer.style.display = 'flex';
    totalHerramientas.textContent = contadorHerramientas;
    totalInsumos.textContent = contadorInsumos;
    totalGeneral.textContent = contadorHerramientas + contadorInsumos;
  }
}

// Función para obtener pedidos por período
function obtenerPedidosPorPeriodo(meses) {
  const fechaFin = new Date();
  const fechaInicio = new Date();
  fechaInicio.setMonth(fechaInicio.getMonth() - meses);
  
  // Obtener todos los pedidos de herramientas
  const pedidosHerramientas = JSON.parse(localStorage.getItem('pedidosHerramientas')) || [];
  const herramientasFiltradas = pedidosHerramientas.filter(pedido => {
    const fechaPedido = new Date(pedido.fecha);
    return fechaPedido >= fechaInicio && fechaPedido <= fechaFin;
  });
  
  // Obtener todos los pedidos de insumos
  const pedidosPorFecha = JSON.parse(localStorage.getItem('pedidosPorFecha')) || {};
  let insumosFiltrados = [];
  
  // Recorrer todas las fechas en el almacenamiento
  Object.keys(pedidosPorFecha).forEach(fecha => {
    const fechaPedido = new Date(fecha);
    if (fechaPedido >= fechaInicio && fechaPedido <= fechaFin) {
      insumosFiltrados = insumosFiltrados.concat(pedidosPorFecha[fecha]);
    }
  });
  
  return {
    herramientas: herramientasFiltradas,
    insumos: insumosFiltrados
  };
}

// Función para exportar a Excel
function exportarAExcel() {
  const periodoMeses = parseInt(periodoExportacionSelect.value);
  const pedidos = obtenerPedidosPorPeriodo(periodoMeses);
 
  if (pedidos.herramientas.length === 0 && pedidos.insumos.length === 0) {
    mostrarAlerta('No hay pedidos para exportar en el período seleccionado', 'warning');
    return;
  }

  try {
    const fecha = new Date().toISOString().split('T')[0];
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
          .resumen {
            display: flex;
            justify-content: space-around;
            margin: 15px 0;
            padding: 10px;
            background: #f0f8ff;
            border-radius: 5px;
          }
          .resumen-item {
            text-align: center;
          }
          .resumen-cantidad {
            font-size: 18px;
            font-weight: bold;
            color: #003366;
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
          .seccion-titulo {
            background-color: #e6f0fa;
            padding: 8px;
            font-weight: bold;
            margin-top: 20px;
            border-left: 4px solid #003366;
          }
        </style>
      </head>
      <body>
        <div class="header-container">
          <div class="header-text">
            <div class="titulo">INSTITUCIÓN TÉCNICA CET 1 - Historial Completo de Pedidos</div>
            <div class="subtitulo">Período: Últimos ${periodoMeses} meses</div>
            <div class="subtitulo">Fecha de exportación: ${fechaFormateada}</div>
          </div>
        </div>
        
        <div class="resumen">
          <div class="resumen-item">
            <div>Pedidos de Herramientas</div>
            <div class="resumen-cantidad">${pedidos.herramientas.length}</div>
          </div>
          <div class="resumen-item">
            <div>Pedidos de Insumos</div>
            <div class="resumen-cantidad">${pedidos.insumos.length}</div>
          </div>
          <div class="resumen-item">
            <div>Total General</div>
            <div class="resumen-cantidad">${pedidos.herramientas.length + pedidos.insumos.length}</div>
          </div>
        </div>
    `;

    // Agregar sección de herramientas si hay datos
    if (pedidos.herramientas.length > 0) {
      html += `
        <div class="seccion-titulo">PEDIDOS DE HERRAMIENTAS</div>
        <table>
          <tr>
            <th>Profesor</th>
            <th>Asignatura</th>
            <th>Herramienta</th>
            <th>Cantidad</th>
            <th>Fecha</th>
            <th>Hora</th>
          </tr>
      `;

      pedidos.herramientas.forEach(pedido => {
        html += `
          <tr>
            <td>${pedido.profesor}</td>
            <td>${pedido.asignatura}</td>
            <td>${pedido.herramienta}</td>
            <td>${pedido.cantidad}</td>
            <td>${pedido.fecha}</td>
            <td>${pedido.hora || 'No especificada'}</td>
          </tr>
        `;
      });

      html += `</table>`;
    }

    // Agregar sección de insumos si hay datos
    if (pedidos.insumos.length > 0) {
      html += `
        <div class="seccion-titulo">PEDIDOS DE INSUMOS</div>
        <table>
          <tr>
            <th>Profesor</th>
            <th>Asignatura</th>
            <th>Insumo</th>
            <th>Cantidad</th>
            <th>Fecha</th>
            <th>Hora</th>
          </tr>
      `;

      pedidos.insumos.forEach(pedido => {
        const nombreItem = pedido.insumo;
       
        html += `
          <tr>
            <td>${pedido.profesor}</td>
            <td>${pedido.asignatura}</td>
            <td>${nombreItem}</td>
            <td>${pedido.cantidad}</td>
            <td>${pedido.fecha}</td>
            <td>${pedido.hora || 'No especificada'}</td>
          </tr>
        `;
      });

      html += `</table>`;
    }

    html += `</body></html>`;

    // Crear archivo y descargar
    const blob = new Blob(["\uFEFF" + html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Historial_Completo_${periodoMeses}_meses.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
   
    mostrarAlerta(`Reporte exportado correctamente (últimos ${periodoMeses} meses)`, 'success');
  } catch (e) {
    console.error('Error al exportar:', e);
    mostrarAlerta('Error al exportar el reporte', 'warning');
  }
}