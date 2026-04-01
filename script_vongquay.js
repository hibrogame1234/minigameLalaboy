const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spin-btn');
const resultText = document.getElementById('result-text');
const nameInput = document.getElementById('username');
const historyBody = document.getElementById('history-body');

// 1. DỮ LIỆU PHẦN THƯỞNG
const prizes = [
    { text: "2000 GOLD", color: "#FF1493", chance: 3 },
    { text: "50 Mảnh B2", color: "#4B0082", chance: 17 },
    { text: "1000 GOLD", color: "#FFD700", chance: 7 },
    { text: "300 GOLD", color: "#00FF7F", chance: 15 },
    { text: "1500 GOLD", color: "#FF4500", chance: 6 },
    { text: "500K NGỌC", color: "#1E90FF", chance: 15 },
    { text: "1.5M NGỌC", color: "#FFB6C1", chance: 7 },
    { text: "500 GOLD", color: "#20B2AA", chance: 10 },
    { text: "1M NGỌC", color: "#2F4F4F", chance: 10 },
    { text: "2M NGỌC", color: "#FF8C00", chance: 10 }
];

let startAngle = 0;
canvas.width = 500;
canvas.height = 500;
const centerX = 250;
const centerY = 250;
const radius = 240;

// 2. VẼ VÒNG QUAY
function drawWheel() {
    let currentAngle = startAngle;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    prizes.forEach((p) => {
        const segAngle = (p.chance / 100) * (Math.PI * 2);
        
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + segAngle, false);
        ctx.lineTo(centerX, centerY);
        ctx.fill();
        
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = 'bold 14px Arial';
        ctx.translate(centerX, centerY);
        ctx.rotate(currentAngle + segAngle / 2);
        ctx.translate(radius * 0.55, 0); 
        ctx.fillText(p.text, 0, 5); 
        ctx.restore();

        currentAngle += segAngle;
    });
}

// 3. DANH SÁCH QUÀ (Cột bên phải)
function displayPrizeList() {
    const list = document.getElementById('prize-list-display');
    if (!list) return;
    list.innerHTML = prizes.map(p => `
        <li style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05)">
            <span style="color: #fff;">${p.text}</span>
            <span style="color: #fffa65; font-weight: bold;">${p.chance}%</span>
        </li>
    `).join('');
}

// 4. LOGIC QUAY (Đã hiệu chỉnh kim 12 giờ)
function getWinIndex() {
    let r = Math.random() * 100;
    let acc = 0;
    for (let i = 0; i < prizes.length; i++) {
        acc += prizes[i].chance;
        if (r <= acc) return i;
    }
    return prizes.length - 1;
}

spinBtn.addEventListener('click', function() {
    const name = nameInput.value.trim().toUpperCase();
    if (!name) return alert("Vui lòng nhập tên Ingame!");

    let played = JSON.parse(localStorage.getItem('wheelPlayedUsers')) || [];
    if (played.includes(name)) return alert("Nhân vật này đã tham gia quay rồi!");

    this.disabled = true;
    nameInput.disabled = true;
    resultText.innerText = "Đang quay...";

    const winIdx = getWinIndex();
    const rotations = 10; // Quay 10 vòng cho đẹp

    // Tính toán góc để ô trúng nằm ở đỉnh (hướng 12 giờ)
    let angleBeforeWin = 0;
    for(let i = 0; i < winIdx; i++) {
        angleBeforeWin += (prizes[i].chance / 100) * 2 * Math.PI;
    }
    const prizeArc = (prizes[winIdx].chance / 100) * 2 * Math.PI;
    
    // Công thức: Đẩy ô trúng về vị trí -90 độ (đỉnh canvas)
    const finalAngle = (Math.PI * 1.5) - angleBeforeWin - (prizeArc / 2);
    const totalRotation = (rotations * 2 * Math.PI) + (finalAngle - (startAngle % (2 * Math.PI)));

    let startTimestamp = null;
    const duration = 5000;
    const initialAngle = startAngle;

    function animate(now) {
        if (!startTimestamp) startTimestamp = now;
        let elapsed = now - startTimestamp;
        let progress = Math.min(elapsed / duration, 1);
        
        let ease = 1 - Math.pow(1 - progress, 4);
        startAngle = initialAngle + (totalRotation * ease);
        
        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            const resultValue = prizes[winIdx].text;
            resultText.innerHTML = `<span style="color:#fffa65">🎁 TRÚNG:</span> ${resultValue}`;
            
            saveHistory(name, resultValue);
            played.push(name);
            localStorage.setItem('wheelPlayedUsers', JSON.stringify(played));
            
            spinBtn.disabled = false;
            nameInput.disabled = false;
        }
    }
    requestAnimationFrame(animate);
});

// 5. LỊCH SỬ & ADMIN
function saveHistory(n, p) {
    let h = JSON.parse(localStorage.getItem('wheelHistory')) || [];
    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    h.push({ name: n, prize: p, time: time });
    localStorage.setItem('wheelHistory', JSON.stringify(h));
    loadHistory();
}

function loadHistory() {
    const h = JSON.parse(localStorage.getItem('wheelHistory')) || [];
    if (!historyBody) return;
    historyBody.innerHTML = h.slice().reverse().slice(0, 10).map(i => `
        <tr>
            <td style="color: #888; font-size: 0.8rem;">${i.time}</td>
            <td style="color: #fffa65; font-weight: bold;">${i.name}</td>
            <td style="color: #fff; font-weight: bold;">${i.prize}</td>
        </tr>
    `).join('');
}

// Phím tắt A mở Admin
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === '?') {
        const modal = document.getElementById('admin-modal');
        if (modal) modal.style.display = 'flex';
    }
});

// Reset dữ liệu (PIN: 1234)
const confirmReset = document.getElementById('confirm-reset');
if(confirmReset) {
    confirmReset.onclick = () => {
        if (prompt("Nhập PIN Admin:") === "171102") {
            localStorage.clear();
            alert("Đã xóa dữ liệu. Trang sẽ tải lại.");
            location.reload();
        }
    };
}

const closeModal = document.getElementById('close-modal');
if(closeModal) {
    closeModal.onclick = () => document.getElementById('admin-modal').style.display = 'none';
}

// Khởi tạo
drawWheel();
loadHistory();
displayPrizeList();