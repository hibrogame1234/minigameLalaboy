const ADMIN_PIN = "171102"; 
const cubes = [document.getElementById('cube1'), document.getElementById('cube2'), document.getElementById('cube3')];
const rollBtn = document.getElementById('roll-btn');

rollBtn.addEventListener('click', () => {
    const name = document.getElementById('username').value.trim();
    if (!name) return alert("Nhập tên Ingame!");
    
    let history = JSON.parse(localStorage.getItem('playedUsers')) || [];
    if (history.includes(name.toLowerCase())) return alert("Bạn đã quay rồi!");

    rollBtn.disabled = true;
    let total = 0;
    cubes.forEach((cube, i) => {
        const res = Math.floor(Math.random() * 6) + 1;
        total += res;
        const rots = {1:[0,0], 2:[-90,0], 3:[0,-90], 4:[0,90], 5:[90,0], 6:[180,0]};
        setTimeout(() => {
            cube.style.transform = `rotateX(${rots[res][0] + 1800}deg) rotateY(${rots[res][1] + 1800}deg)`;
        }, i * 100);
    });

    setTimeout(() => {
        document.getElementById('total-score').innerText = `Điểm: ${total}`;
        saveScore(name, total);
        history.push(name.toLowerCase());
        localStorage.setItem('playedUsers', JSON.stringify(history));
    }, 1700);
});

function saveScore(name, score) {
    let lb = JSON.parse(localStorage.getItem('diceLB')) || [];
    lb.push({ name, score });
    lb.sort((a, b) => b.score - a.score);
    localStorage.setItem('diceLB', JSON.stringify(lb));
    renderLB();
}

function renderLB() {
    const data = JSON.parse(localStorage.getItem('diceLB')) || [];
    document.getElementById('score-body').innerHTML = data.slice(0, 10).map((item, index) => 
        `<tr><td>${index + 1}</td><td>${item.name}</td><td>${item.score}đ</td></tr>`).join('');
}

window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === '?' && prompt("PIN Admin:") === ADMIN_PIN) 
        document.getElementById('admin-panel').classList.toggle('hidden');
});

document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm("Reset hết?")) {
        localStorage.clear();
        renderLB();
        location.reload();
    }
});
renderLB();