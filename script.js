// URL-dən user adı oxu
const urlParams = new URLSearchParams(window.location.search);
const telegramUser = urlParams.get('user') || 'Qonaq';

const welcomeEl = document.getElementById('welcome');
welcomeEl.innerText = `Xoş gəlmisiniz, @${telegramUser}!`;

// Bitki şəkilləri
const plantImages = {
    seed: 'https://i.imgur.com/HB7YbcZ.png',
    growing: 'https://i.imgur.com/5o1HoQj.png',
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
    chickensEl.innerText = data.chickens;
    cowsEl.innerText = data.cows;

    // Bitki vəziyyəti
    switch (data.farmPlot.plantStage) {
        case 'empty':
            farmPlotEl.className = 'plot-empty';
            plantAreaEl.style.backgroundImage = '';
            plotInfoStage.innerText = 'Yoxdur';
            break;
        case 'seed':
            farmPlotEl.className = 'plot-empty';
            plantAreaEl.style.backgroundImage = `url(${plantImages.seed})`;
            plotInfoStage.innerText = 'Əkilmiş (toxum)';
            break;
        case 'growing':
            farmPlotEl.className = 'plot-empty';
            plantAreaEl.style.backgroundImage = `url(${plantImages.growing})`;
            plotInfoStage.innerText = 'Böyüyür';
            break;
        case 'mature':
            farmPlotEl.className = 'plot-empty';
            plantAreaEl.style.backgroundImage = `url(${plantImages.mature})`;
            plotInfoStage.innerText = 'Yetişmiş';
            break;
        case 'burning':
            farmPlotEl.className = 'plot-burning';
            plantAreaEl.style.backgroundImage = '';
            plotInfoStage.innerText = 'Yanır';
            break;
    }

    plotInfoPlanted.innerText = formatTimestamp(data.farmPlot.plantedAt);
    plotInfoWatered.innerText = formatTimestamp(data.farmPlot.lastWateredAt);
    plotInfoHarvest.innerText = data.farmPlot.harvestReady ? 'Bəli' : 'Xeyr';

    saveData();
}

function plantCrop() {
    if (data.farmPlot.plantStage !== 'empty' && data.farmPlot.plantStage !== 'burning') {
        console.log('Əvvəlki bitkinizi yığın və ya yandırın!');
        return;
    }
    data.farmPlot.plantStage = 'seed';
    data.farmPlot.plantedAt = Date.now();
    data.farmPlot.lastWateredAt = 0;
    data.farmPlot.harvestReady = false;
    console.log('Bitki əkildi! 1 saat ərzində suvarın.');
    updateUI();
}

function waterCrop() {
    if (data.farmPlot.plantStage === 'empty' || data.farmPlot.plantStage === 'burning') {
        console.log('Əvvəlcə bitki əkilməlidir.');
        return;
    }

    let now = Date.now();
    if (data.farmPlot.lastWateredAt && now - data.farmPlot.lastWateredAt < 3600000) {
        console.log('Suvarma 1 saatda 1 dəfə mümkündür.');
        return;
    }

    data.farmPlot.lastWateredAt = now;

    if (data.farmPlot.plantStage === 'seed') {
        data.farmPlot.plantStage = 'growing';
    }
    showWateringAnimation();
    console.log('Bitki suvarıldı! 5 saat sonra məhsul yığa bilərsiniz.');
    updateUI();
}

function harvestCrop() {
    if (data.farmPlot.plantStage !== 'mature' || !data.farmPlot.harvestReady) {
        console.log('Məhsul hələ yığılmağa hazır deyil.');
        return;
    }
    data.stock++;
    data.farmPlot.plantStage = 'empty';
    data.farmPlot.harvestReady = false;
    data.farmPlot.plantedAt = 0;
    data.farmPlot.lastWateredAt = 0;
    console.log('Məhsul yığdınız! 1 coin qazandınız.');
    updateUI();
}

function sellProduct() {
    if (data.stock <= 0) {
        console.log('Satacaq məhsulunuz yoxdur.');
        return;
    }
    data.coins += data.stock * COIN_PER_PRODUCT;
    data.stock = 0;
    console.log('Məhsullar satıldı!');
    updateUI();
}

function buyChicken() {
    if (data.coins < 100000) {
        console.log('Kifayət qədər pulunuz yoxdur!');
        return;
    }
    data.coins -= 100000;
    data.chickens++;
    console.log('Toyuq alındı!');
    updateUI();
}

function buyCow() {
    if (data.coins < 200000) {
        console.log('Kifayət qədər pulunuz yoxdur!');
        return;
    }
    data.coins -= 200000;
    data.cows++;
    console.log('İnək alındı!');
    updateUI();
}

function sellEggs() {
    if (data.eggs <= 0) {
        console.log('Satacaq yumurta yoxdur.');
        return;
    }
    data.coins += data.eggs * EGG_SELL_PRICE;
    data.eggs = 0;
    console.log('Yumurtalar satıldı!');
    updateUI();
}

function sellMilk() {
    if (data.milk <= 0) {
        console.log('Satacaq süd yoxdur.');
        return;
    }
    data.coins += data.milk * MILK_SELL_PRICE;
    data.milk = 0;
    console.log('Süd satıldı!');
    updateUI();
}

// Saatlıq avtomatik əməliyyatlar (hər dəqiqədə yox, amma 1 saat interval simulyasiya üçün 1 dəqiqə qoymuşuq)
setInterval(() => {
    const now = Date.now();

    // Bitkinin yanması (əkildikdən sonra 1 saat ərzində suvarılmazsa yanır)
    if (data.farmPlot.plantStage === 'seed') {
        if (data.farmPlot.plantedAt && now - data.farmPlot.plantedAt > 3600000) {
            data.farmPlot.plantStage = 'burning';
            console.log('Bitki suvarılmadığı üçün yandı!');
        }
    }

    // Bitkinin yetişməsi (suvarıldıqdan sonra 5 saat keçdikdə)
    if (data.farmPlot.plantStage === 'growing') {
        if (data.farmPlot.lastWateredAt && now - data.farmPlot.lastWateredAt > 18000000) {
            data.farmPlot.plantStage = 'mature';
            data.farmPlot.harvestReady = true;
            console.log('Bitki yetişdi! Məhsulu yığa bilərsiniz.');
        }
    }

    // Yanmış bitkinin təmizlənməsi (bu misalda 70 dəqiqədən sonra)
    if (data.farmPlot.plantStage === 'burning') {
        if (data.farmPlot.plantedAt && now - data.farmPlot.plantedAt > 4200000) {
            data.farmPlot.plantStage = 'empty';
            data.farmPlot.plantedAt = 0;
            data.farmPlot.lastWateredAt = 0;
            data.farmPlot.harvestReady = false;
            console.log('Yanmış bitki torpaqdan təmizləndi.');
        }
    }

    // Heyvanların məhsul istehsalı (1 dəqiqədə 1 yumurta və süd əvəzinə saatlıq qiymətlərlə uyğunlaşdır)
    if (data.chickens > 0) data.eggs += data.chickens;
    if (data.cows > 0) data.milk += data.cows;

    updateUI();
}, 60000);

loadData();
updateUI();
