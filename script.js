const SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbymHEXAcMO0nUgRLmcv0RXaIJEnzyDD7KeWLYegxgNJfHtrnsgMtMHfsjXMHLr7i7qFjg/exec'; // Ganti dengan Web App URL dari Google Apps Script
const NUM_RELAYS = 5; // Harus sesuai dengan NUM_RELAYS di kode ESP32 Anda

document.addEventListener('DOMContentLoaded', () => {
    generateRelayButtons();
    fetchRelayStatus();
    setInterval(fetchRelayStatus, 5000); // Perbarui status setiap 5 detik
});

function generateRelayButtons() {
    const relayButtonsDiv = document.getElementById('relay-buttons');
    for (let i = 1; i <= NUM_RELAYS; i++) {
        const relayItem = document.createElement('div');
        relayItem.className = 'relay-item';
        relayItem.innerHTML = `
            <span class="relay-label">Relay #${i} - GPIO ${getGpioForRelay(i)}</span>
            <div class="button-group">
                <button class="on-button" onclick="setRelayState(${i}, 'ON')">ON</button>
                <button class="off-button" onclick="setRelayState(${i}, 'OFF')">OFF</button>
                <span class="status-indicator" id="status-${i}">Loading...</span>
            </div>
        `;
        relayButtonsDiv.appendChild(relayItem);
    }
}

// Fungsi placeholder untuk mendapatkan GPIO yang sesuai (sesuaikan dengan array relayGPIOs di ESP32)
function getGpioForRelay(relayId) {
    const gpioMap = {
        1: 2,
        2: 26,
        3: 27,
        4: 25,
        5: 33
    };
    return gpioMap[relayId] || 'N/A';
}

async function setRelayState(relayId, status) {
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = `Mengirim perintah untuk Relay ${relayId}...`;
    try {
        const response = await fetch(`${SCRIPT_WEB_APP_URL}?action=updateRelay&relayId=${relayId}&status=${status}`, {
            method: 'POST', // Gunakan POST untuk update
            mode: 'no-cors' // Penting untuk menghindari masalah CORS di sisi browser
        });
        // Karena mode 'no-cors', respons tidak bisa dibaca.
        // Kita harus mengasumsikan berhasil dan memicu pembaruan status.
        statusMessage.textContent = `Perintah untuk Relay ${relayId} (${status}) berhasil dikirim. Memperbarui status...`;
        fetchRelayStatus(); // Perbarui status setelah mengirim perintah
    } catch (error) {
        console.error('Error sending command:', error);
        statusMessage.textContent = `Gagal mengirim perintah untuk Relay ${relayId}. Error: ${error.message}`;
    }
}

async function fetchRelayStatus() {
    try {
        const response = await fetch(`${SCRIPT_WEB_APP_URL}?action=getRelayStatus`, {
            method: 'GET'
        });
        const data = await response.json();

        for (const relayId in data) {
            const status = data[relayId];
            const statusIndicator = document.getElementById(`status-${relayId}`);
            if (statusIndicator) {
                statusIndicator.textContent = status;
                if (status === 'ON') {
                    statusIndicator.className = 'status-indicator status-on';
                } else {
                    statusIndicator.className = 'status-indicator status-off';
                }
            }
        }
        document.getElementById('status-message').textContent = `Status diperbarui pada ${new Date().toLocaleTimeString()}`;
    } catch (error) {
        console.error('Error fetching relay status:', error);
        document.getElementById('status-message').textContent = `Gagal mengambil status relay. Error: ${error.message}`;
    }
}
