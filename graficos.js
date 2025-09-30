
    // Variables para los gráficos
    let chartInsumosPedidos;
    let chartInsumosDisponibles;
    let chartEvolucionPedidos;
    let chartProfesores;

    // Función para inicializar todos los gráficos
    function inicializarGraficos() {
      actualizarGraficoInsumosPedidos();
      actualizarGraficoInsumosDisponibles();
      actualizarGraficoEvolucionPedidos();
      actualizarGraficoProfesores();
    }

    // Función para generar colores distintos
    function generateDistinctColors(count) {
      const colors = [];
      const hueStep = 360 / count;
     
      for (let i = 0; i < count; i++) {
        // Usar HSL para garantizar colores distintos
        const hue = (i * hueStep) % 360;
       
        // Variar saturación y luminosidad para más contraste
        const saturation = 70 + Math.random() * 20; // 70-90%
        const lightness = 50 + Math.random() * 15;  // 50-65%
       
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
      }
     
      return colors;
    }

    // Función para crear/actualizar el gráfico de insumos más pedidos
    function actualizarGraficoInsumosPedidos() {
      const ctx = document.getElementById('graficoInsumosPedidos').getContext('2d');
      const pedidos = JSON.parse(localStorage.getItem("pedidosInsumos")) || [];
     
      // Agrupar pedidos por insumo y sumar cantidades
      const insumosPedidos = {};
      pedidos.forEach(pedido => {
        if (!insumosPedidos[pedido.insumo]) {
          insumosPedidos[pedido.insumo] = 0;
        }
        insumosPedidos[pedido.insumo] += parseInt(pedido.cantidad);
      });
     
      // Ordenar por cantidad (mayor a menor) y limitar a 8 insumos
      const insumosOrdenados = Object.entries(insumosPedidos)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
     
      const labels = insumosOrdenados.map(item => item[0]);
      const data = insumosOrdenados.map(item => item[1]);
     
      // Colores para el gráfico
      const backgroundColors = generateDistinctColors(labels.length);
     
      if (chartInsumosPedidos) {
        chartInsumosPedidos.destroy();
      }
     
      chartInsumosPedidos = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: backgroundColors,
            borderColor: '#fff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }

    // Función para crear/actualizar el gráfico de insumos disponibles (VERSIÓN MEJORADA)
    function actualizarGraficoInsumosDisponibles() {
      const ctx = document.getElementById('graficoInsumosDisponibles').getContext('2d');
      const inventario = JSON.parse(localStorage.getItem("inventario")) || [];
      const insumos = inventario.filter(item => item.tipo === "Insumo" && parseInt(item.cantidad) > 0);
     
      // Si no hay insumos, mostrar mensaje
      if (insumos.length === 0) {
        if (chartInsumosDisponibles) {
          chartInsumosDisponibles.destroy();
        }
        ctx.font = "16px Montserrat";
        ctx.fillStyle = "#666";
        ctx.textAlign = "center";
        ctx.fillText("No hay insumos disponibles", ctx.canvas.width / 2, ctx.canvas.height / 2);
        
        // Limpiar la lista
        document.getElementById('listaInsumos').innerHTML = '<h4>Insumos</h4><p>No hay insumos disponibles</p>';
        return;
      }
     
      // Obtener todos los insumos
      const labels = insumos.map(item => item.nombre);
      const data = insumos.map(item => parseInt(item.cantidad));
     
      // Calcular el total para mostrar porcentajes
      const total = data.reduce((sum, value) => sum + value, 0);
     
      // Generar colores distintos para cada insumo
      const backgroundColors = generateDistinctColors(labels.length);
     
      if (chartInsumosDisponibles) {
        chartInsumosDisponibles.destroy();
      }
     
      chartInsumosDisponibles = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: backgroundColors,
            borderColor: '#fff',
            borderWidth: 2,
            hoverBorderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false // Ocultamos la leyenda porque ahora tenemos la lista
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} unidades (${percentage}%)`;
                }
              }
            },
            title: {
              display: true,
              text: `Total: ${total} unidades disponibles`,
              position: 'bottom',
              font: {
                size: 14,
                weight: 'bold'
              }
            }
          }
        }
      });
      
      // Generar la lista de insumos
      generarListaInsumos(labels, data, backgroundColors, total);
    }

    // Función para generar la lista de insumos
    function generarListaInsumos(labels, data, colors, total) {
      const listaContainer = document.getElementById('listaInsumos');
      let html = '<h4>Insumos</h4>';
      
      // Ordenar los insumos por cantidad (mayor a menor)
      const insumosConDatos = labels.map((label, index) => {
        return {
          nombre: label,
          cantidad: data[index],
          color: colors[index]
        };
      }).sort((a, b) => b.cantidad - a.cantidad);
      
      // Generar HTML para cada insumo
      insumosConDatos.forEach(insumo => {
        const porcentaje = Math.round((insumo.cantidad / total) * 100);
        html += `
          <div class="item-insumo">
            <div class="color-indicador" style="background-color: ${insumo.color}"></div>
            <div class="nombre-insumo">${insumo.nombre}</div>
            <div class="cantidad-insumo">${insumo.cantidad} (${porcentaje}%)</div>
          </div>
        `;
      });
      
      listaContainer.innerHTML = html;
    }

    // Función para crear/actualizar el gráfico de evolución de pedidos por mes
    function actualizarGraficoEvolucionPedidos() {
      const ctx = document.getElementById('graficoEvolucionPedidos').getContext('2d');
      const pedidos = JSON.parse(localStorage.getItem("pedidosInsumos")) || [];
     
      // Agrupar pedidos por mes y año
      const pedidosPorMes = {};
      pedidos.forEach(pedido => {
        const fecha = new Date(pedido.fecha);
        const mesAnio = `${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
       
        if (!pedidosPorMes[mesAnio]) {
          pedidosPorMes[mesAnio] = 0;
        }
        pedidosPorMes[mesAnio] += parseInt(pedido.cantidad);
      });
     
      // Ordenar por fecha (más antiguo a más reciente)
      const mesesOrdenados = Object.entries(pedidosPorMes)
        .sort((a, b) => {
          const [mesA, anioA] = a[0].split('/').map(Number);
          const [mesB, anioB] = b[0].split('/').map(Number);
          return anioA - anioB || mesA - mesB;
        });
     
      const labels = mesesOrdenados.map(item => {
        const [mes, anio] = item[0].split('/');
        const nombreMes = new Date(2000, parseInt(mes) - 1).toLocaleString('es-AR', { month: 'short' });
        return `${nombreMes} ${anio}`;
      });
      const data = mesesOrdenados.map(item => item[1]);
     
      if (chartEvolucionPedidos) {
        chartEvolucionPedidos.destroy();
      }
     
      chartEvolucionPedidos = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Cantidad de insumos pedidos',
            data: data,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            tension: 0.1,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `Pedidos: ${context.raw}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }

    // Función para crear/actualizar el gráfico de profesores que más piden
    function actualizarGraficoProfesores() {
      const ctx = document.getElementById('graficoProfesores').getContext('2d');
      const pedidos = JSON.parse(localStorage.getItem("pedidosInsumos")) || [];
     
      // Agrupar pedidos por profesor y sumar cantidades
      const profesoresPedidos = {};
      pedidos.forEach(pedido => {
        if (!profesoresPedidos[pedido.profesor]) {
          profesoresPedidos[pedido.profesor] = 0;
        }
        profesoresPedidos[pedido.profesor] += parseInt(pedido.cantidad);
      });
     
      // Ordenar por cantidad (mayor a menor) and limitar a 8 profesores
      const profesoresOrdenados = Object.entries(profesoresPedidos)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
     
      const labels = profesoresOrdenados.map(item => item[0]);
      const data = profesoresOrdenados.map(item => item[1]);
     
      // Colores para el gráfico
      const backgroundColors = generateDistinctColors(labels.length);
     
      if (chartProfesores) {
        chartProfesores.destroy();
      }
     
      chartProfesores = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Cantidad de insumos pedidos',
            data: data,
            backgroundColor: backgroundColors,
            borderColor: '#fff',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `Pedidos: ${context.raw}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }

    // Inicializar los gráficos al cargar la página
    window.onload = function() {
      inicializarGraficos();
    };
 