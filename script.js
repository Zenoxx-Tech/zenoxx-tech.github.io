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

// ANIMATION DU FOND (CANVAS)
const canvas = document.getElementById('bg-canvas');
if(canvas) {
    const ctx = canvas.getContext('2d');
    let pts = [], mouse = { x: null, y: null };
    window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });

    function init() {
        canvas.width = window.innerWidth; 
        canvas.height = window.innerHeight;
        pts = Array.from({length: 45}, () => ({ 
            x: Math.random()*canvas.width, 
            y: Math.random()*canvas.height, 
            vx: Math.random()*0.5-0.25, 
            vy: Math.random()*0.5-0.25 
        }));
    }

    function draw() {
        ctx.clearRect(0,0,canvas.width, canvas.height);
        ctx.fillStyle = "rgba(110,69,226,0.3)";
        pts.forEach(p => {
            p.x+=p.vx; p.y+=p.vy;
            if(p.x<0||p.x>canvas.width) p.vx*=-1; 
            if(p.y<0||p.y>canvas.height) p.vy*=-1;
            ctx.beginPath(); ctx.arc(p.x,p.y,1.5,0,Math.PI*2); ctx.fill();
        });
        requestAnimationFrame(draw);
    }
    window.addEventListener('resize', init);
    window.onload = () => { loadData(); init(); draw(); };
}
