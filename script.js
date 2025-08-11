// Bitki şəkilləri (pixel art)
const plantImages = {
    seed: 'https://i.imgur.com/HB7YbcZ.png',
    growing: 'https://i.imgur.com/5o1HoQj.png',
    mature: 'https://i.imgur.com/X3B1rzP.png'
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
    plantStage: 'empty',  // empty, seed, growing, mature, burning
    plantedAt: 0,
    lastWateredAt: 0,
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
const soilEl = document.getElementById('soil');
const plantAreaEl = document.getElementById('plant-area');
const wateringEl = document.getElementById('watering-animation');

// Suvarma animasiyası yaradırıq
function showWateringAnimation(){
    wateringEl.innerHTML = '';
    wateringEl.classList.remove('hidden');
    for(let i=0; i<3; i++){
        const drop = document.createElement('div');
        drop.className = 'droplet';
        drop.style.left = `${i*15}px`;
        drop.style.animationDelay = `${i*0.4}s`;
        wateringEl.appendChild(drop);
    }
    // 3 saniyədən sonra anim gizlənir
    setTimeout(() => {
        wateringEl.classList.add('hidden');
        wateringEl.innerHTML = '';
    }, 3000);
}

// UI yeniləmə funksiyası
function updateUI(){
    coinsEl.innerText = coins;
    stockEl.innerText = stock;
    eggsEl.innerText = eggs;
    milkEl.innerText = milk;
    chickensEl.innerText = chickens;
    cowsEl.innerText = cows;

    // Torpaq rəngi bitki vəziyyətinə görə
    if(farmPlot.plantStage === 'empty'){
        farmPlotEl.className = 'plot-empty';
        plantAreaEl.style.backgroundImage = '';
    } else if(farmPlot.plantStage === 'seed'){
        farmPlotEl.className = 'plot-empty';
        plantAreaEl.style.backgroundImage = `url(${plantImages.seed})`;
    } else if(farmPlot.plantStage === 'growing'){
        farmPlotEl.className = 'plot-empty';
        plantAreaEl.style.backgroundImage = `url(${plantImages.growing})`;
    } else if(farmPlot.plantStage === 'mature'){
        farmPlotEl.className = 'plot-empty';
        plantAreaEl.style.backgroundImage = `url(${plantImages.mature})`;
    } else if(farmPlot.plantStage === 'burning'){
        farmPlotEl.className = 'plot-burning';
        plantAreaEl.style.backgroundImage = '';
    }
}

// Bitki əkmə funksiyası
function plantCrop(){
    if(farmPlot.plantStage !== 'empty' && farmPlot.plantStage !== 'burning'){
        alert('Əvvəlki bitkinizi yığın və ya yandırın!');
        return;
    }
    farmPlot.plantStage = 'seed';
    farmPlot.plantedAt = Date.now();
    farmPlot.lastWateredAt = 0;
    farmPlot.harvestReady = false;
    updateUI();
    alert('Bitki əkildi! 1 saat ərzində suvarın.');
}

// Bitki suvarma funksiyası
function waterCrop(){
    if(farmPlot.plantStage === 'empty' || farmPlot.plantStage === 'burning'){
        alert('Əvvəlcə bitki əkilməlidir.');
        return;
    }

    let now = Date.now();
    if(farmPlot.lastWateredAt && now - farmPlot.lastWateredAt < 3600000){
        alert('Suvarma 1 saatda 1 dəfə mümkündür.');
        return;
    }

    farmPlot.lastWateredAt = now;

    if(farmPlot.plantStage === 'seed'){
        farmPlot.plantStage = 'growing';
    }
    showWateringAnimation();
    updateUI();
    alert('Bitki suvarıldı! 5 saat sonra məhsul yığa bilərsiniz.');
}

// Məhsul yığma funksiyası
function harvestCrop(){
    if(farmPlot.plantStage !== 'mature' || !farmPlot.harvestReady){
        alert('Məhsul hələ yığılmağa hazır deyil.');
        return;
    }
    stock++;
    farmPlot.plantStage = 'empty';
    farmPlot.harvestReady = false;
    farmPlot.plantedAt = 0;
    farmPlot.lastWateredAt = 0;
    updateUI();
    alert('Məhsul yığdınız! 1 coin qazandınız.');
}

// Məhsul satma
function sellProduct(){
    if(stock <= 0){
        alert('Satacaq məhsulunuz yoxdur.');
        return;
    }
    coins += stock * COIN_PER_PRODUCT;
    stock = 0;
    updateUI();
    alert('Məhsullar satıldı!');
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

// Yumurtaları satma
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

// Südü satma
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

// Saatlıq avtomatik əməliyyatlar
setInterval(() => {
    const now = Date.now();

    // 1 saat ərzində suvarılmayıbsa bitki yanır
    if(farmPlot.plantStage === 'seed'){
        if(farmPlot.plantedAt && now - farmPlot.plantedAt > 3600000){
            farmPlot.plantStage = 'burning';
            updateUI();
            alert('Bitki suvarılmadığı üçün yandı!');
        }
    }

    // Suvarılıbsa 5 saat sonra məhsul yetişir
    if(farmPlot.plantStage === 'growing'){
        if(farmPlot.lastWateredAt && now - farmPlot.lastWateredAt > 18000000){
            farmPlot.plantStage = 'mature';
            farmPlot.harvestReady = true;
            updateUI();
            alert('Bitki yetişdi! Məhsulu yığa bilərsiniz.');
        }
    }

    // Yanmış bitki 10 dəqiqədən sonra torpaqdan təmizlənir
    if(farmPlot.plantStage === 'burning'){
        if(farmPlot.plantedAt && now - farmPlot.plantedAt > 4200000){
            farmPlot.plantStage = 'empty';
            farmPlot.plantedAt = 0;
            farmPlot.lastWateredAt = 0;
            farmPlot.harvestReady = false;
            updateUI();
            alert('Yanmış bitki torpaqdan təmizləndi.');
        }
    }

    // Heyvan məhsulları (yumurta, süd) hər dəqiqə
    if(chickens > 0) eggs += chickens;
    if(cows > 0) milk += cows;

    updateUI();
}, 60000);

updateUI();
