// CONFIGURATION SUPABASE
const SUPABASE_URL = 'https://phorlnthbftxntikvjge.supabase.co/'; 
const SUPABASE_KEY = 'sb_publishable_Kq_O3-Aw81Gqv1m-4YlQUQ_AGQ3KJGE';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// NAVIGATION ENTRE LES PAGES
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + id);
    if(target) target.classList.add('active');
}

// AFFICHER/CACHER LE CHAT
function toggleChat() {
    const chat = document.getElementById('twitch-chat');
    if(chat) chat.style.display = (chat.style.display === 'none') ? 'block' : 'none';
}

// CHARGEMENT DES DONNÉES DEPUIS SUPABASE
async function loadData() {
    const pCont = document.getElementById('planning-container');
    const sCont = document.getElementById('setup-container');

    // 1. Chargement du Planning
    if(pCont) {
        const { data: s } = await _supabase.from('schedule').select('*').order('day_id');
        if(s) {
            pCont.innerHTML = s.map(d => `
                <div class="p-item">
                    <h4>${d.day_name}</h4>
                    <p>${d.stream_time}</p>
                </div>
            `).join('');
        }
    }

    // 2. Chargement du Setup
    if(sCont) {
        const { data: st } = await _supabase.from('setup').select('*').order('id');
        if(st) {
            sCont.innerHTML = st.map(s => `
                <a href="${s.amazon_url}" target="_blank" class="setup-item">
                    <div class="amazon-link-text">🔗 VOIR SUR AMAZON</div>
                    <div class="item-name-text">${s.item_name}</div>
                </a>
            `).join('');
        }
    }
}

// ==========================================
// CHAMP D'ÉTOILES INTERACTIF & CONSTELLATIONS
// ==========================================
const canvas = document.getElementById('bg-canvas');
if(canvas) {
    const ctx = canvas.getContext('2d');
    let pts = [], mouse = { x: null, y: null };
    
    // Sensibilité souris (plus fort = plus de répulsion)
    const MOUSE_REPULSION = 100;

    window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });

    function init() {
        canvas.width = window.innerWidth; 
        canvas.height = window.innerHeight;
        
        // On crée un champ d'étoiles (mélange de tailles et de vitesses)
        pts = Array.from({length: 60}, () => ({ 
            x: Math.random()*canvas.width, 
            y: Math.random()*canvas.height, 
            // Vitesse de défilement (très lent)
            vx: Math.random()*0.3+0.1, 
            vy: Math.random()*0.15-0.075,
            // Taille variable pour l'effet de profondeur
            size: Math.random()*1.5+0.5,
            // Opacité variable pour scintillement
            brightness: Math.random()*0.6+0.4
        }));
    }

    // Fonction pour dessiner les constellations
    function drawConstellations() {
        // Opacité des constellations (violet très clair)
        ctx.strokeStyle = "rgba(110, 69, 226, 0.1)";
        ctx.lineWidth = 0.5;
        
        // Distance max pour relier deux étoiles (crée des groupes)
        const MAX_DIST = 200; 

        pts.forEach((p1, i) => {
            // On compare chaque étoile à une partie des autres (performance)
            pts.slice(i + 1).forEach(p2 => {
                let dx = p1.x - p2.x, dy = p1.y - p2.y, dist = Math.sqrt(dx*dx+dy*dy);
                
                // Si les étoiles sont proches, on trace une ligne
                if (dist < MAX_DIST) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            });
        });
    }

    function draw() {
        ctx.clearRect(0,0,canvas.width, canvas.height);
        
        // On dessine les constellations EN PREMIER pour qu'elles soient derrière
        drawConstellations();
        
        // On dessine les étoiles
        ctx.fillStyle = "white"; 
        
        pts.forEach(p => {
            // Défilement
            p.x+=p.vx; p.y+=p.vy;
            
            // Interaction souris (les étoiles fuient doucement)
            if(mouse.x) {
                let dx = mouse.x - p.x, dy = mouse.y - p.y, dist = Math.sqrt(dx*dx+dy*dy);
                if (dist < 200) {
                    let f = (200-dist)/200;
                    p.x -= dx*f*0.01; p.y -= dy*f*0.01;
                }
            }

            // Rebond/Boucle sur les bords (réapparaissent de l'autre côté)
            if(p.x<0) p.x=canvas.width; if(p.x>canvas.width) p.x=0; 
            if(p.y<0) p.y=canvas.height; if(p.y>canvas.height) p.y=0;
            
            // Scintillement (légère variation aléatoire)
            let opacity = p.brightness + (Math.random()*0.1-0.05);
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, opacity))})`;
            
            // Dessin de l'étoile (plus grosse = plus de glow derrière)
            ctx.beginPath(); 
            ctx.arc(p.x,p.y,p.size,0,Math.PI*2); 
            ctx.fill();
            
            // Un petit halo violet si l'étoile est grosse (effet profondeur)
            if (p.size > 1.5) {
                ctx.fillStyle = "rgba(110, 69, 226, 0.05)";
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        requestAnimationFrame(draw);
    }
    window.addEventListener('resize', init);
    window.onload = () => { loadData(); init(); draw(); };
}
