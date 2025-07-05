const SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbymHEXAcMO0nUgRLmcv0RXaIJEnzyDD7KeWLYegxgNJfHtrnsgMtMHfsjXMHLr7i7qFjg/exec'; // Ganti dengan Web App URL dari Google Apps Script
const NUM_RELAYS = 5; 

document.addEventListener('DOMContentLoaded', () => {
    generateRelayButtons();
    fetchRelayStatus();
    fetchActivityLogs(); // Panggil saat awal
    setInterval(fetchRelayStatus, 100); 
    setInterval(fetchActivityLogs, 100); // Perbarui log setiap 10 detik
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
            method: 'POST', 
            mode: 'no-cors' 
        });
        statusMessage.textContent = `Perintah untuk Relay ${relayId} (${status}) berhasil dikirim. Memperbarui status...`;
        fetchRelayStatus(); 
        fetchActivityLogs(); // Perbarui log setelah mengirim perintah
    } catch (error) {
        console.error('Error sending command:', error);
        statusMessage.textContent = `Gagal mengirim perintah untuk Relay ${relayId}. Error: ${error.message}`;
        fetchActivityLogs(); // Perbarui log juga jika ada error pengiriman
    }
}

async function fetchRelayStatus() {
    try {
        const response = await fetch(`${SCRIPT_WEB_APP_URL}?action=getRelayStatus`);
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

// !!! FUNGSI BARU: Mengambil dan menampilkan log !!!
async function fetchActivityLogs() {
    const logBox = document.getElementById('activity-log');
    try {
        // Minta 15 log terbaru
        const response = await fetch(`${SCRIPT_WEB_APP_URL}?action=getLogs&count=15`);
        const logs = await response.json();

        logBox.innerHTML = ''; // Kosongkan log yang ada
        if (logs.length === 0) {
            logBox.innerHTML = '<p>No activity logs found.</p>';
        } else {
            logs.forEach(log => {
                const p = document.createElement('p');
                p.textContent = log;
                logBox.appendChild(p);
            });
        }
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        logBox.innerHTML = `<p style="color: red;">Failed to load logs: ${error.message}</p>`;
    }
}
// !!! AKHIR FUNGSI BARU !!!
