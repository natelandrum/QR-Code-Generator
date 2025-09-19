document.addEventListener('DOMContentLoaded', function() {
    const errorOptions = document.querySelectorAll('.qr-error-option');
    
    errorOptions.forEach(option => {
        option.addEventListener('click', function() {
            errorOptions.forEach(opt => {
                opt.classList.remove('selected');
                opt.style.animation = 'none';
            });
            
            this.classList.add('selected');
            this.style.animation = 'pulse 0.3s ease-in-out';
            
            setTimeout(() => {
                this.style.animation = 'none';
            }, 300);
        });
    });
});

document.querySelector('.qr-select').addEventListener('change', function() {
    document.querySelector('.qr-select option[value=""]').setAttribute('disabled', 'true');
}, { once: true });

document.getElementById('generate-btn').addEventListener('click', function() {
    document.querySelector('.preview-text').classList.add('hidden');
    const ssid = document.getElementById('ssid').value;
    const password = document.getElementById('password').value;
    const hidden = document.getElementById('hidden-ssid').checked;
    const security = document.getElementById('protocol-select').value;
    const errorCorrection = document.querySelector('.qr-error-option.selected').textContent;

    const wifiString = `WIFI:T:${security};S:${ssid};${security !== "nopass" ? "P:" + password + ";" : ""}${hidden ? "H:true;" : ""};`;

    // --- Generate QR ---
    const qr = qrcode(0, errorCorrection);
    qr.addData(wifiString);
    qr.make();

    const canvas = document.getElementById("qr-canvas");
    drawQR(qr, canvas);

    window.generatedSVG = qr.createSvgTag({ cellSize: 8, margin: 4 });
    window.generatedPNG = canvas.toDataURL("image/png");
});

function drawQR(qr, canvas) {
    const ctx = canvas.getContext("2d");
    const count = qr.getModuleCount();

    // square canvas
    const size = Math.min(canvas.width, canvas.height);
    canvas.width = size;
    canvas.height = size;

    const tileSize = size / count;

    // background white
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, size, size);

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "black";
    
    for (let row = 0; row < count; row++) {
        for (let col = 0; col < count; col++) {
            if (qr.isDark(row, col)) {
                // For last row/col, extend to the edge
                const w = (col + 1 === count) ? size - col * tileSize : tileSize;
                const h = (row + 1 === count) ? size - row * tileSize : tileSize;
                ctx.fillRect(col * tileSize, row * tileSize, w, h);
            }
        }
    }
}

document.getElementById("download-png").addEventListener("click", function() {
    if (!window.generatedPNG) {
        alert("Please generate a QR code first.");
        return;
    }
    const link = document.createElement("a");
    link.download = "wifi-qr.png";
    link.href = window.generatedPNG;
    link.click();
    URL.revokeObjectURL(link.href);
});

document.getElementById("download-svg").addEventListener("click", function() {
    if (!window.generatedSVG) {
        alert("Please generate a QR code first.");
        return;
    }
    
    const blob = new Blob([window.generatedSVG], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.download = "wifi-qr.svg";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
});
