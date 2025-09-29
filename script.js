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

    const typeOptions = document.querySelectorAll('.qr-type-option');
    const typeInputs = document.querySelectorAll('[class*="input-type"]');
    
    typeOptions.forEach(option => {
        option.addEventListener('click', function() {
            typeOptions.forEach(opt => {
                opt.classList.remove('selected');
                opt.style.animation = 'none';
            });
            typeInputs.forEach(input => {
                input.classList.add('hidden');
            });

            const selectedType = this.dataset.value;
            const inputGroup = document.querySelector(`.${selectedType}-input-type`);
            inputGroup.classList.remove('hidden');

            this.classList.add('selected');
            this.style.animation = 'pulse 0.3s ease-in-out';

            setTimeout(() => {
                this.style.animation = 'none';
            }, 300);
        });
    });

    document.querySelectorAll('input[type="color"]').forEach(colorPicker => {
        colorPicker.addEventListener('change', function() {
            const colorPreview = this.nextElementSibling;
            colorPreview.textContent = this.value.toUpperCase();
        });
    });
});

document.querySelector('.qr-select').addEventListener('change', function() {
    document.querySelector('.qr-select option[value=""]').setAttribute('disabled', 'true');
}, { once: true });

document.getElementById('generate-btn').addEventListener('click', function() {
    let qrString = '';
    const errorCorrection = document.getElementById('logo-upload').files.length > 0 ? 'H' : 'M';
    switch (document.querySelector('.qr-type-option.selected').dataset.value) {
        case 'wifi':
            qrString = generateWiFiQR();
            break;
        case 'url':
            qrString = generateUrlQR();
            break;
        case 'text':
            qrString = generateTextQR();
            break;
        case 'contact':
            qrString = generateContactQR();
            break;
        default:
            alert('Please select a QR code type.');
    }
    document.querySelector('.preview-text').classList.add('hidden');

    // --- Generate QR ---
    const qr = qrcode(0, errorCorrection);
    qr.addData(qrString);
    qr.make();
    
    const canvas = document.getElementById("qr-canvas");
    drawQR(qr, canvas);
    
    if (document.getElementById('logo-upload').files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const ctx = canvas.getContext("2d");
                const imgSize = canvas.width * 0.3;
                ctx.drawImage(img, (canvas.width - imgSize) / 2, (canvas.height - imgSize) / 2, imgSize, imgSize);
                
                // Move PNG generation here to include the logo
                window.generatedPNG = canvas.toDataURL("image/png");
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(document.getElementById('logo-upload').files[0]);
    } else {
        // Generate PNG without logo
        window.generatedPNG = canvas.toDataURL("image/png");
    }
});

function drawQR(qr, canvas) {
    const ctx = canvas.getContext("2d");
    const count = qr.getModuleCount();

    const size = Math.min(canvas.width, canvas.height);
    canvas.width = size;
    canvas.height = size;

    const margin = 20; 
    const qrSize = size - 2 * margin; 
    const qrTileSize = qrSize / count; 

    ctx.fillStyle = document.getElementById('bg-color').value || "white";
    ctx.fillRect(0, 0, size, size);

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = document.getElementById('fg-color').value || "black";
    
    for (let row = 0; row < count; row++) {
        for (let col = 0; col < count; col++) {
            if (qr.isDark(row, col)) {
                const x = Math.floor(margin + col * qrTileSize);
                const y = Math.floor(margin + row * qrTileSize);
                const nextX = Math.floor(margin + (col + 1) * qrTileSize);
                const nextY = Math.floor(margin + (row + 1) * qrTileSize);
                const w = nextX - x;
                const h = nextY - y;
                ctx.fillRect(x, y, w, h);
            }
        }
    }
}

function generateWiFiQR() {
    const ssid = document.getElementById('ssid').value;
    const password = document.getElementById('password').value;
    const hidden = document.getElementById('hidden-ssid').checked;
    const security = document.getElementById('protocol-select').value;

    const wifiString = `WIFI:T:${security};S:${ssid};${security !== "nopass" ? "P:" + password + ";" : ""}${hidden ? "H:true;" : ""};`;

    return wifiString;
}

function generateUrlQR() {
    const url = document.getElementById('url').value;
    const urlString = `URL:${url};`;

    return urlString;
}

function generateTextQR() {
    const text = document.getElementById('text').value;
    const textString = `TEXT:${text};`;

    return textString;
}

function generateContactQR() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const contactString = `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nEMAIL:${email}\nTEL:${phone}\nEND:VCARD`;

    return contactString;
}

document.querySelector(".preview-download-header img").addEventListener("click", function() {
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
