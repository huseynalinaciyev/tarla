// URL-dən user adı oxu
const urlParams = new URLSearchParams(window.location.search);
const telegramUser = urlParams.get('user') || 'Qonaq';

const welcomeEl = document.getElementById('welcome');
welcomeEl.innerText = `Xoş gəlmisiniz, @${telegramUser}!`;

// Bitki şəkilləri (GitHub hosting)
const plantImages = {
    seed: 'https://huseynalinaciyev.github.io/tarla/seed.png',
    growing: 'https://huseynalinaciyev.github.io/tarla/growing.png',
    mature: 'https://huseynalinaciyev.github.io/tarla/mature.png',
    burning: 'https://huseynalinaciyev.github.io/tarla/burning.png'
};

const COIN_PER_PRODUCT = 1;
const EGG_SELL_PRICE = 5;
const MILK_SELL_PRICE = 7;

let data = {
    coins: 0,
    stock: 0,
    eggs: 0,
    milk: 0,
    chickens: 0,
    cows: 0,
    farmPlot: {
        plantStage: 'empty',
        plantedAt: 0,
        lastWateredAt: 0,
        harvestReady: false
    }
};

// LocalStorage açarı istifadəçi adı ilə
const storageKey = `farmGame_${telegramUser}`;

function loadData() {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
        try {
            data = JSON.parse(saved);
        } catch {
            console.warn("Yaddaşdan məlumat oxunarkən səhv baş verdi.");
        }
    }
}

function saveData() {
    localStorage.setItem(storageKey, JSON.stringify(data));
}

const coinsEl = document.getElementById('coins');
const stockEl = document.getElementById('stock');
const eggsEl = document.getElementById('eggs');
const milkEl = document.getElementById('milk');
const chickensEl = document.getElementById('chickens');
const cowsEl = document.getElementById('cows');
const plantAreaEl = document.getElementById('plant-area');

const plotInfoStage = document.getElementById('plant-stage-text');
const plotInfoPlanted = document.getElementById('planted-at');
const plotInfoWatered = document.getElementById('last-watered-at');
const plotInfoHarvest = document.getElementById('harvest-ready');
const wateringEl = document.getElementById('watering-animation');

function showWateringAnimation() {
    wateringEl.innerHTML = '';
    wateringEl.classList.remove('hidden');
    for (let i = 0; i < 3; i++) {
        const drop = document.createElement('div');
        drop.className = 'droplet';
        drop.style.left = `${i * 15}px`;
        drop.style.animationDelay = `${i * 0.4}s`;
        wateringEl.appendChild(drop);
    }
    setTimeout(() => {
        wateringEl.classList.add('hidden');
        wateringEl.innerHTML = '';
    }, 3000);
}

// Qalan vaxt formatı (mm:ss)
function formatTime(ms) {
    if (ms <= 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

function updatePlotUI() {
    const now = Date.now();
    const plot = data.farmPlot;

    // Qalan vaxtları hesabla
    let nextWaterTime = 0;
    let harvestTime = 0;
    let burnTime = 0;

    if (plot.plantStage === 'seed') {
        nextWaterTime = plot.plantedAt + 3600000; // 1 saat sonra suvarma
        burnTime = plot.plantedAt + 7200000; // 2 saat sonra yanacaq
    } else if (plot.plantStage === 'growing') {
        harvestTime = plot.lastWateredAt + 18000000; // 5 saat sonra məhsul yığılır
    } else if (plot.plantStage === 'burning') {
        burnTime = plot.plantedAt + 9000000; // 2.5 saat sonra torpaq təmizlənir
    }

    // Şəkli göstər (əgər yüklənməsə emoji)
    const url = plantImages[plot.plantStage];
    if (url) {
        const img = new Image();
        img.onload = () => {
            plantAreaEl.style.backgroundImage = `url(${url})`;
            plantAreaEl.innerText = '';
        };
        img.onerror = () => {
            plantAreaEl.style.backgroundImage = '';
            plantAreaEl.innerText = plot.plantStage === 'burning' ? '🔥' : '🌿';
        };
        img.src = url;
    } else {
        plantAreaEl.style.backgroundImage = '';
        plantAreaEl.innerText = plot.plantStage === 'burning' ? '🔥' : '🌿';
    }

    // Status məlumatları
    plotInfoStage.innerText = plot.plantStage.charAt(0).toUpperCase() + plot.plantStage.slice(1);

    if (plot.plantStage === 'seed') {
        const waterLeft = nextWaterTime - now;
        plotInfoWatered.innerText = waterLeft > 0 ? `Suvarmaya qalan vaxt: ${formatTime(waterLeft)}` : 'Suvarma vaxtı çatıb!';
        plotInfoPlanted.innerText = '—';  // Tarix göstərilmir
        plotInfoHarvest.innerText = 'Xeyr';
    } else if (plot.plantStage === 'growing') {
        const harvestLeft = harvestTime - now;
        plotInfoHarvest.innerText = harvestLeft > 0 ? `Yığım vaxtına qalan: ${formatTime(harvestLeft)}` : 'Hazırdır!';
        plotInfoWatered.innerText = plot.lastWateredAt ? 'Son suvarma qeydi mövcuddur' : '—'; // Tarix deyil
        plotInfoPlanted.innerText = '—'; // Tarix göstərilmir
    } else if (plot.plantStage === 'burning') {
        const burnLeft = burnTime - now;
        plotInfoPlanted.innerText = burnLeft > 0 ? `Yanmağa qalan vaxt: ${formatTime(burnLeft)}` : 'Torpaq təmizlənir...';
        plotInfoWatered.innerText = '—';
        plotInfoHarvest.innerText = 'Xeyr';
    } else {
        plotInfoPlanted.innerText = '—';
        plotInfoWatered.innerText = '—';
        plotInfoHarvest.innerText = 'Xeyr';
    }
}

function updateUI() {
    coinsEl.innerText = data.coins;
    stockEl.innerText = data.stock;
    eggsEl.innerText = data.eggs;
    milkEl.innerText = data.milk;
    chickensEl.innerText = data.chickens;
    cowsEl.innerText = data.cows;
    updatePlotUI();
    saveData();
}

function plantCrop() {
    if (data.farmPlot.plantStage !== 'empty' && data.farmPlot.plantStage !== 'burning') {
        alert('Əvvəlki bitkinizi yığın və ya yandırın!');
        return;
    }
    data.farmPlot.plantStage = 'seed';
    data.farmPlot.plantedAt = Date.now();
    data.farmPlot.lastWateredAt = 0;
    data.farmPlot.harvestReady = false;
    updateUI();
    plantAreaEl.innerText = '🌱'; // Yeni əkiləndə emoji göstər
    alert('Bitki əkildi! 1 saat ərzində suvarın.');
}

function waterCrop() {
    if (data.farmPlot.plantStage === 'empty' || data.farmPlot.plantStage === 'burning') {
        alert('Əvvəlcə bitki əkilməlidir.');
        return;
    }
    let now = Date.now();
    if (data.farmPlot.lastWateredAt && now - data.farmPlot.lastWateredAt < 3600000) {
        alert('Suvarma 1 saatda 1 dəfə mümkündür.');
        return;
    }
    data.farmPlot.lastWateredAt = now;
    if (data.farmPlot.plantStage === 'seed') {
        data.farmPlot.plantStage = 'growing';
    }
    showWateringAnimation();
    updateUI();
    alert('Bitki suvarıldı! 5 saat sonra məhsul yığa bilərsiniz.');
}

function harvestCrop() {
    if (data.farmPlot.plantStage !== 'mature' || !data.farmPlot.harvestReady) {
        alert('Məhsul hələ yığılmağa hazır deyil.');
        return;
    }
    data.stock++;
    data.farmPlot.plantStage = 'empty';
    data.farmPlot.harvestReady = false;
    data.farmPlot.plantedAt = 0;
    data.farmPlot.lastWateredAt = 0;
    updateUI();
    alert('Məhsul yığdınız! 1 coin qazandınız.');
}

function sellProduct() {
    if (data.stock <= 0) {
        alert('Satacaq məhsulunuz yoxdur.');
        return;
    }
    data.coins += data.stock * COIN_PER_PRODUCT;
    data.stock = 0;
    updateUI();
    alert('Məhsullar satıldı!');
}

function buyChicken() {
    if (data.coins < 100000) {
        alert('Kifayət qədər pulunuz yoxdur!');
        return;
    }
    data.coins -= 100000;
    data.chickens++;
    updateUI();
    alert('Toyuq alındı!');
}

function buyCow() {
    if (data.coins < 200000) {
        alert('Kifayət qədər pulunuz yoxdur!');
        return;
    }
    data.coins -= 200000;
    data.cows++;
    updateUI();
    alert('İnək alındı!');
}

function sellEggs() {
    if (data.eggs <= 0) {
        alert('Satacaq yumurta yoxdur.');
        return;
    }
    data.coins += data.eggs * EGG_SELL_PRICE;
    data.eggs = 0;
    updateUI();
    alert('Yumurtalar satıldı!');
}

function sellMilk() {
    if (data.milk <= 0) {
        alert('Satacaq süd yoxdur.');
        return;
    }
    data.coins += data.milk * MILK_SELL_PRICE;
    data.milk = 0;
    updateUI();
    alert('Süd satıldı!');
}

// Saatlıq avtomatik əməliyyatlar
setInterval(() => {
    const now = Date.now();

    if (data.farmPlot.plantStage === 'seed') {
        if (data.farmPlot.plantedAt && now - data.farmPlot.plantedAt > 3600000) {
            data.farmPlot.plantStage = 'burning';
            updateUI();
            alert('Bitki suvarılmadığı üçün yandı!');
        }
    }

    if (data.farmPlot.plantStage === 'growing') {
        if (data.farmPlot.lastWateredAt && now - data.farmPlot.lastWateredAt > 18000000) {
            data.farmPlot.plantStage = 'mature';
            data.farmPlot.harvestReady = true;
            updateUI();
            alert('Bitki yetişdi! Məhsulu yığa bilərsiniz.');
        }
    }

    if (data.farmPlot.plantStage === 'burning') {
        if (data.farmPlot.plantedAt && now - data.farmPlot.plantedAt > 4200000) {
            data.farmPlot.plantStage = 'empty';
            data.farmPlot.plantedAt = 0;
            data.farmPlot.lastWateredAt = 0;
            data.farmPlot.harvestReady = false;
            updateUI();
            alert('Yanmış bitki torpaqdan təmizləndi.');
        }
    }

    // Heyvanlardan məhsul əlavə et
    if (data.chickens > 0) data.eggs += data.chickens;
    if (data.cows > 0) data.milk += data.cows;

    updateUI();
}, 60000);

// Hər saniyə qalan vaxtı yenilə (real vaxt effekt)
setInterval(() => {
    updatePlotUI();
}, 1000);

loadData();
updateUI();
