// --- DATA ---
// Bitki şəkilləri (pixel art, az sayda mərhələ üçün)
const plantImages = {
    seed: 'https://i.imgur.com/HB7YbcZ.png',          // toxum
    growing: 'https://i.imgur.com/5o1HoQj.png',       // suvarılmış bitki
    mature: 'https://i.imgur.com/X3B1rzP.png'         // yetişmiş bitki
};

const COIN_PER_PRODUCT = 1;
const EGG_SELL_PRICE = 5;
const MILK_SELL_PRICE = 7;

let coins = 0;
let stock = 0;    // məhsul sayı
let eggs = 0;
let milk = 0;

let chickens = 0;
let cows = 0;

// Tarlanın statusu
let farmPlot = {
    hasPlant: false,
    plantStage: 'empty',  // empty, seed, growing, mature, burning
    plantedAt: 0,
    lastWateredAt: 0,
    canWater: true,
    harvestReady: false
};

// DOM elementləri
const coinsEl = document.getElementById('coins');
const stockEl = document.getElementById('stock');
const eggsEl = document.getElementById('eggs');
const milkEl = document.getElementById('milk');
const chickensEl = document.getElementById('chickens');
const cowsEl = document.getElementById('cows');
const farmPlotEl = document.getElementById('farm-plot');
const plantAreaEl = document.getElementById('plant-area');

// Funksiya: UI yenilə
function updateUI(){
    coinsEl.innerText = coins;
    stockEl.innerText = stock;
    eggsEl.innerText = eggs;
    milkEl.innerText = milk;
    chickensEl.innerText = chickens;
    cowsEl.innerText = cows;

    // Bitkinin vizualı
    if(farmPlot.plantStage === 'empty'){
        farmPlotEl.className = 'plot-empty';
        plantAreaEl.style.backgroundImage = '';
    }
    else if(farmPlot.plantStage === 'seed'){
        farmPlotEl.className = 'plot-empty';
        plantAreaEl.style.backgroundImage = `url(${plantImages.seed})`;
    }
    else if(farmPlot.plantStage === 'growing'){
        farmPlotEl.className = 'plot-empty';
        plantAreaEl.style.backgroundImage = `url(${plantImages.growing})`;
    }
    else if(farmPlot.plantStage === 'mature'){
        farmPlotEl.className = 'plot-empty';
        plantAreaEl.style.backgroundImage = `url(${plantImages.mature})`;
    }
    else if(farmPlot.plantStage === 'burning'){
        farmPlotEl.className = 'plot-burning';
        plantAreaEl.style.backgroundImage = '';
    }
}

// Funksiya: bitki ək
function plantCrop(){
    if(farmPlot.plantStage !== 'empty' && farmPlot.plantStage !== 'burning'){
        alert('Əvvəl mövcud bitkinizi yığın və ya yandırın!');
        return;
    }
    farmPlot.plantStage = 'seed';
    farmPlot.plantedAt = Date.now();
    farmPlot.lastWateredAt = 0;
    farmPlot.canWater = true;
    farmPlot.harvestReady = false;
    updateUI();
    alert('Bitki əkildi! 1 saat ərzində suvarın.');
}

// Funksiya: bitkini suvar
function waterCrop(){
    if(farmPlot.plantStage === 'empty' || farmPlot.plantStage === 'burning'){
        alert('Əvvəlcə bitki əkilməlidir.');
        return;
    }
    let now = Date.now();

    // Suvarma 1 saatda 1 dəfə ola bilər
    if(farmPlot.lastWateredAt && (now - farmPlot.lastWateredAt < 3600000)){
        alert('Suvarma 1 saatda 1 dəfə mümkündür.');
        return;
    }

    farmPlot.lastWateredAt = now;

    if(farmPlot.plantStage === 'seed'){
        farmPlot.plantStage = 'growing';
    }

    updateUI();
    alert('Bitki suvarıldı! 5 saat sonra məhsul yığa bilərsiniz.');
}

// Funksiya: məhsul yığ
function harvestCrop(){
    if(farmPlot.plantStage !== 'mature' || !farmPlot.harvestReady){
        alert('Məhsul hələ yığılmağa hazır deyil.');
        return;
    }
    stock++;
    farmPlot.plantStage = 'empty';
    farmPlot.harvestReady = false;
    farmPlot.canWater = true;
    farmPlot.lastWateredAt = 0;
    farmPlot.plantedAt = 0;
    updateUI();
    alert('Məhsul yığdınız! Bazar qiyməti: 1 coin.');
}

// Funksiya: məhsul sat
function sellProduct(){
    if(stock <= 0){
        alert('Satacaq məhsulunuz yoxdur.');
        return;
    }
    coins += stock * COIN_PER_PRODUCT;
    stock = 0;
    updateUI();
    alert('Məhsullar satıldı.');
}

// Toyuq alma
function buyChicken(){
    if(coins < 100000){
        alert('Kifayət qədər pulunuz yoxdur!');
        return;
    }
    coins -= 100000;
    chickens++;
    updateUI();
    alert('Toyuq alındı!');
}

// İnək alma
function buyCow(){
    if(coins < 200000){
        alert('Kifayət qədər pulunuz yoxdur!');
        return;
    }
    coins -= 200000;
    cows++;
    updateUI();
    alert('İnək alındı!');
}

// Yumurtaları sat
function sellEggs(){
    if(eggs <= 0){
        alert('Satacaq yumurta yoxdur.');
        return;
    }
    coins += eggs * EGG_SELL_PRICE;
    eggs = 0;
    updateUI();
    alert('Yumurtalar satıldı!');
}

// Südü sat
function sellMilk(){
    if(milk <= 0){
        alert('Satacaq süd yoxdur.');
        return;
    }
    coins += milk * MILK_SELL_PRICE;
    milk = 0;
    updateUI();
    alert('Süd satıldı!');
}

// --- Zamanla avtomatik əməliyyatlar ---
// Hər 1 dəqiqədə toyuq yumurta qoyur, inək süd verir
setInterval(() => {
    if(chickens > 0) eggs += chickens;
    if(cows > 0) milk += cows;
    updateUI();
}, 60000);

// Hər 1 dəqiqədə bitkinin vəziyyətini yoxlayırıq
setInterval(() => {
    let now = Date.now();

    if(farmPlot.plantStage === 'seed'){
        // 1 saat ərzində suvarılmadısa yanır
        if(farmPlot.plantedAt && now - farmPlot.plantedAt > 3600000){
            farmPlot.plantStage = 'burning';
            updateUI();
            alert('Bitki suvarılmadığı üçün yandı!');
        }
    }

    if(farmPlot.plantStage === 'growing'){
        // Suvarıldısa 5 saatdan sonra məhsul yetişir
        if(farmPlot.lastWateredAt && now - farmPlot.lastWateredAt > 18000000){
            farmPlot.plantStage = 'mature';
            farmPlot.harvestReady = true;
            updateUI();
            alert('Bitki yetişdi! Məhsulu yığa bilərsiniz.');
        }
    }

    if(farmPlot.plantStage === 'burning'){
        // Yanmış bitki 10 dəqiqədən sonra silinir
        if(farmPlot.plantedAt && now - farmPlot.plantedAt > 4200000){ 
            // 70 dəqiqə keçdi (1 saat + 10 dəq)
            farmPlot.plantStage = 'empty';
            farmPlot.plantedAt = 0;
            farmPlot.lastWateredAt = 0;
            farmPlot.harvestReady = false;
            updateUI();
            alert('Yanmış bitki torpaqdan təmizləndi.');
        }
    }
}, 60000);

updateUI();
