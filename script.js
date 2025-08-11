// URL-dən user adı oxu
const urlParams = new URLSearchParams(window.location.search);
const telegramUser = urlParams.get('user') || 'Qonaq';

const welcomeEl = document.getElementById('welcome');
welcomeEl.innerText = `Xoş gəlmisiniz, @${telegramUser}!`;

// Bitki şəkilləri (əlavə et öz hostingdə)
const plantImages = {
    seed: 'https://huseynalinaciyev.github.io/tarla/seed.png',    // öz hosting ünvanı
    growing: 'https://huseynalinaciyev.github.io/tarla/growing.png',
    mature: 'https://huseynalinaciyev.github.io/tarla/mature.png'
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
const farmPlotEl = document.getElementById('farm-plot');
const plantAreaEl = document.getElementById('plant-area');
const wateringEl = document.getElementById('watering-animation');

const plotInfoStage = document.getElementById('plant-stage-text');
const plotInfoPlanted = document.getElementById('planted-at');
const plotInfoWatered = document.getElementById('last-watered-at');
const plotInfoHarvest = document.getElementById('harvest-ready');

function formatTimestamp(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleString();
}

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

function updateUI() {
    coinsEl.innerText = data.coins;
    stockEl.innerText = data.stock;
    eggsEl.innerText = data.eggs;
    milkEl.innerText = data.milk;

    // Heyvan sayını göstərməyi əlavə edə bilərsən, indi gizlidir

    // Bitki vəziyyəti
    plotInfoStage.innerText = '';
    plotInfoPlanted.innerText = formatTimestamp(data.farmPlot.plantedAt);
    plotInfoWatered.innerText = formatTimestamp(data.farmPlot.lastWateredAt);
    plotInfoHarvest.innerText = data.farmPlot.harvestReady ? 'Bəli' : 'Xeyr';

    if (data.farmPlot.plantStage === 'empty' || data.farmPlot.plantStage === 'burning') {
        plantAreaEl.style.backgroundImage = '';
        plantAreaEl.innerText = data.farmPlot.plantStage === 'burning' ? '🔥' : '';
        plotInfoStage.innerText = data.farmPlot.plantStage === 'burning' ? 'Yandı' : 'Yoxdur';
    } else {
        // Əgər şəkil mövcuddursa göstər, yoxsa emoji ilə əvəzlə
        const imgUrl = plantImages[data.farmPlot.plantStage];
        if (imgUrl) {
            // Şəkli yoxlamaq üçün qısa test:
            plantAreaEl.style.backgroundImage = `url(${imgUrl})`;
            plantAreaEl.innerText = '';
        } else {
            plantAreaEl.style.backgroundImage = '';
            plantAreaEl.innerText = '🌿';
        }
        plotInfoStage.innerText = data.farmPlot.plantStage.charAt(0).toUpperCase() + data.farmPlot.plantStage.slice(1);
    }

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

    if (data.chickens > 0) data.eggs += data.chickens;
    if (data.cows > 0) data.milk += data.cows;

    updateUI();
}, 60000);

loadData();
updateUI();
