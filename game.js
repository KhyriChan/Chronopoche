// ===== CONFIGURATION DU JEU =====
const GAME_CONFIG = {
    TOTAL_DAYS: 30,
    DELIVERIES_PER_DAY: 10,
    MAX_SUSPICION: 100,
    SUSPICION_THRESHOLD_INVESTIGATION: 80,
    MONEY_GOAL_PARADISE: 10000,
    MONEY_GOAL_COMFORTABLE: 5000,
};

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

// ===== ÉTAT DU JEU =====
let gameState = {
    day: 1,
    money: 0,
    suspicion: 0,
    deliveriesToday: 0,
    totalDeliveries: 0,
    packagesStolen: 0,
    packagesInspected: 0,
    complaintsReceived: 0,
    currentPackage: null,
    currentCustomer: null,
    gameOver: false,
    events: []
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
    truck: document.getElementById('delivery-truck')
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

    // Marquer le point précédent comme complété
    if (pointIndex > 0) {
        deliveryPoints[pointIndex - 1].classList.remove('current');
        deliveryPoints[pointIndex - 1].classList.add('completed');
    }

    // Marquer le point actuel
    point.classList.add('current');

    // Obtenir la position du point
    const pointRect = point.getBoundingClientRect();
    const gridRect = point.parentElement.getBoundingClientRect();

    // Calculer la position relative
    const x = pointRect.left - gridRect.left + (pointRect.width / 2) - 20;
    const y = pointRect.top - gridRect.top + (pointRect.height / 2) - 20;

    // Animer le camion
    truck.classList.add('moving');
    truck.style.left = `${x}px`;
    truck.style.top = `${y}px`;

    // Retirer l'animation après le déplacement
    setTimeout(() => {
        truck.classList.remove('moving');
    }, 1500);
}

function resetMap() {
    // Réinitialiser tous les points
    deliveryPoints.forEach(point => {
        point.classList.remove('current', 'completed');
    });

    // Replacer le camion au premier point
    moveTruckToPoint(0);
}

// ===== UTILITAIRES =====
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

// ===== GÉNÉRATION DE LIVRAISON =====
function generatePackage() {
    const types = Object.keys(PACKAGE_TYPES);
    const typeKey = randomChoice(types);
    const type = PACKAGE_TYPES[typeKey];

    return {
        type: typeKey,
        name: type.name,
        riskLevel: type.riskLevel,
        value: random(type.valueRange[0], type.valueRange[1]),
        suspicionIncrease: type.suspicionIncrease,
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

    return {
        type: typeKey,
        name: type.name,
        description: type.description,
        vigilanceLevel: type.vigilanceLevel,
        complaintChance: type.complaintChance
    };
}

// ===== MISE À JOUR DE L'INTERFACE =====
function updateUI() {
    elements.money.textContent = `${gameState.money}€`;
    elements.day.textContent = `${gameState.day}/${GAME_CONFIG.TOTAL_DAYS}`;
    elements.deliveries.textContent = `${gameState.deliveriesToday}/${GAME_CONFIG.DELIVERIES_PER_DAY}`;
    elements.suspicion.textContent = `${Math.round(gameState.suspicion)}%`;
    elements.suspicionFill.style.width = `${gameState.suspicion}%`;

    // Changer la couleur de la barre de suspicion
    elements.suspicionFill.className = 'suspicion-fill';
    if (gameState.suspicion < 30) {
        elements.suspicionFill.classList.add('suspicion-low');
    } else if (gameState.suspicion < 60) {
        elements.suspicionFill.classList.add('suspicion-medium');
    } else {
        elements.suspicionFill.classList.add('suspicion-high');
    }
}

function updatePackageDisplay() {
    const pkg = gameState.currentPackage;
    const customer = gameState.currentCustomer;

    elements.address.textContent = pkg.address;
    elements.customerDesc.textContent = customer.description;
    elements.packageSize.textContent = ['Petit', 'Moyen', 'Grand'][pkg.riskLevel - 1] || 'Moyen';
    elements.packageSender.textContent = pkg.name;
    elements.packageWeight.textContent = pkg.weight;
    elements.packageAspect.textContent = pkg.aspect;

    // Afficher les indices
    elements.packageHints.innerHTML = pkg.hints.map(hint =>
        `<div>💡 ${hint}</div>`
    ).join('');
}

function addLog(message, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = message;
    elements.logContent.prepend(entry);

    // Garder seulement les 5 dernières entrées
    while (elements.logContent.children.length > 5) {
        elements.logContent.removeChild(elements.logContent.lastChild);
    }
}

// ===== LOGIQUE DE LIVRAISON =====
function startNewDelivery() {
    if (gameState.deliveriesToday >= GAME_CONFIG.DELIVERIES_PER_DAY) {
        endDay();
        return;
    }

    gameState.currentPackage = generatePackage();
    gameState.currentCustomer = generateCustomer();

    // Déplacer le camion vers le point de livraison
    moveTruckToPoint(gameState.deliveriesToday);

    updatePackageDisplay();
    updateUI();
}

function deliverNormally() {
    gameState.deliveriesToday++;
    gameState.totalDeliveries++;

    // Petite chance d'événement positif
    if (Math.random() < 0.1) {
        const tip = random(2, 10);
        gameState.money += tip;
        addLog(`✨ Le client vous a laissé ${tip}€ de pourboire !`, 'success');
    } else {
        addLog('📦 Livraison effectuée normalement.', 'info');
    }

    // Réduction légère de la suspicion pour bon comportement
    gameState.suspicion = Math.max(0, gameState.suspicion - 1);

    checkForRandomEvents();
    startNewDelivery();
}

function inspectPackage() {
    const pkg = gameState.currentPackage;
    const customer = gameState.currentCustomer;

    gameState.packagesInspected++;

    // Calculer si on se fait repérer pendant l'inspection
    const detectionChance = customer.vigilanceLevel * 0.15;
    const wasDetected = Math.random() < detectionChance;

    if (wasDetected) {
        gameState.suspicion += pkg.suspicionIncrease * 1.5;
        addLog(`⚠️ Quelqu'un vous a vu manipuler le colis !`, 'danger');

        if (Math.random() < customer.complaintChance) {
            gameState.complaintsReceived++;
            gameState.suspicion += 10;
            addLog(`☎️ Le client a appelé votre manager !`, 'danger');
        }

        // Forcer à livrer normalement
        deliverNormally();
        return;
    }

    // Ouvrir le modal d'inspection
    const contents = [
        { item: `Un iPhone neuf (${pkg.value}€)`, emoji: '📱' },
        { item: `Une montre connectée (${pkg.value}€)`, emoji: '⌚' },
        { item: `Des AirPods (${pkg.value}€)`, emoji: '🎧' },
        { item: `Un livre (${pkg.value}€)`, emoji: '📚' },
        { item: `Des vêtements (${pkg.value}€)`, emoji: '👕' },
        { item: `Un gadget électronique (${pkg.value}€)`, emoji: '🎮' },
        { item: `Des bijoux fantaisie (${pkg.value}€)`, emoji: '💍' },
        { item: `Des produits de beauté (${pkg.value}€)`, emoji: '💄' },
    ];

    const content = randomChoice(contents);

    elements.inspectResult.innerHTML = `
        <p>Vous ouvrez discrètement le colis et trouvez :</p>
        <p style="font-size: 2em; margin: 20px 0;">${content.emoji}</p>
        <p><strong>${content.item}</strong></p>
        <p style="margin-top: 15px; color: #666;">Que faites-vous ?</p>
    `;

    elements.modal.classList.add('active');
}

function stealPackage() {
    const pkg = gameState.currentPackage;
    const customer = gameState.currentCustomer;

    gameState.money += pkg.value;
    gameState.packagesStolen++;
    gameState.deliveriesToday++;
    gameState.totalDeliveries++;

    // Augmentation de suspicion
    let suspicionGain = pkg.suspicionIncrease;

    // La vigilance du client affecte la suspicion
    suspicionGain *= customer.vigilanceLevel;

    gameState.suspicion += suspicionGain;

    // Chance de plainte
    if (Math.random() < customer.complaintChance * 0.7) {
        gameState.complaintsReceived++;
        gameState.suspicion += 15;
        addLog(`☎️ ALERTE : Le client a signalé le colis manquant !`, 'danger');
    } else {
        addLog(`💰 Vous avez empoché ${pkg.value}€. Le client ne s'est aperçu de rien... pour l'instant.`, 'warning');
    }

    elements.modal.classList.remove('active');

    checkForRandomEvents();
    checkGameOver();

    if (!gameState.gameOver) {
        startNewDelivery();
    }
}

function cancelSteal() {
    gameState.suspicion += 3; // Petite augmentation car temps perdu
    addLog('📦 Vous refermez le colis et le livrez normalement.', 'info');
    elements.modal.classList.remove('active');
    deliverNormally();
}

// ===== ÉVÉNEMENTS ALÉATOIRES =====
function checkForRandomEvents() {
    if (Math.random() < 0.15) {
        const events = [
            {
                message: '🚔 Une voiture de police passe dans la rue...',
                effect: () => { gameState.suspicion += 5; },
                type: 'warning'
            },
            {
                message: '☀️ Belle journée, les gens sont de bonne humeur.',
                effect: () => { gameState.suspicion = Math.max(0, gameState.suspicion - 5); },
                type: 'success'
            },
            {
                message: '📰 Un article sur les vols de colis fait la une.',
                effect: () => { gameState.suspicion += 10; },
                type: 'danger'
            },
            {
                message: '🎵 Vous trouvez 20€ par terre !',
                effect: () => { gameState.money += 20; },
                type: 'success'
            },
            {
                message: '😓 Un client vous reproche un retard... qui n\'est pas de votre faute.',
                effect: () => { gameState.suspicion += 8; },
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

    // Salaire quotidien
    const dailyWage = 50;
    gameState.money += dailyWage;

    addLog(`🌙 Fin de journée ${gameState.day - 1}. Salaire : ${dailyWage}€`, 'success');

    // Vérification de fin de jeu
    if (gameState.day > GAME_CONFIG.TOTAL_DAYS) {
        endGame('monthComplete');
        return;
    }

    checkGameOver();

    if (!gameState.gameOver) {
        // Petite réduction de suspicion overnight
        gameState.suspicion = Math.max(0, gameState.suspicion - 5);
        updateUI();
        setTimeout(() => {
            resetMap();
            addLog(`☀️ Jour ${gameState.day} - Nouvelle tournée`, 'info');
            startNewDelivery();
        }, 1000);
    }
}

// ===== VÉRIFICATION DE FIN DE JEU =====
function checkGameOver() {
    // Trop de suspicion = investigation
    if (gameState.suspicion >= GAME_CONFIG.MAX_SUSPICION) {
        endGame('caught');
        return;
    }

    // Investigation si suspicion très élevée
    if (gameState.suspicion >= GAME_CONFIG.SUSPICION_THRESHOLD_INVESTIGATION && Math.random() < 0.3) {
        endGame('investigation');
        return;
    }
}

// ===== FIN DE JEU =====
function endGame(reason) {
    gameState.gameOver = true;
    screens.game.classList.remove('active');
    screens.end.classList.add('active');

    let title, content, titleColor;

    switch(reason) {
        case 'caught':
            title = '🚔 ARRÊTÉ !';
            titleColor = '#dc3545';
            content = `
                <p>Votre comportement a fini par attirer l'attention des autorités.</p>
                <p>Une enquête a révélé vos larcins. Vous êtes arrêté pour vol et abus de confiance.</p>
                <p><strong>Prochaine destination : Le tribunal, puis probablement la prison.</strong></p>
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
                    <p>Vous avez réussi un mois complet sans vous faire prendre !</p>
                    <p>Avec ${gameState.money}€ en poche, vous démissionnez et partez aux Bahamas.</p>
                    <p><strong>Retraite anticipée sous les palmiers. Vous avez gagné !</strong></p>
                `;
            } else if (gameState.money >= GAME_CONFIG.MONEY_GOAL_COMFORTABLE) {
                title = '😌 SORTIE HONORABLE';
                titleColor = '#38ef7d';
                content = `
                    <p>Vous terminez le mois avec ${gameState.money}€.</p>
                    <p>Ce n'est pas la fortune, mais c'est suffisant pour vous en sortir quelques mois.</p>
                    <p>Vous démissionnez et cherchez un meilleur emploi. Une vie honnête vous attend peut-être.</p>
                `;
            } else {
                title = '😐 RETOUR À LA CASE DÉPART';
                titleColor = '#667eea';
                content = `
                    <p>Le mois est terminé. Vous avez ${gameState.money}€.</p>
                    <p>Ce n'est pas suffisant pour changer de vie.</p>
                    <p>Vous continuez votre travail de livreur, avec vos maigres économies et vos regrets.</p>
                `;
            }
            break;
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
        <p>☎️ Plaintes reçues : <strong>${gameState.complaintsReceived}</strong></p>
        <p>🎯 Niveau de suspicion final : <strong>${Math.round(gameState.suspicion)}%</strong></p>
        <p>📅 Jours travaillés : <strong>${gameState.day - 1}/${GAME_CONFIG.TOTAL_DAYS}</strong></p>
    `;
}

// ===== INITIALISATION =====
function initGame() {
    gameState = {
        day: 1,
        money: 0,
        suspicion: 0,
        deliveriesToday: 0,
        totalDeliveries: 0,
        packagesStolen: 0,
        packagesInspected: 0,
        complaintsReceived: 0,
        currentPackage: null,
        currentCustomer: null,
        gameOver: false,
        events: []
    };

    elements.logContent.innerHTML = '';
    screens.start.classList.remove('active');
    screens.end.classList.remove('active');
    screens.game.classList.add('active');

    updateUI();
    resetMap();
    addLog('☀️ Début de votre première tournée. Bonne chance !', 'info');
    startNewDelivery();
}

// ===== ÉVÉNEMENTS =====
document.getElementById('start-btn').addEventListener('click', initGame);
document.getElementById('restart-btn').addEventListener('click', () => {
    screens.end.classList.remove('active');
    screens.start.classList.add('active');
});

document.getElementById('deliver-btn').addEventListener('click', deliverNormally);
document.getElementById('inspect-btn').addEventListener('click', inspectPackage);
document.getElementById('steal-btn').addEventListener('click', stealPackage);
document.getElementById('cancel-steal-btn').addEventListener('click', cancelSteal);

// Fermer le modal en cliquant à l'extérieur
elements.modal.addEventListener('click', (e) => {
    if (e.target === elements.modal) {
        cancelSteal();
    }
});

// ===== MESSAGES DE DÉMARRAGE =====
console.log('%c📦 CHRONOVOL - Le Livreur Indélicat', 'font-size: 20px; color: #667eea; font-weight: bold;');
console.log('%cBienvenue dans le monde gris de la livraison de colis...', 'font-size: 14px; color: #666;');
