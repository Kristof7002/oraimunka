document.getElementById('parkingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateParkingFee();
});

function calculateParkingFee() {
    // Adatok beolvasása
    const zone = document.getElementById('zone').value;
    const vehicle = document.getElementById('vehicle').value;
    const hours = parseInt(document.getElementById('hours').value) || 0;
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const isSubscriber = document.getElementById('subscriber').checked;

    // Zóna díjak
    const zonePrices = {
        'A': 500,
        'B': 800,
        'C': 1200
    };

    // Jármű szorzók
    const vehicleMultipliers = {
        'car': 1,
        'truck': 1.5,
        'minibus': 2
    };

    // Teljes idő órában
    const totalHours = hours + (minutes / 60);

    // Alapóra díj
    const basePrice = zonePrices[zone] * vehicleMultipliers[vehicle];

    // Progresszív díjszámítás
    let totalFee = 0;
    let remainingHours = totalHours;

    for (let h = 1; h <= Math.ceil(totalHours); h++) {
        const hourMultiplier = Math.pow(1.1, h - 1);
        const hourFee = basePrice * hourMultiplier;
        
        if (remainingHours >= 1) {
            totalFee += hourFee;
            remainingHours -= 1;
        } else {
            // Frakcionális óra arányosan
            totalFee += hourFee * remainingHours;
            break;
        }
    }

    // Napi maximum (24 óra után)
    const maxDailyFee = basePrice * 10; // 10x az alapóra
    if (totalHours >= 24) {
        totalFee = Math.min(totalFee, maxDailyFee);
    }

    // Bérleti kedvezmény
    if (isSubscriber) {
        totalFee *= 0.8;
    }

    // Eredmény megjelenítése
    displayResult(zone, vehicle, hours, minutes, totalFee.toFixed(0));
}

function displayResult(zone, vehicle, hours, minutes, totalFee) {
    const vehicleNames = {
        'car': 'Személyautó',
        'truck': 'Teherautó',
        'minibus': 'Kisbusz'
    };

    const details = `
        <div class="result-row">
            <span>Zóna:</span>
            <span>${zone} zóna</span>
        </div>
        <div class="result-row">
            <span>Jármű:</span>
            <span>${vehicleNames[vehicle]}</span>
        </div>
        <div class="result-row">
            <span>Parkolási idő:</span>
            <span>${hours} óra ${minutes} perc</span>
        </div>
        <div class="result-row">
            <span>Végösszeg:</span>
            <span>${totalFee} Ft</span>
        </div>
    `;

    document.getElementById('resultDetails').innerHTML = details;
    document.getElementById('totalAmount').textContent = `${totalFee} Ft`;
    document.getElementById('result').classList.remove('hidden');

    // Nyomtatás gomb
    document.getElementById('printBtn').onclick = function() {
        printTicket(zone, vehicleNames[vehicle], hours, minutes, totalFee);
    };
}

function printTicket(zone, vehicle, hours, minutes, totalFee) {
    const ticket = `
******************************
***    PARKOLÓJEGY    ***
******************************
Zóna: ${zone}
Jármű: ${vehicle}
Idő: ${hours} óra ${minutes} perc
Díj: ${totalFee} Ft

Készült: ${new Date().toLocaleString('hu-HU')}

******************************
    NYOMTASD KI ÉS FIZESS!
******************************
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head><title>Parkolójegy</title></head>
        <body style="font-family: monospace; padding: 20px; font-size: 14px;">
            <pre>${ticket}</pre>
            <script>window.print(); window.close();</script>
        </body>
        </html>
    `);
    printWindow.document.close();
}
