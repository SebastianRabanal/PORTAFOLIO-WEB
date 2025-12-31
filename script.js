// =========================================
// 1. NAVEGACIÓN Y MENÚ
// =========================================

// Función para abrir/cerrar el menú en móvil
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// Función para cerrar el menú explícitamente
function closeMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.remove('active');
}

// Smooth scroll para los enlaces de navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Cerrar menú si está abierto (móvil)
            closeMenu();
        }
    });
});

// Cerrar menú automáticamente al hacer scroll
window.addEventListener('scroll', function() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }
});

// =========================================
// 2. ANIMACIONES AL HACER SCROLL
// =========================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observar las tarjetas de proyectos para animación
document.addEventListener('DOMContentLoaded', function() {
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
});

// =========================================
// 3. SLIDER INFINITO DE TECNOLOGÍAS (Draggable)
// =========================================

const track = document.getElementById('sliderTrack');
const container = document.querySelector('.infinite-slider-container');

// A) Clonar contenido para bucle infinito
// Clonamos los elementos para asegurar que cubran el ancho y permitan el "salto" invisible
if (track) {
    const slides = Array.from(track.children);
    slides.forEach(slide => {
        const clone = slide.cloneNode(true);
        track.appendChild(clone);
    });

    // B) Variables de estado
    let currentPosition = 0;
    let isDragging = false;
    let startX = 0;
    let prevTranslate = 0;
    let animationID;
    let speed = 0.5; // Velocidad del auto-scroll
    let direction = -1; // -1 = izquierda, 1 = derecha
    let singleSetWidth = 0;

    // C) Calcular el ancho del conjunto original de logos
    function calculateWidth() {
        let totalWidth = 0;
        // Solo medimos la mitad original (ya que duplicamos los elementos)
        const originalCount = track.children.length / 2;
        for(let i = 0; i < originalCount; i++) {
            totalWidth += track.children[i].offsetWidth;
        }
        singleSetWidth = totalWidth;
    }

    // Ejecutar al inicio y al redimensionar ventana
    calculateWidth();
    window.addEventListener('resize', calculateWidth);

    // D) Función de Animación Principal (Loop)
    function animate() {
        // Si no estamos arrastrando, aplicamos velocidad automática
        if (!isDragging) {
            currentPosition += speed * direction;
        }

        // LÓGICA INFINITA: Teletransportación invisible
        // Si nos pasamos hacia la izquierda más allá del ancho original
        if (currentPosition <= -singleSetWidth) {
            currentPosition += singleSetWidth;
            prevTranslate += singleSetWidth; // Ajuste para que el drag no salte
        }
        // Si nos pasamos hacia la derecha (por arrastre manual)
        else if (currentPosition > 0) {
            currentPosition -= singleSetWidth;
            prevTranslate -= singleSetWidth; // Ajuste para que el drag no salte
        }

        // Aplicar transformación
        track.style.transform = `translateX(${currentPosition}px)`;
        
        animationID = requestAnimationFrame(animate);
    }

    // Iniciar animación
    animate();

    // E) Eventos de Arrastre (Mouse y Touch)

    // Iniciar arrastre
    track.addEventListener('mousedown', startDrag);
    track.addEventListener('touchstart', startDrag, { passive: true });

    // Terminar arrastre
    track.addEventListener('mouseup', endDrag);
    track.addEventListener('mouseleave', endDrag);
    track.addEventListener('touchend', endDrag);

    // Mover
    track.addEventListener('mousemove', moveDrag);
    track.addEventListener('touchmove', moveDrag, { passive: false }); // passive: false permite preventDefault

    function getPositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }

function startDrag(event) {
    if (event.type.includes('mouse')) {
        event.preventDefault(); 
    }

    isDragging = true;
    startX = getPositionX(event);
    prevTranslate = currentPosition;
    track.style.cursor = 'grabbing';
}

    function moveDrag(event) {
        if (!isDragging) return;
        
        // Evitar scroll vertical en móviles mientras arrastramos el slider
        if (event.type === 'touchmove') {
            // Opcional: event.preventDefault(); 
        }

        const currentX = getPositionX(event);
        const diff = currentX - startX;
        
        // Actualizar posición (prevTranslate es donde empezamos el click)
        currentPosition = prevTranslate + diff;
    }

    function endDrag() {
        isDragging = false;
        track.style.cursor = 'grab';
    }
}

// =========================================
// 4. CARRUSEL DE PROYECTOS (Slide manual)
// =========================================

document.addEventListener('DOMContentLoaded', function() {
    const projectTrack = document.getElementById('projectTrack');
    const nextBtn = document.querySelector('.slider-arrow.next');
    const prevBtn = document.querySelector('.slider-arrow.prev');
    
    if (projectTrack && nextBtn && prevBtn) {
        let currentIndex = 0;
        
        // Función para mover el carrusel
        function updateCarousel() {
            // Obtenemos el ancho de una tarjeta + el gap (espacio)
            const card = projectTrack.querySelector('.project-card');
            if (!card) return;

            // Calculamos ancho tarjeta + gap (20px definidos en CSS)
            const slideWidth = card.offsetWidth + 20; 
            
            // Movemos la pista
            projectTrack.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        }

        // Click Siguiente
        nextBtn.addEventListener('click', () => {
            const totalCards = projectTrack.children.length;
            
            // Calculamos cuántas tarjetas caben en pantalla según el ancho
            // (3 en desktop, 1 en móvil)
            const itemsPerView = window.innerWidth > 768 ? 3 : 1;
            
            // Evitamos avanzar si ya mostramos las últimas
            if (currentIndex < totalCards - itemsPerView) {
                currentIndex++;
                updateCarousel();
            } else {
                // Opcional: Volver al inicio (loop)
                currentIndex = 0;
                updateCarousel();
            }
        });

        // Click Anterior
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            } else {
                // Opcional: Ir al final (loop)
                const itemsPerView = window.innerWidth > 768 ? 3 : 1;
                currentIndex = projectTrack.children.length - itemsPerView;
                updateCarousel();
            }
        });

        // Recalcular al cambiar tamaño de ventana para evitar desajustes
        window.addEventListener('resize', updateCarousel);
    }
});