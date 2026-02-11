// ===== CONFIGURATION DU JEU =====
const GAME_CONFIG = {
    TOTAL_DAYS: 30,
    DELIVERIES_PER_DAY: 10,
    MAX_SUSPICION: 100,
    MAX_HEAT: 100,
    MAX_ENERGY: 100,
    SUSPICION_THRESHOLD_INVESTIGATION: 80,
    MONEY_GOAL_PARADISE: 10000,
    MONEY_GOAL_COMFORTABLE: 5000,
    DAILY_WAGE: 50,
};

// ===== QUARTIERS =====
const DISTRICTS = [
    {
        id: 'business',
        name: 'Quartier d\'affaires',
        description: 'Clients pressés, colis premium. Très rentable mais surveillé.',
        valueModifier: 1.25,
        suspicionModifier: 1.2,
        energyCostModifier: 1.1,
        heatModifier: 1.15
    },
    {
        id: 'suburb',
        name: 'Zone pavillonnaire',
        description: 'Rythme modéré, voisins attentifs, gains stables.',
        valueModifier: 1,
        suspicionModifier: 1,
        energyCostModifier: 1,
        heatModifier: 1
    },
    {
        id: 'downtown',
        name: 'Centre-ville dense',
        description: 'Trafic pénible, mais beaucoup de livraisons opportunistes.',
        valueModifier: 1.1,
        suspicionModifier: 1.05,
        energyCostModifier: 1.2,
        heatModifier: 1.1
    },
    {
        id: 'residential',
        name: 'Résidences calmes',
        description: 'Peu de risques, moins de gros lots.',
        valueModifier: 0.85,
        suspicionModifier: 0.8,
        energyCostModifier: 0.85,
        heatModifier: 0.8
    },
    {
        id: 'industrial',
        name: 'Zone industrielle',
        description: 'Entrepôts et caméras. Colis lourds mais juteux.',
        valueModifier: 1.2,
        suspicionModifier: 1.15,
        energyCostModifier: 1.25,
        heatModifier: 1.2
    }
];

// ===== TYPES DE COLIS =====
const PACKAGE_TYPES = {
    amazon: {
        name: 'Amazon Prime',
        riskLevel: 3,
        valueRange: [50, 300],
        suspicionIncrease: 15,
        weight: ['Léger', 'Moyen'],
        aspects: ['Carton Amazon typique', 'Logo Prime visible', 'Emballage soigné'],
        hints: ['Les colis Amazon sont souvent surveillés', 'Risque élevé mais potentiellement lucratif']
    },
    aliexpress: {
        name: 'AliExpress',
        riskLevel: 1,
        valueRange: [5, 50],
        suspicionIncrease: 5,
        weight: ['Très léger', 'Léger'],
        aspects: ['Enveloppe plastique', 'Caractères chinois', 'Emballage minimal'],
        hints: ['Probablement pas grand-chose d\'intéressant', 'Risque faible']
    },
    fnac: {
        name: 'Fnac',
        riskLevel: 2,
        valueRange: [30, 200],
        suspicionIncrease: 10,
        weight: ['Moyen', 'Lourd'],
        aspects: ['Carton Fnac', 'Pourrait contenir électronique ou livres', 'Bien protégé'],
        hints: ['Électronique ou produits culturels', 'Risque modéré']
    },
    vinted: {
        name: 'Vinted/Particulier',
        riskLevel: 1,
        valueRange: [10, 80],
        suspicionIncrease: 8,
        weight: ['Léger', 'Moyen'],
        aspects: ['Emballage artisanal', 'Récupération de cartons', 'Scotch partout'],
        hints: ['Vêtements d\'occasion probablement', 'Faible valeur']
    },
    apple: {
        name: 'Apple Store',
        riskLevel: 4,
        valueRange: [200, 1500],
        suspicionIncrease: 25,
        weight: ['Moyen', 'Lourd'],
        aspects: ['Boîte blanche distinctive', 'Logo Apple', 'Emballage premium'],
        hints: ['TRÈS SURVEILLÉ', 'Valeur élevée mais danger maximum']
    },
    generic: {
        name: 'Colis standard',
        riskLevel: 2,
        valueRange: [20, 150],
        suspicionIncrease: 10,
        weight: ['Léger', 'Moyen', 'Lourd'],
        aspects: ['Carton brun', 'Étiquette simple', 'Origine inconnue'],
        hints: ['Mystère total', 'Risque modéré']
    }
};

// ===== TYPES DE CLIENTS =====
const CUSTOMER_TYPES = {
    busy: {
        name: 'Jeune actif pressé',
        description: '🏃 Un jeune en télétravail, casque sur les oreilles, ne fera même pas attention à vous',
        vigilanceLevel: 0.5,
        complaintChance: 0.1
    },
    elderly: {
        name: 'Retraité vigilant',
        description: '👴 Un papy qui regarde par la fenêtre depuis ce matin, il sait que vous devez passer',
        vigilanceLevel: 1.5,
        complaintChance: 0.4
    },
    camera: {
        name: 'Paranoïaque high-tech',
        description: '📹 Trois caméras visibles, sonnette connectée, stickers "propriété surveillée"',
        vigilanceLevel: 2.5,
        complaintChance: 0.7
    },
    absent: {
        name: 'Absent',
        description: '🚪 Personne à l\'horizon. Vous pouvez déposer devant la porte... ou pas',
        vigilanceLevel: 0.3,
        complaintChance: 0.2
    },
    friendly: {
        name: 'Voisin sympa',
        description: '😊 Une personne souriante qui vous offrirait bien un café',
        vigilanceLevel: 0.7,
        complaintChance: 0.15
    },
    suspicious: {
        name: 'Voisine méfiante',
        description: '🤨 Elle vous observe derrière son rideau et note tout dans un carnet',
        vigilanceLevel: 1.8,
        complaintChance: 0.5
    }
};

const SCAN_MESSAGES = [
    'Scan spectral: présence de composants électroniques détectée.',
    'Scan thermique: contenu compact, valeur probable élevée.',
    'Scan logistique: emballage reconditionné, faible marge.',
    'Scan express: probablement un article lifestyle standard.'
];

// ===== ÉTAT DU JEU =====
let gameState = {
    day: 1,
    money: 0,
    suspicion: 0,
    heat: 0,
    energy: GAME_CONFIG.MAX_ENERGY,
    deliveriesToday: 0,
    totalDeliveries: 0,
    packagesStolen: 0,
    packagesInspected: 0,
    complaintsReceived: 0,
    scansUsed: 0,
    pausesUsed: 0,
    currentPackage: null,
    currentCustomer: null,
    gameOver: false,
    events: [],
    selectedDistrict: null,
    districtOptions: [],
    packageScanned: false
};

// ===== ÉLÉMENTS DOM =====
const screens = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    end: document.getElementById('end-screen')
};

const elements = {
    money: document.getElementById('money'),
    day: document.getElementById('day'),
    deliveries: document.getElementById('deliveries'),
    suspicion: document.getElementById('suspicion'),
    suspicionFill: document.getElementById('suspicion-fill'),
    energy: document.getElementById('energy'),
    heat: document.getElementById('heat'),
    address: document.getElementById('current-address'),
    customerDesc: document.getElementById('customer-description'),
    packageSize: document.getElementById('package-size'),
    packageSender: document.getElementById('package-sender'),
    packageWeight: document.getElementById('package-weight'),
    packageAspect: document.getElementById('package-aspect'),
    packageHints: document.getElementById('package-hints'),
    logContent: document.getElementById('log-content'),
    modal: document.getElementById('inspect-modal'),
    inspectResult: document.getElementById('inspect-result'),
    endTitle: document.getElementById('end-title'),
    endContent: document.getElementById('end-content'),
    endStats: document.getElementById('end-stats'),
    truck: document.getElementById('delivery-truck'),
    dailyBriefing: document.getElementById('daily-briefing'),
    districtOptions: document.getElementById('district-options'),
    deliverBtn: document.getElementById('deliver-btn'),
    inspectBtn: document.getElementById('inspect-btn'),
    scanBtn: document.getElementById('scan-btn'),
    cooldownBtn: document.getElementById('cooldown-btn')
};

// ===== CARTE ET ANIMATION DU CAMION =====
const deliveryPoints = [];
for (let i = 1; i <= 10; i++) {
    deliveryPoints.push(document.getElementById(`point-${i}`));
}

function moveTruckToPoint(pointIndex) {
    if (pointIndex < 0 || pointIndex >= deliveryPoints.length) return;

    const point = deliveryPoints[pointIndex];
    const truck = elements.truck;

    if (pointIndex > 0) {
        deliveryPoints[pointIndex - 1].classList.remove('current');
        deliveryPoints[pointIndex - 1].classList.add('completed');
    }

    point.classList.add('current');

    const pointRect = point.getBoundingClientRect();
    const gridRect = point.parentElement.getBoundingClientRect();

    const x = pointRect.left - gridRect.left + (pointRect.width / 2) - 20;
    const y = pointRect.top - gridRect.top + (pointRect.height / 2) - 20;

    truck.classList.add('moving');
    truck.style.left = `${x}px`;
    truck.style.top = `${y}px`;

    setTimeout(() => {
        truck.classList.remove('moving');
    }, 1500);
}

function resetMap() {
    deliveryPoints.forEach(point => {
        point.classList.remove('current', 'completed');
    });

    moveTruckToPoint(0);
}

// ===== UTILITAIRES =====
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function getCurrentDistrict() {
    return gameState.selectedDistrict || {
        name: 'Quartier non défini',
        description: 'Sélectionnez une tournée pour commencer.',
        valueModifier: 1,
        suspicionModifier: 1,
        energyCostModifier: 1,
        heatModifier: 1
    };
}

function getEnergyPenalty() {
    if (gameState.energy >= 70) return 1;
    if (gameState.energy >= 40) return 1.15;
    if (gameState.energy >= 20) return 1.35;
    return 1.6;
}

function consumeEnergy(baseCost) {
    const district = getCurrentDistrict();
    const cost = Math.ceil(baseCost * district.energyCostModifier);
    gameState.energy = clamp(gameState.energy - cost, 0, GAME_CONFIG.MAX_ENERGY);
}

function increaseHeat(baseAmount) {
    const district = getCurrentDistrict();
    const amount = Math.ceil(baseAmount * district.heatModifier);
    gameState.heat = clamp(gameState.heat + amount, 0, GAME_CONFIG.MAX_HEAT);
}

// ===== PLAN DE TOURNÉE =====
function refreshDistrictOptions() {
    const shuffled = [...DISTRICTS].sort(() => Math.random() - 0.5);
    gameState.districtOptions = shuffled.slice(0, 3);
    gameState.selectedDistrict = null;

    elements.districtOptions.innerHTML = '';

    gameState.districtOptions.forEach((district) => {
        const button = document.createElement('button');
        button.className = 'district-btn';
        button.innerHTML = `
            <strong>${district.name}</strong>
            <span>${district.description}</span>
        `;
        button.addEventListener('click', () => selectDistrict(district.id));
        elements.districtOptions.appendChild(button);
    });

    elements.dailyBriefing.textContent = 'Choisissez votre quartier du jour : risque, valeur et fatigue changent selon la zone.';
    setDeliveryButtonsEnabled(false);
}

function selectDistrict(districtId) {
    const district = gameState.districtOptions.find(option => option.id === districtId);
    if (!district) return;

    gameState.selectedDistrict = district;
    addLog(`🧭 Tournée planifiée : ${district.name}. ${district.description}`, 'info');

    [...elements.districtOptions.children].forEach((button, index) => {
        const option = gameState.districtOptions[index];
        button.classList.toggle('selected', option.id === districtId);
    });

    elements.dailyBriefing.textContent = `Zone active : ${district.name}. Bonus valeur x${district.valueModifier.toFixed(2)}, risque x${district.suspicionModifier.toFixed(2)}.`;
    setDeliveryButtonsEnabled(true);

    if (!gameState.currentPackage) {
        startNewDelivery();
    } else {
        updatePackageDisplay();
    }
}

function setDeliveryButtonsEnabled(enabled) {
    elements.deliverBtn.disabled = !enabled;
    elements.inspectBtn.disabled = !enabled;
    elements.scanBtn.disabled = !enabled;
}

// ===== GÉNÉRATION DE LIVRAISON =====
function generatePackage() {
    const district = getCurrentDistrict();
    const types = Object.keys(PACKAGE_TYPES);
    const typeKey = randomChoice(types);
    const type = PACKAGE_TYPES[typeKey];
    const baseValue = random(type.valueRange[0], type.valueRange[1]);

    return {
        type: typeKey,
        name: type.name,
        riskLevel: type.riskLevel,
        value: Math.round(baseValue * district.valueModifier),
        suspicionIncrease: type.suspicionIncrease * district.suspicionModifier,
        weight: randomChoice(type.weight),
        aspect: randomChoice(type.aspects),
        hints: type.hints,
        address: generateAddress()
    };
}

function generateAddress() {
    const streets = ['Rue de la Paix', 'Avenue des Champs', 'Boulevard Victor Hugo',
        'Rue du Commerce', 'Impasse des Lilas', 'Place de la République'];
    const numbers = random(1, 150);
    return `${numbers} ${randomChoice(streets)}`;
}

function generateCustomer() {
    const types = Object.keys(CUSTOMER_TYPES);
    const typeKey = randomChoice(types);
    const type = CUSTOMER_TYPES[typeKey];

    const heatPressure = gameState.heat > 60 ? 0.1 : 0;

    return {
        type: typeKey,
        name: type.name,
        description: type.description,
        vigilanceLevel: type.vigilanceLevel + heatPressure,
        complaintChance: clamp(type.complaintChance + heatPressure, 0, 0.9)
    };
}

// ===== MISE À JOUR DE L'INTERFACE =====
function updateUI() {
    elements.money.textContent = `${gameState.money}€`;
    elements.day.textContent = `${gameState.day}/${GAME_CONFIG.TOTAL_DAYS}`;
    elements.deliveries.textContent = `${gameState.deliveriesToday}/${GAME_CONFIG.DELIVERIES_PER_DAY}`;
    elements.suspicion.textContent = `${Math.round(gameState.suspicion)}%`;
    elements.suspicionFill.style.width = `${gameState.suspicion}%`;
    elements.energy.textContent = `${Math.round(gameState.energy)}%`;
    elements.heat.textContent = `${Math.round(gameState.heat)}%`;

    elements.suspicionFill.className = 'suspicion-fill';
    if (gameState.suspicion < 30) {
        elements.suspicionFill.classList.add('suspicion-low');
    } else if (gameState.suspicion < 60) {
        elements.suspicionFill.classList.add('suspicion-medium');
    } else {
        elements.suspicionFill.classList.add('suspicion-high');
    }

    elements.cooldownBtn.disabled = gameState.pausesUsed >= 2 || gameState.energy > 95;
}

function updatePackageDisplay() {
    const pkg = gameState.currentPackage;
    const customer = gameState.currentCustomer;
    const district = getCurrentDistrict();

    elements.address.textContent = pkg.address;
    elements.customerDesc.textContent = `${customer.description} • Zone: ${district.name}`;
    elements.packageSize.textContent = ['Petit', 'Moyen', 'Grand', 'Très grand'][pkg.riskLevel - 1] || 'Moyen';
    elements.packageSender.textContent = pkg.name;
    elements.packageWeight.textContent = pkg.weight;
    elements.packageAspect.textContent = pkg.aspect;

    const hints = [...pkg.hints];
    if (gameState.packageScanned) {
        hints.unshift(`Valeur estimée ultra-précise : ${pkg.value}€`);
    }

    elements.packageHints.innerHTML = hints.map(hint =>
        `<div>💡 ${hint}</div>`
    ).join('');
}

function addLog(message, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = message;
    elements.logContent.prepend(entry);

    while (elements.logContent.children.length > 6) {
        elements.logContent.removeChild(elements.logContent.lastChild);
    }
}

// ===== LOGIQUE DE LIVRAISON =====
function startNewDelivery() {
    if (!gameState.selectedDistrict) {
        return;
    }

    if (gameState.deliveriesToday >= GAME_CONFIG.DELIVERIES_PER_DAY) {
        endDay();
        return;
    }

    gameState.currentPackage = generatePackage();
    gameState.currentCustomer = generateCustomer();
    gameState.packageScanned = false;

    moveTruckToPoint(gameState.deliveriesToday);

    updatePackageDisplay();
    updateUI();
}

function applyDeliveryFatigue() {
    consumeEnergy(8);
    increaseHeat(2);
}

function deliverNormally() {
    if (!gameState.currentPackage) return;

    gameState.deliveriesToday++;
    gameState.totalDeliveries++;

    applyDeliveryFatigue();

    if (Math.random() < 0.12) {
        const tip = random(2, 10);
        gameState.money += tip;
        addLog(`✨ Le client vous a laissé ${tip}€ de pourboire !`, 'success');
    } else {
        addLog('📦 Livraison effectuée normalement.', 'info');
    }

    gameState.suspicion = Math.max(0, gameState.suspicion - 1.5);

    checkForRandomEvents();
    checkGameOver();

    if (!gameState.gameOver) {
        startNewDelivery();
    }
}

function inspectPackage() {
    if (!gameState.currentPackage) return;

    const pkg = gameState.currentPackage;
    const customer = gameState.currentCustomer;

    gameState.packagesInspected++;
    consumeEnergy(6);

    const heatRisk = gameState.heat / 100 * 0.15;
    const exhaustionRisk = (1 - gameState.energy / 100) * 0.2;
    const detectionChance = customer.vigilanceLevel * 0.14 + heatRisk + exhaustionRisk;
    const wasDetected = Math.random() < detectionChance;

    if (wasDetected) {
        gameState.suspicion += pkg.suspicionIncrease * 1.6;
        increaseHeat(6);
        addLog('⚠️ Quelqu\'un vous a vu manipuler le colis !', 'danger');

        if (Math.random() < customer.complaintChance) {
            gameState.complaintsReceived++;
            gameState.suspicion += 10;
            increaseHeat(8);
            addLog('☎️ Le client a appelé votre manager !', 'danger');
        }

        deliverNormally();
        return;
    }

    const contents = [
        { item: `Un iPhone neuf (${pkg.value}€)`, emoji: '📱' },
        { item: `Une montre connectée (${pkg.value}€)`, emoji: '⌚' },
        { item: `Des AirPods (${pkg.value}€)`, emoji: '🎧' },
        { item: `Un livre collector (${pkg.value}€)`, emoji: '📚' },
        { item: `Des vêtements de marque (${pkg.value}€)`, emoji: '👕' },
        { item: `Un gadget électronique (${pkg.value}€)`, emoji: '🎮' },
        { item: `Des bijoux fantaisie (${pkg.value}€)`, emoji: '💍' },
        { item: `Des produits premium (${pkg.value}€)`, emoji: '💄' }
    ];

    const content = randomChoice(contents);

    elements.inspectResult.innerHTML = `
        <p>Vous ouvrez discrètement le colis et trouvez :</p>
        <p style="font-size: 2em; margin: 20px 0;">${content.emoji}</p>
        <p><strong>${content.item}</strong></p>
        <p style="margin-top: 15px; color: #666;">Que faites-vous ?</p>
    `;

    elements.modal.classList.add('active');
    updateUI();
}

function stealPackage() {
    const pkg = gameState.currentPackage;
    const customer = gameState.currentCustomer;

    gameState.money += pkg.value;
    gameState.packagesStolen++;
    gameState.deliveriesToday++;
    gameState.totalDeliveries++;

    let suspicionGain = pkg.suspicionIncrease;
    suspicionGain *= customer.vigilanceLevel;
    suspicionGain *= (1 + gameState.heat / 150);
    suspicionGain *= getEnergyPenalty();

    gameState.suspicion += suspicionGain;
    increaseHeat(10);
    consumeEnergy(12);

    if (Math.random() < customer.complaintChance * 0.75) {
        gameState.complaintsReceived++;
        gameState.suspicion += 15;
        increaseHeat(12);
        addLog('☎️ ALERTE : Le client a signalé le colis manquant !', 'danger');
    } else {
        addLog(`💰 Vous avez empoché ${pkg.value}€. Personne n'a rien vu... pour l'instant.`, 'warning');
    }

    elements.modal.classList.remove('active');

    checkForRandomEvents();
    checkGameOver();

    if (!gameState.gameOver) {
        startNewDelivery();
    }
}

function cancelSteal() {
    gameState.suspicion += 3;
    consumeEnergy(3);
    addLog('📦 Vous refermez le colis et le livrez normalement.', 'info');
    elements.modal.classList.remove('active');
    deliverNormally();
}

function scanPackage() {
    if (!gameState.currentPackage || gameState.packageScanned) {
        addLog('🛰️ Scan déjà effectué pour ce colis.', 'warning');
        return;
    }

    gameState.scansUsed++;
    consumeEnergy(4);
    increaseHeat(3);

    const failChance = 0.12 + gameState.heat / 250;
    if (Math.random() < failChance) {
        gameState.suspicion += 6;
        addLog('📡 Le scan a émis un bip suspect. Vous attirez des regards.', 'danger');
    } else {
        gameState.packageScanned = true;
        addLog(`🛰️ ${randomChoice(SCAN_MESSAGES)} Valeur estimée : ${gameState.currentPackage.value}€`, 'success');
        updatePackageDisplay();
    }

    updateUI();
    checkGameOver();
}

function takeCooldownBreak() {
    if (gameState.pausesUsed >= 2) {
        addLog('☕ Vous avez déjà pris toutes vos pauses discrètes du jour.', 'warning');
        return;
    }

    gameState.pausesUsed++;
    const energyGain = random(12, 20);
    const heatReduction = random(6, 12);

    gameState.energy = clamp(gameState.energy + energyGain, 0, GAME_CONFIG.MAX_ENERGY);
    gameState.heat = clamp(gameState.heat - heatReduction, 0, GAME_CONFIG.MAX_HEAT);
    gameState.suspicion = Math.max(0, gameState.suspicion - 2);

    addLog(`☕ Pause discrète: +${energyGain}% énergie, -${heatReduction}% pression.`, 'success');
    updateUI();
}

// ===== ÉVÉNEMENTS ALÉATOIRES =====
function checkForRandomEvents() {
    if (Math.random() < 0.18) {
        const events = [
            {
                message: '🚔 Contrôle surprise dans le quartier : la tension monte.',
                effect: () => {
                    gameState.suspicion += 6;
                    increaseHeat(10);
                },
                type: 'warning'
            },
            {
                message: '☀️ Quartier calme, les habitants sont détendus.',
                effect: () => {
                    gameState.suspicion = Math.max(0, gameState.suspicion - 5);
                    gameState.heat = Math.max(0, gameState.heat - 6);
                },
                type: 'success'
            },
            {
                message: '📰 Les vols de colis passent au journal local.',
                effect: () => {
                    gameState.suspicion += 10;
                    increaseHeat(8);
                },
                type: 'danger'
            },
            {
                message: '🎵 Un voisin vous glisse 20€ pour monter un colis lourd.',
                effect: () => {
                    gameState.money += 20;
                    consumeEnergy(2);
                },
                type: 'success'
            },
            {
                message: '🚦 Embouteillages monstres: vous finissez rincé.',
                effect: () => {
                    consumeEnergy(10);
                    gameState.suspicion += 4;
                },
                type: 'warning'
            }
        ];

        const event = randomChoice(events);
        event.effect();
        addLog(event.message, event.type);
    }
}

// ===== FIN DE JOURNÉE =====
function endDay() {
    gameState.day++;
    gameState.deliveriesToday = 0;
    gameState.pausesUsed = 0;
    gameState.packageScanned = false;
    gameState.currentPackage = null;
    gameState.currentCustomer = null;

    gameState.money += GAME_CONFIG.DAILY_WAGE;

    addLog(`🌙 Fin de journée ${gameState.day - 1}. Salaire : ${GAME_CONFIG.DAILY_WAGE}€`, 'success');

    if (gameState.day > GAME_CONFIG.TOTAL_DAYS) {
        endGame('monthComplete');
        return;
    }

    checkGameOver();

    if (!gameState.gameOver) {
        gameState.suspicion = Math.max(0, gameState.suspicion - 5);
        gameState.heat = Math.max(0, gameState.heat - 12);
        gameState.energy = clamp(gameState.energy + 35, 0, GAME_CONFIG.MAX_ENERGY);

        refreshDistrictOptions();
        updateUI();

        setTimeout(() => {
            resetMap();
            addLog(`☀️ Jour ${gameState.day} - Choisissez votre quartier.`, 'info');
        }, 700);
    }
}

// ===== VÉRIFICATION DE FIN DE JEU =====
function checkGameOver() {
    if (gameState.energy <= 0) {
        endGame('burnout');
        return;
    }

    if (gameState.suspicion >= GAME_CONFIG.MAX_SUSPICION) {
        endGame('caught');
        return;
    }

    if (gameState.heat >= GAME_CONFIG.MAX_HEAT) {
        endGame('manhunt');
        return;
    }

    if (gameState.suspicion >= GAME_CONFIG.SUSPICION_THRESHOLD_INVESTIGATION && Math.random() < 0.3) {
        endGame('investigation');
    }
}

// ===== FIN DE JEU =====
function endGame(reason) {
    gameState.gameOver = true;
    screens.game.classList.remove('active');
    screens.end.classList.add('active');

    let title;
    let content;
    let titleColor;

    switch (reason) {
        case 'caught':
            title = '🚔 ARRÊTÉ !';
            titleColor = '#dc3545';
            content = `
                <p>Votre comportement a fini par attirer l'attention des autorités.</p>
                <p>Une enquête a révélé vos larcins. Vous êtes arrêté pour vol et abus de confiance.</p>
                <p><strong>Prochaine destination : Le tribunal, puis probablement la prison.</strong></p>
            `;
            break;

        case 'manhunt':
            title = '🚨 CHASSE À L\'HOMME';
            titleColor = '#ff6b6b';
            content = `
                <p>Votre niveau de pression policière est devenu incontrôlable.</p>
                <p>Votre visage circule sur tous les groupes de quartier et les vigiles vous attendent.</p>
                <p><strong>Impossible de continuer sans vous faire repérer : fin de cavale.</strong></p>
            `;
            break;

        case 'burnout':
            title = '🥵 BURNOUT TOTAL';
            titleColor = '#ff922b';
            content = `
                <p>Vous avez poussé trop loin. Fatigue, stress, erreurs en chaîne.</p>
                <p>Vous faites un malaise en pleine tournée et la direction suspend votre contrat.</p>
                <p><strong>Vous survivez... mais votre plan s\'effondre.</strong></p>
            `;
            break;

        case 'investigation':
            title = '🔍 ENQUÊTE INTERNE';
            titleColor = '#ffc107';
            content = `
                <p>Trop de plaintes se sont accumulées contre vous.</p>
                <p>ChronoPost ouvre une enquête interne. Vous êtes licencié sur le champ.</p>
                <p>Votre réputation est ruinée, aucun autre transporteur ne vous embauchera.</p>
            `;
            break;

        case 'monthComplete':
            if (gameState.money >= GAME_CONFIG.MONEY_GOAL_PARADISE) {
                title = '🏝️ JACKPOT !';
                titleColor = '#28a745';
                content = `
                    <p>Vous avez terminé le mois sans tomber.</p>
                    <p>Avec ${gameState.money}€ en poche, vous quittez tout et disparaissez au soleil.</p>
                    <p><strong>Le crime presque parfait... cette fois.</strong></p>
                `;
            } else if (gameState.money >= GAME_CONFIG.MONEY_GOAL_COMFORTABLE) {
                title = '😌 SORTIE HONORABLE';
                titleColor = '#38ef7d';
                content = `
                    <p>Vous terminez le mois avec ${gameState.money}€.</p>
                    <p>Pas de jackpot, mais assez pour reprendre votre vie en main.</p>
                    <p><strong>Vous quittez la livraison avant la catastrophe.</strong></p>
                `;
            } else {
                title = '😐 RETOUR À LA CASE DÉPART';
                titleColor = '#667eea';
                content = `
                    <p>Le mois est terminé. Vous avez ${gameState.money}€.</p>
                    <p>Ce n\'est pas suffisant pour changer de vie.</p>
                    <p>Vous repartez à zéro, un peu plus cynique qu\'avant.</p>
                `;
            }
            break;

        default:
            title = 'FIN';
            titleColor = '#667eea';
            content = '<p>La partie est terminée.</p>';
    }

    elements.endTitle.textContent = title;
    elements.endTitle.style.color = titleColor;
    elements.endContent.innerHTML = content;
    elements.endStats.innerHTML = `
        <h3>📊 Statistiques finales</h3>
        <p>💰 Argent accumulé : <strong>${gameState.money}€</strong></p>
        <p>📦 Livraisons totales : <strong>${gameState.totalDeliveries}</strong></p>
        <p>🔍 Colis inspectés : <strong>${gameState.packagesInspected}</strong></p>
        <p>💼 Colis volés : <strong>${gameState.packagesStolen}</strong></p>
        <p>🛰️ Scans utilisés : <strong>${gameState.scansUsed}</strong></p>
        <p>☎️ Plaintes reçues : <strong>${gameState.complaintsReceived}</strong></p>
        <p>🎯 Niveau de suspicion final : <strong>${Math.round(gameState.suspicion)}%</strong></p>
        <p>🚨 Pression finale : <strong>${Math.round(gameState.heat)}%</strong></p>
        <p>⚡ Énergie restante : <strong>${Math.round(gameState.energy)}%</strong></p>
        <p>📅 Jours travaillés : <strong>${gameState.day - 1}/${GAME_CONFIG.TOTAL_DAYS}</strong></p>
    `;
}

// ===== INITIALISATION =====
function initGame() {
    gameState = {
        day: 1,
        money: 0,
        suspicion: 0,
        heat: 0,
        energy: GAME_CONFIG.MAX_ENERGY,
        deliveriesToday: 0,
        totalDeliveries: 0,
        packagesStolen: 0,
        packagesInspected: 0,
        complaintsReceived: 0,
        scansUsed: 0,
        pausesUsed: 0,
        currentPackage: null,
        currentCustomer: null,
        gameOver: false,
        events: [],
        selectedDistrict: null,
        districtOptions: [],
        packageScanned: false
    };

    elements.logContent.innerHTML = '';
    screens.start.classList.remove('active');
    screens.end.classList.remove('active');
    screens.game.classList.add('active');

    updateUI();
    resetMap();
    refreshDistrictOptions();
    addLog('☀️ Début de votre tournée. Sélectionnez un quartier pour lancer la journée.', 'info');
}

// ===== ÉVÉNEMENTS =====
document.getElementById('start-btn').addEventListener('click', initGame);
document.getElementById('restart-btn').addEventListener('click', () => {
    screens.end.classList.remove('active');
    screens.start.classList.add('active');
});

elements.deliverBtn.addEventListener('click', deliverNormally);
elements.inspectBtn.addEventListener('click', inspectPackage);
document.getElementById('steal-btn').addEventListener('click', stealPackage);
document.getElementById('cancel-steal-btn').addEventListener('click', cancelSteal);
elements.scanBtn.addEventListener('click', scanPackage);
elements.cooldownBtn.addEventListener('click', takeCooldownBreak);

elements.modal.addEventListener('click', (e) => {
    if (e.target === elements.modal) {
        cancelSteal();
    }
});

console.log('%c📦 CHRONOVOL - Le Livreur Indélicat', 'font-size: 20px; color: #667eea; font-weight: bold;');
console.log('%cVersion améliorée: tournées stratégiques, pression policière et gestion de fatigue.', 'font-size: 14px; color: #666;');
