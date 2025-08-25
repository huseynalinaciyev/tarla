// URL-dən user adı oxu
const urlParams = new URLSearchParams(window.location.search);
const telegramUser = urlParams.get('user') || 'Qonaq';

document.getElementById('welcome').innerText = `Xoş gəlmisiniz, @${telegramUser}!`;

const COIN_PER_PRODUCT = 1;
const EGG_SELL_PRICE = 5;
const MILK_SELL_PRICE = 7;

let data = {
    coins: 0, stock: 0, eggs: 0, milk: 0, chickens: 0, cows: 0,
    farmPlots: [
        { stage:'empty', plantedAt:0, lastWateredAt:0, harvestReady:false },
        { stage:'empty', plantedAt:0, lastWateredAt:0, harvestReady:false },
        { stage:'empty', plantedAt:0, lastWateredAt:0, harvestReady:false },
        { stage:'empty', plantedAt:0, lastWateredAt:0, harvestReady:false },
    ]
};

const storageKey = `farmGame_${telegramUser}`;

function loadData() {
    const saved = localStorage.getItem(storageKey);
    if (saved) data = JSON.parse(saved);
}

function saveData() { localStorage.setItem(storageKey, JSON.stringify(data)); }

const coinsEl = document.getElementById('coins');
const stockEl = document.getElementById('stock');
const eggsEl = document.getElementById('eggs');
const milkEl = document.getElementById('milk');
const chickensEl = document.getElementById('chickens');
const cowsEl = document.getElementById('cows');
const plotEls = document.querySelectorAll('.farm-plot');
const plotInfoStage = document.getElementById('plant-stage-text');
const wateringTimerEl = document.getElementById('watering-timer');
const harvestTimerEl = document.getElementById('harvest-timer');
const plotInfoHarvest = document.getElementById('harvest-ready');
const wateringEl = document.getElementById('watering-animation');

function showWateringAnimation(el) {
    wateringEl.innerHTML='';
    wateringEl.classList.remove('hidden');
    for(let i=0;i<3;i++){
        const drop = document.createElement('div');
        drop.className='droplet';
        drop.style.left=`${i*15}px`;
        wateringEl.appendChild(drop);
    }
    setTimeout(()=>wateringEl.classList.add('hidden'), 1500);
}

function formatTime(ms) {
    if(ms<=0) return '00:00';
    const s=Math.floor(ms/1000), m=Math.floor(s/60).toString().padStart(2,'0'), sec=(s%60).toString().padStart(2,'0');
    return `${m}:${sec}`;
}

function updatePlotsUI() {
    data.farmPlots.forEach((plot, i)=>{
        const el = plotEls[i];
        if(plot.stage==='empty'){ el.innerText='🌿'; }
        else if(plot.stage==='seed'){ el.innerText='🌱'; }
        else if(plot.stage==='growing'){ el.innerText='🌿'; }
        else if(plot.stage==='mature'){ el.innerText='🍀'; }
        else if(plot.stage==='burning'){ el.innerText='🔥'; }
    });
}

function updateUI() {
    coinsEl.innerText=data.coins;
    stockEl.innerText=data.stock;
    eggsEl.innerText=data.eggs;
    milkEl.innerText=data.milk;
    chickensEl.innerText=data.chickens;
    cowsEl.innerText=data.cows;
    updatePlotsUI();
    saveData();
}

// Əsas əməliyyatlar
function plantCrop(plotIndex){
    const plot = data.farmPlots[plotIndex];
    if(plot.stage!=='empty'&&plot.stage!=='burning'){ alert('Əvvəlki bitkinizi yığın!'); return; }
    plot.stage='seed';
    plot.plantedAt=Date.now(); plot.lastWateredAt=0; plot.harvestReady=false;
    updateUI(); alert('Bitki əkildi! 1 saat ərzində suvarın.');
}

function waterCrop(plotIndex){
    const plot=data.farmPlots[plotIndex];
    if(plot.stage==='empty'||plot.stage==='burning'){ alert('Əvvəlcə bitki əkilməlidir'); return; }
    const now=Date.now();
    if(plot.lastWateredAt && now-plot.lastWateredAt<3600000){ alert('1 saatda 1 dəfə suvarma mümkündür'); return; }
    plot.lastWateredAt=now;
    if(plot.stage==='seed') plot.stage='growing';
    showWateringAnimation();
    updateUI();
    alert('Bitki suvarıldı! 5 saat sonra məhsul yığa bilərsiniz.');
}

// Event listener
plotEls.forEach((el,i)=>{
    el.addEventListener('click',()=>plantCrop(i));
});

document.getElementById('btn-water').addEventListener('click',()=>{
    plotEls.forEach((el,i)=>waterCrop(i));
});

// Coins, heyvan və məhsul düymələri
document.getElementById('btn-sell').addEventListener('click',()=>{
    if(data.stock<=0){ alert('Satacaq məhsul yoxdur'); return; }
    data.coins+=data.stock*COIN_PER_PRODUCT; data.stock=0; updateUI(); alert('Məhsul satıldı!');
});
document.getElementById('btn-buy-chicken').addEventListener('click',()=>{
    if(data.coins<100000){ alert('Pul kifayət deyil!'); return; }
    data.coins-=100000; data.chickens++; updateUI(); alert('Toyuq alındı!');
});
document.getElementById('btn-buy-cow').addEventListener('click',()=>{
    if(data.coins<200000){ alert('Pul kifayət deyil!'); return; }
    data.coins-=200000; data.cows++; updateUI(); alert('İnək alındı!');
});
document.getElementById('btn-sell-eggs').addEventListener('click',()=>{
    if(data.eggs<=0){ alert('Satacaq yumurta yoxdur'); return; }
    data.coins+=data.eggs*EGG_SELL_PRICE; data.eggs=0; updateUI(); alert('Yumurtalar satıldı!');
});
document.getElementById('btn-sell-milk').addEventListener('click',()=>{
    if(data.milk<=0){ alert('Satacaq süd yoxdur'); return; }
    data.coins+=data.milk*MILK_SELL_PRICE; data.milk=0; updateUI(); alert('Süd satıldı!');
});

// Yüklənmə
window.addEventListener('load',()=>{
    loadData(); updateUI();
});

// Avtomatik əməliyyatlar
setInterval(()=>{
    const now=Date.now();
    data.farmPlots.forEach(plot=>{
        if(plot.stage==='seed' && now-plot.plantedAt>3600000) plot.stage='burning';
        if(plot.stage==='growing' && plot.lastWateredAt && now-plot.lastWateredAt>18000000){ plot.stage='mature'; plot.harvestReady=true; }
        if(plot.stage==='burning' && now-plot.plantedAt>9000000){ plot.stage='empty'; plot.plantedAt=0; plot.lastWateredAt=0; plot.harvestReady=false; }
    });
    if(data.chickens>0) data.eggs+=data.chickens;
    if(data.cows>0) data.milk+=data.cows;
    updateUI();
},60000);

