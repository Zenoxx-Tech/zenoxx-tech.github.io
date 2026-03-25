// ==========================================
// 1. CONFIGURATION SUPABASE
// ==========================================
const SUPABASE_URL = 'https://phorlnthbftxntikvjge.supabase.co/'; 
const SUPABASE_KEY = 'sb_publishable_Kq_O3-Aw81Gqv1m-4YlQUQ_AGQ3KJGE';

// CETTE LIGNE CI-DESSOUS ÉTAIT MANQUANTE (CRUCIAL) :
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + id);
    if(target) target.classList.add('active');
}

function toggleChat() {
    const chat = document.getElementById('twitch-chat');
    if(chat) chat.style.display = (chat.style.display === 'none') ? 'block' : 'none';
}

async function loadData() {
    const pCont = document.getElementById('planning-container');
    const sCont = document.getElementById('setup-container');
    if(pCont) {
        const { data: s } = await _supabase.from('schedule').select('*').order('day_id');
        if(s) pCont.innerHTML = s.map(d => `<div class="p-item"><h4>${d.day_name}</h4><p>${d.stream_time}</p></div>`).join('');
    }
    if(sCont) {
        const { data: st } = await _supabase.from('setup').select('*').order('id');
        if(st) sCont.innerHTML = st.map(s => `<div class="setup-item">${s.item_name}</div>`).join('');
    }
}

const canvas = document.getElementById('bg-canvas');
if(canvas) {
    const ctx = canvas.getContext('2d');
    let pts = [], mouse = { x: null, y: null, isPressed: false };
    window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });
    window.addEventListener('mousedown', () => { mouse.isPressed = true; });
    window.addEventListener('mouseup', () => { mouse.isPressed = false; });
    function init() {
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        pts = Array.from({length: 60}, () => ({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, vx: Math.random()*0.8-0.4, vy: Math.random()*0.8-0.4 }));
    }
    function draw() {
        ctx.clearRect(0,0,canvas.width, canvas.height);
        ctx.fillStyle = "rgba(110,69,226,0.4)";
        pts.forEach(p => {
            p.x+=p.vx; p.y+=p.vy;
            if (mouse.x) {
                let dx = mouse.x - p.x, dy = mouse.y - p.y, dist = Math.sqrt(dx*dx+dy*dy);
                if (dist < 150) {
                    let f = (150-dist)/150;
                    if (mouse.isPressed) { p.x += dx*f*0.15; p.y += dy*f*0.15; }
                    else { p.x -= dx*f*0.04; p.y -= dy*f*0.04; }
                }
            }
            if(p.x<0||p.x>canvas.width) p.vx*=-1; if(p.y<0||p.y>canvas.height) p.vy*=-1;
            ctx.beginPath(); ctx.arc(p.x,p.y,2,0,Math.PI*2); ctx.fill();
        });
        requestAnimationFrame(draw);
    }
    window.addEventListener('resize', init);
    window.onload = () => { if(typeof loadData === "function") loadData(); init(); draw(); };
}
