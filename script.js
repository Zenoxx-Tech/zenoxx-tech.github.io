// ==========================================
// 1. CONFIGURATION SUPABASE
// ==========================================
// REMPLACE BIEN CES DEUX LIGNES PAR TES INFOS SUPABASE
const SUPABASE_URL = 'https://phorlnthbftxntikvjge.supabase.co/'; 
const SUPABASE_KEY = 'sb_publishable_Kq_O3-Aw81Gqv1m-4YlQUQ_AGQ3KJGE';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// 2. NAVIGATION ET INTERFACE
// ==========================================

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + id);
    if(target) target.classList.add('active');
}

function toggleChat() {
    const chat = document.getElementById('twitch-chat');
    if(chat) {
        chat.style.display = (chat.style.display === 'none') ? 'block' : 'none';
    }
}

// ==========================================
// 3. CHARGEMENT DES DONNÉES
// ==========================================

async function loadData() {
    const pCont = document.getElementById('planning-container');
    const sCont = document.getElementById('setup-container');

    // Planning
    if(pCont) {
        const { data: sData } = await _supabase.from('schedule').select('*').order('day_id');
        if(sData) {
            pCont.innerHTML = sData.map(d => `
                <div class="p-item">
                    <h4>${d.day_name}</h4>
                    <p>${d.stream_time}</p>
                </div>
            `).join('');
        }
    }

    // Setup (22 cases)
    if(sCont) {
        const { data: stData } = await _supabase.from('setup').select('*').order('id');
        if(stData) {
            sCont.innerHTML = stData.map(s => `<div class="setup-item">${s.item_name}</div>`).join('');
        }
    }
}

// ==========================================
// 4. CANVAS INTERACTIF (SOURIS)
// ==========================================

const canvas = document.getElementById('bg-canvas');
if(canvas) {
    const ctx = canvas.getContext('2d');
    let pts = [];
    let mouse = { x: null, y: null, isPressed: false };

    window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });
    window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });
    window.addEventListener('mousedown', () => { mouse.isPressed = true; });
    window.addEventListener('mouseup', () => { mouse.isPressed = false; });

    function init() {
        canvas.width = window.innerWidth; 
        canvas.height = window.innerHeight;
        pts = Array.from({length: 60}, () => ({ 
            x: Math.random() * canvas.width, 
            y: Math.random() * canvas.height, 
            vx: Math.random() * 0.8 - 0.4, 
            vy: Math.random() * 0.8 - 0.4,
            radius: Math.random() * 1.5 + 0.5
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(110, 69, 226, 0.4)"; 

        pts.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - p.x;
                let dy = mouse.y - p.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 150) {
                    let force = (150 - dist) / 150;
                    if (mouse.isPressed) {
                        // ATTRACTION AU CLIC
                        p.x += dx * force * 0.15;
                        p.y += dy * force * 0.15;
                    } else {
                        // RÉPULSION AU SURVOL
                        p.x -= dx * force * 0.04;
                        p.y -= dy * force * 0.04;
                    }
                }
            }

            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();

            // Lignes entre points
            pts.forEach(p2 => {
                let dx = p.x - p2.x;
                let dy = p.y - p2.y;
                let d = Math.sqrt(dx*dx + dy*dy);
                if(d < 100) {
                    ctx.strokeStyle = `rgba(110, 69, 226, ${0.1 * (1 - d/100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
                }
            });
        });
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', init);
    window.onload = () => { loadData(); init(); draw(); };
}
