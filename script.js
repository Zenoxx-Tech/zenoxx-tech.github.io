const SUPABASE_URL = 'https://phorlnthbftxntikvjge.supabase.co/'; 
const SUPABASE_KEY = 'sb_publishable_Kq_O3-Aw81Gqv1m-4YlQUQ_AGQ3KJGE';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// GESTION DU MENU
function toggleMenu(event) {
    event.stopPropagation();
    document.getElementById('main-nav').classList.toggle('show');
}

// FERMER LE MENU AU CLIC EXTERNE
window.onclick = function() {
    document.getElementById('main-nav').classList.remove('show');
}

// NAVIGATION
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');
}

function toggleChat() {
    const chat = document.getElementById('twitch-chat');
    chat.style.display = (chat.style.display === 'none') ? 'block' : 'none';
}

// CHARGEMENT DONNÉES
async function loadData() {
    const { data: sched } = await _supabase.from('schedule').select('*').order('day_id');
    if(sched) document.getElementById('planning-container').innerHTML = sched.map(d => `<div class="p-item"><h4>${d.day_name}</h4><p>${d.stream_time}</p></div>`).join('');

    const { data: setup } = await _supabase.from('setup').select('*').order('id');
    if(setup) document.getElementById('setup-container').innerHTML = setup.map(s => `
        <a href="${s.amazon_url}" target="_blank" class="setup-item">
            <div class="amazon-link-text">🔗 AMAZON</div>
            <div class="item-name-text">${s.item_name}</div>
        </a>`).join('');
}

// FOND CONSTELLATIONS
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let stars = [];

function initSpace() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = Array.from({length: 80}, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: Math.random() * 0.2 - 0.1,
        vy: Math.random() * 0.2 - 0.1,
        size: Math.random() * 1.5 + 0.5
    }));
}

function drawSpace() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 0.5;
    for(let i=0; i<stars.length; i++) {
        for(let j=i+1; j<stars.length; j++) {
            let dist = Math.sqrt((stars[i].x-stars[j].x)**2 + (stars[i].y-stars[j].y)**2);
            if(dist < 150) {
                ctx.strokeStyle = `rgba(110, 69, 226, ${0.1 * (1 - dist/150)})`;
                ctx.beginPath(); ctx.moveTo(stars[i].x, stars[i].y); ctx.lineTo(stars[j].x, stars[j].y); ctx.stroke();
            }
        }
        stars[i].x += stars[i].vx; stars[i].y += stars[i].vy;
        if(stars[i].x < 0 || stars[i].x > canvas.width) stars[i].vx *= -1;
        if(stars[i].y < 0 || stars[i].y > canvas.height) stars[i].vy *= -1;
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath(); ctx.arc(stars[i].x, stars[i].y, stars[i].size, 0, Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(drawSpace);
}

window.onresize = initSpace;
window.onload = () => { loadData(); initSpace(); drawSpace(); };
