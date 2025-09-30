// Script para el filtro mejorado
document.addEventListener('DOMContentLoaded', function() {
    const customFilterBtn = document.getElementById('customFilterBtn');
    const filterOptions = document.getElementById('filterOptions');
    const options = document.querySelectorAll('.option');
    const selectedTags = document.getElementById('selectedTags');
    const realSelect = document.getElementById('filtro');
    const filterText = document.getElementById('filterText');
    
    // Abrir/cerrar el menú de opciones
    customFilterBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        filterOptions.classList.toggle('active');
        customFilterBtn.querySelector('i').classList.toggle('fa-chevron-up');
        customFilterBtn.querySelector('i').classList.toggle('fa-chevron-down');
    });
    
    // Seleccionar opciones
    options.forEach(option => {
        option.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            const text = this.textContent;
            const isSelected = this.classList.contains('selected');
            
            if (isSelected) {
                // Deseleccionar
                this.classList.remove('selected');
                removeTag(value);
            } else {
                // Seleccionar
                this.classList.add('selected');
                addTag(value, text);
            }
            
            updateRealSelect();
        });
    });
    
    // Cerrar al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!customFilterBtn.contains(e.target) && !filterOptions.contains(e.target)) {
            filterOptions.classList.remove('active');
            customFilterBtn.querySelector('i').classList.remove('fa-chevron-up');
            customFilterBtn.querySelector('i').classList.add('fa-chevron-down');
        }
    });
    
    function addTag(value, text) {
        // Verificar si el tag ya existe
        if (document.querySelector(`.tag[data-value="${value}"]`)) return;
        
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.setAttribute('data-value', value);
        tag.innerHTML = `
            ${text}
            <button class="tag-remove" data-value="${value}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        selectedTags.appendChild(tag);
        
        // Evento para eliminar tag
        tag.querySelector('.tag-remove').addEventListener('click', function(e) {
            e.stopPropagation();
            removeTag(value);
            
            // Desmarcar la opción correspondiente
            const option = document.querySelector(`.option[data-value="${value}"]`);
            if (option) option.classList.remove('selected');
            
            updateRealSelect();
        });
    }
    
    function removeTag(value) {
        const tag = document.querySelector(`.tag[data-value="${value}"]`);
        if (tag) {
            tag.style.animation = 'fadeIn 0.3s ease-out reverse';
            setTimeout(() => tag.remove(), 300);
        }
    }
    
    function updateRealSelect() {
        // Limpiar selecciones anteriores
        realSelect.innerHTML = '';
        
        // Agregar opciones seleccionadas
        document.querySelectorAll('.option.selected').forEach(option => {
            const value = option.getAttribute('data-value');
            const text = option.textContent;
            
            const newOption = document.createElement('option');
            newOption.value = value;
            newOption.textContent = text;
            newOption.selected = true;
            
            realSelect.appendChild(newOption);
        });
        
        // Actualizar texto del filtro
        const selectedCount = document.querySelectorAll('.option.selected').length;
        filterText.textContent = selectedCount > 0 
            ? `${selectedCount} seleccionado(s)` 
            : 'Filtrar por...';
    }
});

// Script para el carrusel principal
const items = document.querySelectorAll('.carousel-item');
const indicators = document.querySelectorAll('.luxury-indicator');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let index = 0;
let interval;

function showSlide(i) {
    if(i < 0) i = items.length - 1;
    if(i >= items.length) i = 0;
    items.forEach((item, idx) => {
        item.classList.toggle('active', idx === i);
        indicators[idx].classList.toggle('active', idx === i);
    });
    index = i;
}

function nextSlide() {
    showSlide(index + 1);
}

function prevSlide() {
    showSlide(index - 1);
}

function resetInterval() {
    clearInterval(interval);
    interval = setInterval(nextSlide, 4000);
}

// Event listeners
nextBtn.addEventListener('click', () => {
    nextSlide();
    resetInterval();
});

prevBtn.addEventListener('click', () => {
    prevSlide();
    resetInterval();
});

indicators.forEach(ind => {
    ind.addEventListener('click', () => {
        const slide = parseInt(ind.getAttribute('data-slide'));
        showSlide(slide);
        resetInterval();
    });
});

// Iniciar autoplay
interval = setInterval(nextSlide, 4000);

// Inicializa el slide visible al cargar la página
showSlide(0);

// Script para el efecto neón en el cuadro de producto
const productoCard = document.querySelector('.producto-card');
const neonEffect = document.getElementById('neonEffect');

if (productoCard && neonEffect) {
    productoCard.addEventListener('mousemove', function(e) {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        neonEffect.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,0,255,0.4) 0%, transparent 70%)`;
        neonEffect.style.opacity = '1';
    });
    
    productoCard.addEventListener('mouseleave', function() {
        neonEffect.style.opacity = '0';
    });
}

// Script para el video
const video = document.getElementById('videoAutoPlay');
if (video) {
    const videoObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                video.play();
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.5 });

    videoObserver.observe(video);
}

// Funcionalidad de carrusel para múltiples secciones
document.querySelectorAll('.seccion-carrusel').forEach((seccion) => {
    const wrapper = seccion.querySelector('.carrusel-wrapper');
    const carrusel = seccion.querySelector('.carrusel');
    const barraProgreso = seccion.querySelector('.barra-progreso');
    const btnIzquierda = seccion.querySelector('.flecha.izquierda');
    const btnDerecha = seccion.querySelector('.flecha.derecha');

    let scrollX = 0;
    const productoWidth = 270; // ancho producto + gap
    const visibleProductos = 3;
    const paso = productoWidth * visibleProductos;

    function actualizarBarra() {
        const maxScroll = carrusel.scrollWidth - wrapper.clientWidth;
        const progreso = maxScroll === 0 ? 0 : (wrapper.scrollLeft / maxScroll) * 100;
        barraProgreso.style.width = `${progreso}%`;
    }

    btnIzquierda.addEventListener('click', () => {
        const maxScroll = carrusel.scrollWidth - wrapper.clientWidth;
        scrollX -= paso;
        if (scrollX < 0) scrollX = 0;
        wrapper.scrollTo({ left: scrollX, behavior: 'smooth' });
        actualizarBarra();
    });

    btnDerecha.addEventListener('click', () => {
        const maxScroll = carrusel.scrollWidth - wrapper.clientWidth;
        scrollX += paso;
        if (scrollX > maxScroll) scrollX = maxScroll;
        wrapper.scrollTo({ left: scrollX, behavior: 'smooth' });
        actualizarBarra();
    });

    wrapper.addEventListener('scroll', () => {
        scrollX = wrapper.scrollLeft;
        actualizarBarra();
    });

    // Inicializar barra al cargar
    window.addEventListener('load', actualizarBarra);
    window.addEventListener('resize', actualizarBarra);
});

// Función para animar títulos letra por letra
function animarTitulo(titulo) {
    const texto = titulo.textContent.trim();
    titulo.textContent = '';
    texto.split('').forEach((letra, i) => {
        const span = document.createElement('span');
        span.textContent = letra;
        span.style.animationDelay = `${i * 0.1}s`;
        titulo.appendChild(span);
    });
}

// Animar todos los títulos cuando estén visibles
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animarTitulo(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.titulo-destacado').forEach(titulo => {
    observer.observe(titulo);
});

// Función para actualizar cantidad
function updateQuantity(elementId, change) {
    const quantityElement = document.getElementById(elementId);
    let quantity = parseInt(quantityElement.textContent);
    quantity += change;
    if (quantity < 1) quantity = 1;
    quantityElement.textContent = quantity;
}

// Función para añadir al carrito
function addToCart() {
    const quantity = parseInt(document.getElementById("goldCollectionQuantity").textContent);
    const productName = "SUMMER POSTCARDS COLLECTION";
    const price = "$107,547.00";
    
    // Mostrar notificación estilo Arena Roja
    showNotification(`${quantity} ${productName} añadido(s) al carrito`);
    
    // Animación del icono del carrito
    animateCartIcon();
}

// Mostrar notificación flotante
function showNotification(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        ${message}
    `;
    
    // Añadir estilos
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#ff69b4';
    notification.style.color = 'white';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '10px';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = '10px';
    notification.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    notification.style.zIndex = '1000';
    notification.style.animation = 'notificationFadeIn 0.3s ease-out';
    
    // Añadir al documento
    document.body.appendChild(notification);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'notificationFadeOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Animación del icono del carrito
function animateCartIcon() {
    const cartIcon = document.querySelector('.carrito-rosa');
    if (cartIcon) {
        cartIcon.style.transform = 'scale(1.3) rotate(10deg)';
        setTimeout(() => {
            cartIcon.style.transform = 'scale(1) rotate(0)';
        }, 300);
    }
}

// Función para cambiar imagen principal
function cambiarImagen(img) {
    document.getElementById("imagen-principal").src = img.src;
}

// Botón de volver
const backBtn = document.querySelector('.back-btn');
if (backBtn) {
    backBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.history.back();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Configurar carruseles de productos
    const carruseles = document.querySelectorAll('.carrusel-container');
    
    carruseles.forEach(container => {
        const carrusel = container.querySelector('.carrusel');
        const productos = container.querySelectorAll('.producto');
        const flechaIzquierda = container.querySelector('.flecha.izquierda');
        const flechaDerecha = container.querySelector('.flecha.derecha');
        
        // Calcular cuántos productos caben en pantalla
        let productosVisibles = 4;
        if (window.innerWidth <= 1200) productosVisibles = 3;
        if (window.innerWidth <= 900) productosVisibles = 2;
        if (window.innerWidth <= 600) productosVisibles = 1;
        
        let indiceActual = 0;
        const totalProductos = productos.length;
        
        // Función para mover el carrusel
        function moverCarrusel(direccion) {
            if (direccion === 'derecha') {
                indiceActual = Math.min(indiceActual + productosVisibles, totalProductos - 1);
            } else {
                indiceActual = Math.max(indiceActual - productosVisibles, 0);
            }
            
            // Calcular el desplazamiento
            const productoWidth = productos[0].offsetWidth + 20; // ancho + gap
            const desplazamiento = -indiceActual * productoWidth;
            
            carrusel.style.transform = `translateX(${desplazamiento}px)`;
            
            // Actualizar estado de las flechas
            actualizarFlechas();
        }
        
        // Actualizar estado de las flechas (habilitar/deshabilitar)
        function actualizarFlechas() {
            flechaIzquierda.style.opacity = indiceActual === 0 ? '0.5' : '1';
            flechaIzquierda.style.pointerEvents = indiceActual === 0 ? 'none' : 'all';
            
            flechaDerecha.style.opacity = indiceActual >= totalProductos - productosVisibles ? '0.5' : '1';
            flechaDerecha.style.pointerEvents = indiceActual >= totalProductos - productosVisibles ? 'none' : 'all';
        }
        
        // Event listeners para las flechas
        flechaIzquierda.addEventListener('click', () => moverCarrusel('izquierda'));
        flechaDerecha.addEventListener('click', () => moverCarrusel('derecha'));
        
        // Actualizar en redimensionamiento de ventana
        window.addEventListener('resize', function() {
            // Recalcular productos visibles
            if (window.innerWidth <= 1200) productosVisibles = 3;
            if (window.innerWidth <= 900) productosVisibles = 2;
            if (window.innerWidth <= 600) productosVisibles = 1;
            if (window.innerWidth > 1200) productosVisibles = 4;
            
            // Resetear posición
            indiceActual = 0;
            carrusel.style.transform = 'translateX(0)';
            actualizarFlechas();
        });
        
        // Inicializar estado de las flechas
        actualizarFlechas();
    });
});