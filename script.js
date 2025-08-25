// URL-dən Telegram ID və username oxu
const urlParams = new URLSearchParams(window.location.search);
const telegramId = urlParams.get('id') || Math.floor(Math.random()*1000000);
const telegramUserName = urlParams.get('user') || 'Bağban';

// Unikal bağban adı
const telegramUser = `Bağban #${telegramId}`;

document.getElementById('welcome').innerText = `Xoş gəlmisiniz, ${telegramUser}!`;

// Bitki mərhələləri
const plantStages = {
    empty: '🌿',
    seed: '🌱',
    growing: '🌾',
    mature: '🍀',
    burning: '🔥'
};

// Oyun parametrləri
const COIN_PER_PRODUCT = 1;
const EGG_SELL_PRICE = 5;
const MILK_SELL_PRICE = 7;
const PLANT_COST = 5;
const DAILY_BONUS_AMOUNT = 10;
const WATER_LIMIT = 15*60*1000;
const HARVEST_TIME = 30*60*1000;
const COIN_TO_MANAT = 0.0001;

// Online oyunçu sayı (simulyasiya, əslində server ilə olacaq)
let onlinePlayers = Math.floor(Math.random()*20) + 1;
const onlineEl = document.createElement('p');
onlineEl.innerText = `Online oyunçular: ${onlinePlayers}`;
onlineEl.style.fontWeight = 'bold';
document.body.insertBefore(onlineEl, document.body.firstChild);

let data = {
    coins: 20,
    stock: 0,
    eggs: 0,
    milk: 0,
    chickens: 0,
    cows: 0,
    dailyBonusClaimed: false,
    farmPlot: {
        plantStage: 'empty',
        plantedAt: 0,
        lastWateredAt: 0,
        harvestReady: false
    }
};

// Fərdi storage key
const storageKey = `farmGame_${telegramId}`;

// Yaddaş
function loadData() {
    const saved = localStorage.getItem(storageKey);
    if(saved) {
        try { data = JSON.parse(saved); } catch {}
    }
}
function saveData() { localStorage.setItem(storageKey, JSON.stringify(data)); }

// HTML elementləri
const coinsEl = document.getElementById('coins');
const stockEl = document.getElementById('stock');
const eggsEl = document.getElementById('eggs');
const milkEl = document.getElementById('milk');
const chickensEl = document.getElementById('chickens');
const cowsEl = document.getElementById('cows');
const plantAreaEl = document.getElementById('plant-area');
const plotInfoStage = document.getElementById('plant-stage-text');
const wateringTimerEl = document.getElementById('watering-timer');
const harvestTimerEl = document.getElementById('harvest-timer');
const plotInfoHarvest = document.getElementById('harvest-ready');
const withdrawInfoEl = document.getElementById('withdraw-info');
const wateringEl = document.getElementById('watering-animation');

// Suvarma animasiyası
function showWateringAnimation(){
    wateringEl.innerHTML = '';
    wateringEl.classList.remove('hidden');
    for(let i=0;i<3;i++){
        const drop = document.createElement('div');
        drop.className='droplet';
        drop.style.left=`${i*15}px`;
        drop.style.animationDelay=`${i*0.4}s`;
        wateringEl.appendChild(drop);
    }
    setTimeout(()=>{ wateringEl.classList.add('hidden'); wateringEl.innerHTML=''; },3000);
}

// Zaman formatı
function formatTime(ms){
    if(ms<=0) return '00:00';
    const totalSeconds=Math.floor(ms/1000);
    const minutes=Math.floor(totalSeconds/60).toString().padStart(2,'0');
    const seconds=(totalSeconds%60).toString().padStart(2,'0');
    return `${minutes}:${seconds}`;
}

// UI yeniləmə
function updatePlotUI(){
    const now=Date.now();
    const plot=data.farmPlot;
    plantAreaEl.innerText=plantStages[plot.plantStage];
    plotInfoStage.innerText=plot.plantStage.charAt(0).toUpperCase()+plot.plantStage.slice(1);

    if(plot.plantStage==='seed'){
        const waterLeft = plot.plantedAt+WATER_LIMIT - now;
        wateringTimerEl.innerText = waterLeft>0?formatTime(waterLeft):'Suvarma vaxtı çatıb!';
        harvestTimerEl.innerText='—';
        plotInfoHarvest.innerText='Xeyr';
    }else if(plot.plantStage==='growing'){
        const harvestLeft = plot.lastWateredAt+HARVEST_TIME - now;
        harvestTimerEl.innerText = harvestLeft>0?formatTime(harvestLeft):'Hazırdır!';
        wateringTimerEl.innerText='Son suvarma qeydi mövcuddur';
        plotInfoHarvest.innerText=harvestLeft>0?'Xeyr':'Bəli';
    }else{
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

// Coin çıxarma
function requestWithdrawal(){
    const amount = parseInt(document.getElementById('withdraw-amount').value);
    if(!amount || amount<1){ withdrawInfoEl.innerText='Zəhmət olmasa düzgün coin daxil edin.'; return; }
    if(amount>data.coins){ withdrawInfoEl.innerText='Kifayət qədər coin yoxdur.'; return; }
    data.coins-=amount;
    updateUI();
    const manat = amount*COIN_TO_MANAT;
    withdrawInfoEl.innerText=`Müraciət qeydə alındı! ${amount} coin = ${manat.toFixed(4)}₼`;
}

// Buradan sonra bütün əvvəlki bitki, heyvan, bonus və avtomatik interval funksiyaları eynilə qalır...
