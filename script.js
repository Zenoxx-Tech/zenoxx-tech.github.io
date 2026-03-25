// ==========================================
// 1. CONFIGURATION SUPABASE (À COMPLÉTER)
// ==========================================
// Remplace ces valeurs par celles de ton dashboard Supabase (Settings > API)
const SUPABASE_URL = 'https://phorlnthbftxntikvjge.supabase.co/';
const SUPABASE_KEY = 'sb_publishable_Kq_O3-Aw81Gqv1m-4YlQUQ_AGQ3KJGE';

// Initialisation du client Supabase
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// 2. FONCTIONS DE NAVIGATION ET UI
// ==========================================

// Affiche une page spécifique et cache les autres
function showPage(id) {
    // Cache toutes les pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // Affiche la page demandée
    const target = document.getElementById('page-' + id);
    if(target) target.classList.add('active');
}

// Alterne l'affichage du chat Twitch (visible/caché)
function toggleChat() {
    const chat = document.getElementById('twitch-chat');
    if(chat) {
        // Si display est 'none', on met 'block', sinon on met 'none'
        chat.style.display = (chat.style.display === 'none') ? 'block' : 'none';
    }
}

// ==========================================
// 3. CHARGEMENT DES DONNÉES (SUPABASE)
// ==========================================

// Charge le planning et le setup depuis la base de données
async function loadData() {
    const pCont = document.getElementById('planning-container');
    const sCont = document.getElementById('setup-container');

    // 📅 Chargement du Planning
    if(pCont) {
        const { data: sData, error: sError } = await _supabase
            .from('schedule')
            .select('*')
            .order('day_id'); // Trie par ordre des jours

        if(sData) {
            // Génère le HTML pour chaque jour
            pCont.innerHTML = sData.map(d => `
                <div class="p-item">
                    <h4>${d.day_name}</h4>
                    <p>${d.stream_time}</p>
                </div>
            `).join('');
        }
    }

    // 🖥️ Chargement du Setup (22 cases)
    if(sCont) {
        const { data: stData, error: stError } = await _supabase
            .from('setup')
            .select('*')
            .order('id'); // Trie par ID de case

        if(stData) {
            // Génère le HTML pour chaque élément du setup
            sCont.innerHTML = stData.map(s => `
                <div class="setup-item">
                    ${s.item_name}
                </div>
            `).join('');
        }
    }
}

// ==========================================
// 4. FOND ANIMÉ ET INTERACTIF (CANVAS)
// ==========================================

const canvas = document.getElementById('bg-canvas');
if(canvas) {
    const ctx = canvas.getContext('2d');
    let pts = [];
    let mouse = { x: null, y: null, isPressed: false };

    // --- Gestionnaires d'événements Souris ---
    
    // Position de la souris
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    // Souris sort de l'écran
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Clic pressé (Attraction)
    window.addEventListener('mousedown', () => {
        mouse.isPressed = true;
    });

    // Clic relâché (Retour à la répulsion)
    window.addEventListener('mouseup', () => {
        mouse.isPressed = false;
    });

    // --- Fonctions de l'animation ---

    // Initialisation (et redimensionnement)
    function init() {
        canvas.width = window.innerWidth; 
        canvas.height = window.innerHeight;
        
        // Création des points (60 points pour un bon équilibre)
        pts = Array.from({length: 60}, () => ({ 
            x: Math.random() * canvas.width, 
            y: Math.random() * canvas.height, 
            // Vitesse de base aléatoire
            vx: Math.random() * 0.8 - 0.4, 
            vy: Math.random() * 0.8 - 0.4,
            radius: Math.random() * 1.5 + 0.5 // Taille variable
        }));
    }

    // Boucle de dessin principale
    function draw() {
        // Efface le canvas à chaque frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Couleur des points (ton violet)
        ctx.fillStyle = "rgba(110, 69, 226, 0.4)"; 

        pts.forEach(p => {
            // 1. Animation de base (mouvement autonome)
            p.x += p.vx;
            p.y += p.vy;

            // 2. Interaction avec la souris
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - p.x;
                let dy = mouse.y - p.y;
                let dist = Math.sqrt(dx * dx + dy * dy); // Distance de Pythagore
                
                // Rayon d'action de l'effet (150px)
                if (dist < 150) {
                    // Force proportionnelle à la proximité (plus proche = plus fort)
                    let force = (150 - dist) / 150;
                    
                    if (mouse.isPressed) {
                        // --- MODE ATTRACTION (Clic pressé) ---
                        // Les points foncent vers la souris
                        p.x += dx * force * 0.15; // 0.15 = vitesse d'attraction
                        p.y += dy * force * 0.15;
                    } else {
                        // --- MODE RÉPULSION (Juste survol) ---
                        // Les points s'écartent doucement
                        p.x -= dx * force * 0.04; // 0.04 = vitesse de répulsion
                        p.y -= dy * force * 0.04;
                    }
                }
            }

            // 3. Rebond sur les bords de l'écran
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            // 4. Dessin du point
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();

            // 5. [OPTIONNEL] Petites lignes de connexion
            // Dessine une ligne discrète si deux points sont proches
            pts.forEach(p2 => {
                let dx = p.x - p2.x;
                let dy = p.y - p2.y;
                let d = Math.sqrt(dx*dx + dy*dy);
                if(d < 100) {
                    // L'opacité diminue avec la distance
                    ctx.strokeStyle = `rgba(110, 69, 226, ${0.1 * (1 - d/100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            });
        });
        // Demande la frame suivante
        requestAnimationFrame(draw);
    }

    // Gère le redimensionnement de la fenêtre
    window.addEventListener('resize', init);
    
    // Lancement au chargement de la page
    window.onload = () => { 
        loadData(); // Charge tes données Supabase
        init();     // Initialise le canvas
        draw();     // Lance l'animation
    };
}
