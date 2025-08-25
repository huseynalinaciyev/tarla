// User adı
const urlParams = new URLSearchParams(window.location.search);
const telegramUser = urlParams.get('user') || 'Qonaq';
document.getElementById('welcome').innerText = `Xoş gəlmisiniz, @${telegramUser}!`;

// Bitki şəkilləri
const plantImages = {
    wheat: ['🌱','🌿','🌾'],
    tomato: ['🍅','🍅','🍅'],
    corn: ['🌽','🌽','🌽']
};

const COIN_PER_PRODUCT = 1;
const EGG_SELL_PRICE = 5;
const MILK_SELL_PRICE = 7;

let data = {
    coins: 500,
    stock: 0,
    eggs: 0,
    milk: 0,
    chickens: 0,
    cows: 0,
    farmPlot: {
        plantType: null,
        plantStage: 'empty',
        plantedAt: 0,
        lastWateredAt: 0,
        harvestReady: false
    },
    lastDailyBonus: 0
};

const storageKey = `farmGame_${telegramUser}`;

function loadData() {
    const saved = localStorage.getItem(storageKey);
    if (saved) data = JSON.parse(saved);
}

function saveData() {
    localStorage.setItem(storageKey, JSON.stringify(data));
}

// UI elementləri
const coinsEl = document.getElementById('coins');
const stockEl = document.getElementById('stock');
const eggsEl = document.getElementById('eggs');
const milkEl = document.getElementById('milk');
const chickensEl = document.getElementById('chickens');
const cowsEl = document.getElementById('cows');
const plantAreaEl = document.getElementById('plant-area');
const plotTypeEl = document.getElementById('plant-type-text');
const plotInfoStage = document.getElementById('plant-stage-text');
const wateringTimerEl = document.getElementById('watering-timer');
const harvestTimerEl = document.getElementById('harvest-timer');
const plotInfoHarvest = document.getElementById('harvest-ready');
const wateringEl = document.getElementById('watering-animation');

// Suvarma animasiyası
function showWateringAnimation() {
    wateringEl.innerHTML = '';
    wateringEl.classList.remove('hidden');
    for(let i=0;i<3;i++){
        const drop = document.createElement('div');
        drop.className='droplet';
        drop.style.left = `${i*15}px`;
        drop.style.animationDelay = `${i*0.4}s`;
        wateringEl.appendChild(drop);
    }
    setTimeout(()=>{wateringEl.classList.add('hidden'); wateringEl.innerHTML='';},3000);
}

// Format zamanı
function formatTime(ms){
    if(ms<=0) return '00:00';
    const totalSeconds=Math.floor(ms/1000);
    const minutes=Math.floor(totalSeconds/60).toString().padStart(2,'0');
    const seconds=(totalSeconds%60).toString().padStart(2,'0');
    return `${minutes}:${seconds}`;
}

// UI yenilənməsi
function updatePlotUI(){
    const now=Date.now();
    const plot = data.farmPlot;
    plotTypeEl.innerText = plot.plantType || '—';
    plotInfoStage.innerText = plot.plantStage;

    if(plot.plantStage==='empty'){ 
        plantAreaEl.innerText='🌿';
        wateringTimerEl.innerText='—';
        harvestTimerEl.innerText='—';
        plotInfoHarvest.innerText='Xeyr';
    } else if(plot.plantStage==='seed'){
        plantAreaEl.innerText = plantImages[plot.plantType][0];
        wateringTimerEl.innerText = 'Suvarmaq lazımdır';
        harvestTimerEl.innerText = '—';
        plotInfoHarvest.innerText='Xeyr';
    } else if(plot.plantStage==='growing'){
        plantAreaEl.innerText = plantImages[plot.plantType][1];
        wateringTimerEl.innerText = 'Son suvarma: '+formatTime(now-plot.lastWateredAt);
        harvestTimerEl.innerText = 'Yetişmə vaxtı qalıb';
        plotInfoHarvest.innerText='Xeyr';
    } else if(plot.plantStage==='mature'){
        plantAreaEl.innerText = plantImages[plot.plantType][2];
        wateringTimerEl.innerText='—';
        harvestTimerEl.innerText='Hazırdır!';
        plotInfoHarvest.innerText='Bəli';
    } else if(plot.plantStage==='burning'){
        plantAreaEl.innerText='🔥';
        wateringTimerEl.innerText='—';
        harvestTimerEl.innerText='—';
        plotInfoHarvest.innerText='Xeyr';
    }
}

function updateUI(){
    coinsEl.innerText=data.coins;
    stockEl.innerText=data.stock;
    eggsEl.innerText=data.eggs;
    milkEl.innerText=data.milk;
    chickensEl.innerText=data.chickens;
    cowsEl.innerText=data.cows;
    updatePlotUI();
    saveData();
}

// Bitki ək
function plantCrop(){
    if(data.farmPlot.plantStage!=='empty' && data.farmPlot.plantStage!=='burning'){
        alert('Əvvəlki bitkinizi yığın və ya yandırın!');
        return;
    }
    const types=['wheat','tomato','corn'];
    const type = types[Math.floor(Math.random()*types.length)];
    data.farmPlot.plantType=type;
    data.farmPlot.plantStage='seed';
    data.farmPlot.plantedAt=Date.now();
    data.farmPlot.lastWateredAt=0;
    data.farmPlot.harvestReady=false;
    updateUI();
    alert(`${type.toUpperCase()} əkildi! Suvarmaq lazımdır.`);
}

// Suvar
function waterCrop(){
    const plot=data.farmPlot;
    if(plot.plantStage==='empty' || plot.plantStage==='burning'){
        alert('Əvvəlcə bitki əkilməlidir.');
        return;
    }
    const now=Date.now();
    if(plot.lastWateredAt && now-plot.lastWateredAt<60000){
        alert('Suvarma 1 dəqiqədə 1 dəfə mümkündür.');
        return;
    }
    plot.lastWateredAt=now;
    if(plot.plantStage==='seed') plot.plantStage='growing';
    showWateringAnimation();
    updateUI();
    alert('Bitki suvarıldı!');
}

// Məhsul yığ
function harvestCrop(){
    const plot=data.farmPlot;
    if(plot.plantStage!=='mature' || !plot.harvestReady){
        alert('Məhsul hələ yığılmağa hazır deyil.');
        return;
    }
    data.stock++;
    plot.plantStage='empty';
    plot.harvestReady=false;
    plot.plantedAt=0;
    plot.lastWateredAt=0;
    updateUI();
    alert('Məhsul yığdınız!');
}

// Məhsul sat
function sellProduct(){ 
    if(data.stock<=0){ alert('Satacaq məhsulunuz yoxdur'); return;}
    data.coins += data.stock*COIN_PER_PRODUCT;
    data.stock=0;
    updateUI();
    alert('Məhsullar satıldı!');
}

// Heyvan al
function buyChicken(){ if(data.coins<1000){alert('Pulunuz çatmır');return;} data.coins-=1000; data.chickens++; updateUI(); alert('Toyuq alındı!');}
function buyCow(){ if(data.coins<2000){alert('Pulunuz çatmır');return;} data.coins-=2000; data.cows++; updateUI(); alert('İnək alındı!');}

// Heyvan məhsulu sat
function sellEggs(){if(data.eggs<=0){alert('Satacaq yumurta yoxdur'); return;} data.coins+=data.eggs*EGG_SELL_PRICE; data.eggs=0; updateUI(); alert('Yumurtalar satıldı!');}
function sellMilk(){if(data.milk<=0){alert('Satacaq süd yoxdur'); return;} data.coins+=data.milk*MILK_SELL_PRICE; data.milk=0; updateUI(); alert('Süd satıldı!');}

// Günlük bonus
function dailyBonus(){
    const now=Date.now();
    if(now - data.lastDailyBonus<86400000){alert('Günlük bonus artıq alınıb!'); return;}
    const bonus=Math.floor(Math.random()*500)+500;
    data.coins+=bonus;
    data.lastDailyBonus=now;
    updateUI();
    alert(`Günlük bonus: ${bonus} coin!`);
}

// Avtomatik əməliyyat
setInterval(()=>{
    const now=Date.now();
    const plot=data.farmPlot;

    if(plot.plantStage==='seed' && plot.plantedAt && now-plot.plantedAt>60000){ // 1 dəqiqə
        plot.plantStage='burning';
        updateUI();
        alert('Bitki suvarılmadığı üçün yandı!');
    }

    if(plot.plantStage==='growing' && plot.lastWateredAt && now-plot.lastWateredAt>120000){ // 2 dəqiqə
        plot.plantStage='mature';
        plot.harvestReady=true;
        updateUI();
        alert('Bitki yetişdi! Məhsulu yığa bilərsiniz.');
    }

    if(plot.plantStage==='burning' && plot.plantedAt && now-plot.plantedAt>180000){
        plot.plantStage='empty';
        plot.plantedAt=0;
        plot.lastWateredAt=0;
        plot.harvestReady=false;
        updateUI();
        alert('Yanmış bitki torpaqdan təmizləndi.');
    }

    if(data.chickens>0) data.eggs+=data.chickens;
    if(data.cows>0) data.milk+=data.cows;

    updateUI();
},60000);

setInterval(()=>{ updatePlotUI();},1000);

window.addEventListener('load',()=>{loadData();updateUI();});
