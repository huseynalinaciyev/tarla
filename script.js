// --- İstifadəçi adı URL-dən oxunur ---
const urlParams = new URLSearchParams(window.location.search);
const telegramUser = urlParams.get('user') || 'Qonaq';
document.getElementById('welcome').innerText = `Xoş gəlmisiniz, @${telegramUser}!`;

// --- Stabil Telegram ID ---
function getStableUserId(user){
    const key = `stable_id_${user}`;
    let id = localStorage.getItem(key);
    if(!id){
        id = Math.floor(10000 + Math.random()*90000).toString();
        localStorage.setItem(key, id);
    }
    return id;
}
const userId = getStableUserId(telegramUser);
console.log("Stabil ID:", userId);

// --- Oyun parametrləri ---
const COIN_PER_PRODUCT = 10; // Məhsul satışı
const PLANT_COST = 5;        // Bitki əkilməsi
const EGG_SELL_PRICE = 5;    // Yumurta satışı
const MILK_SELL_PRICE = 7;   // Süd satışı
const DAILY_BONUS_AMOUNT = 10;
const WATER_LIMIT = 15*60*1000;  // 15 dəq
const HARVEST_TIME = 30*60*1000; // 30 dəq
const COIN_TO_MANAT = 0.0001;

// --- Yaddaş ---
let data = {
    coins: 20,
    stock: 0,
    eggs: 0,
    milk: 0,
    chickens: 0,
    cows: 0,
    dailyBonusClaimed: false,
    farmPlot: { plantStage: 'empty', plantedAt: 0, lastWateredAt: 0, harvestReady: false }
};
const storageKey = `farmGame_${telegramUser}`;

function loadData(){
    const saved = localStorage.getItem(storageKey);
    if(saved){
        try{ data = JSON.parse(saved); }catch{}
    }
}
function saveData(){ localStorage.setItem(storageKey, JSON.stringify(data)); }

// --- Online sayı ---
function updateOnlineCount(){
    fetch('online.php')
        .then(res => res.text())
        .then(count => {
            document.getElementById('online-count').innerText = count;
        });
}
setInterval(updateOnlineCount, 10000);
updateOnlineCount();

// --- Bitki mərhələləri ---
const plantStages = { empty:'🌿', seed:'🌱', growing:'🌾', mature:'🍀', burning:'🔥' };
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

// --- UI yeniləmə funksiyaları ---
function formatTime(ms){ 
    if(ms <= 0) return '00:00'; 
    const totalSeconds = Math.floor(ms/1000);
    const minutes = Math.floor(totalSeconds/60).toString().padStart(2,'0');
    const seconds = (totalSeconds%60).toString().padStart(2,'0');
    return `${minutes}:${seconds}`;
}

function updatePlotUI(){
    const now = Date.now();
    const plot = data.farmPlot;
    plantAreaEl.innerText = plantStages[plot.plantStage];
    plotInfoStage.innerText = plot.plantStage.charAt(0).toUpperCase() + plot.plantStage.slice(1);

    if(plot.plantStage === 'seed'){
        const waterLeft = plot.plantedAt + WATER_LIMIT - now;
        wateringTimerEl.innerText = waterLeft > 0 ? formatTime(waterLeft) : 'Suvarma vaxtı çatıb!';
        harvestTimerEl.innerText = '—';
        plotInfoHarvest.innerText = 'Xeyr';
    } else if(plot.plantStage === 'growing'){
        const harvestLeft = plot.lastWateredAt + HARVEST_TIME - now;
        harvestTimerEl.innerText = harvestLeft > 0 ? formatTime(harvestLeft) : 'Hazırdır!';
        wateringTimerEl.innerText = 'Son suvarma qeydi mövcuddur';
        plotInfoHarvest.innerText = harvestLeft > 0 ? 'Xeyr' : 'Bəli';
    } else {
        wateringTimerEl.innerText = '—';
        harvestTimerEl.innerText = '—';
        plotInfoHarvest.innerText = 'Xeyr';
    }
}

function updateUI(){
    coinsEl.innerText = data.coins;
    stockEl.innerText = data.stock;
    eggsEl.innerText = data.eggs;
    milkEl.innerText = data.milk;
    chickensEl.innerText = data.chickens;
    cowsEl.innerText = data.cows;
    updatePlotUI();
    saveData();
}

// --- Bitki əməliyyatları ---
function plantCrop(){
    if(data.coins < PLANT_COST){ alert('Kifayət qədər coin yoxdur!'); return; }
    const plot = data.farmPlot;
    if(plot.plantStage !== 'empty' && plot.plantStage !== 'burning'){ alert('Əvvəlki bitkinizi yığın və ya yandırın!'); return; }
    data.coins -= PLANT_COST;
    plot.plantStage = 'seed'; 
    plot.plantedAt = Date.now(); 
    plot.lastWateredAt = 0; 
    plot.harvestReady = false;
    updateUI(); 
    alert(`Bitki əkildi! ${PLANT_COST} coin xərcləndi. 15 dəq ərzində suvarın.`);
}

function waterCrop(){
    const plot = data.farmPlot;
    if(plot.plantStage === 'empty' || plot.plantStage === 'burning'){ alert('Əvvəlcə bitki əkilməlidir.'); return; }
    plot.lastWateredAt = Date.now();
    if(plot.plantStage === 'seed') plot.plantStage = 'growing';
    updateUI(); 
    alert('Bitki suvarıldı! 30 dəq sonra məhsul yığa bilərsiniz.');
}

function harvestCrop(){
    const plot = data.farmPlot;
    if(plot.plantStage !== 'mature' || !plot.harvestReady){ alert('Məhsul hələ yığılmağa hazır deyil.'); return; }
    data.stock++;
    plot.plantStage = 'empty'; 
    plot.harvestReady = false; 
    plot.plantedAt = 0; 
    plot.lastWateredAt = 0;
    updateUI(); 
    alert(`Məhsul yığdınız! ${COIN_PER_PRODUCT} coin qazandınız.`);
}

// --- Coin əməliyyatları ---
function dailyBonus(){
    if(data.dailyBonusClaimed){ alert('Günlük bonus artıq alınıb.'); return; }
    data.coins += DAILY_BONUS_AMOUNT;
    data.dailyBonusClaimed = true;
    updateUI();
    alert(`Günlük bonus alındı! ${DAILY_BONUS_AMOUNT} coin qazandınız.`);
}

function sellProduct(){
    if(data.stock <= 0){ alert('Satacaq məhsul yoxdur.'); return; }
    data.coins += data.stock * COIN_PER_PRODUCT;
    data.stock = 0;
    updateUI();
    alert(`Məhsullar satıldı! Hər biri ${COIN_PER_PRODUCT} coin qazandırdı.`);
}

function buyChicken(){
    if(data.coins < 1000){ alert('Kifayət qədər coin yoxdur!'); return; }
    data.coins -= 1000;
    data.chickens++;
    updateUI();
    alert('Toyuq alındı!');
}

function buyCow(){
    if(data.coins < 2000){ alert('Kifayət qədər coin yoxdur!'); return; }
    data.coins -= 2000;
    data.cows++;
    updateUI();
    alert('İnək alındı!');
}

function sellEggs(){
    if(data.eggs <= 0){ alert('Satacaq yumurta yoxdur.'); return; }
    data.coins += data.eggs * EGG_SELL_PRICE;
    data.eggs = 0;
    updateUI();
    alert('Yumurtalar satıldı!');
}

function sellMilk(){
    if(data.milk <= 0){ alert('Satacaq süd yoxdur.'); return; }
    data.coins += data.milk * MILK_SELL_PRICE;
    data.milk = 0;
    updateUI();
    alert('Süd satıldı!');
}

// --- Coin çıxarma ---
function requestWithdrawal(){
    const amount = parseInt(document.getElementById('withdraw-amount').value);
    if(!amount || amount < 1){ withdrawInfoEl.innerText = 'Zəhmət olmasa düzgün coin daxil edin.'; return; }
    if(amount > data.coins){ withdrawInfoEl.innerText = 'Kifayət qədər coin yoxdur.'; return; }
    data.coins -= amount;
    updateUI();
    const manat = amount * COIN_TO_MANAT;
    withdrawInfoEl.innerText = `Müraciət qeydə alındı! ${amount} coin = ${manat.toFixed(4)} ₼`;
}

// --- Avtomatik əməliyyatlar ---
setInterval(() => {
    const now = Date.now();
    const plot = data.farmPlot;

    if(plot.plantStage === 'seed' && now - plot.plantedAt > WATER_LIMIT){
        plot.plantStage = 'burning'; 
        updateUI(); 
        alert('Bitki suvarılmadığı üçün yandı!');
    }

    if(plot.plantStage === 'growing' && now - plot.lastWateredAt > HARVEST_TIME){
        plot.plantStage = 'mature'; 
        plot.harvestReady = true; 
        updateUI(); 
        alert('Bitki yetişdi! Məhsulu yığa bilərsiniz.');
    }

    if(plot.plantStage === 'burning' && now - plot.plantedAt > HARVEST_TIME){
        plot.plantStage = 'empty'; 
        plot.plantedAt = 0; 
        plot.lastWateredAt = 0; 
        plot.harvestReady = false; 
        updateUI(); 
        alert('Yanmış bitki torpaqdan təmizləndi.');
    }

    if(data.chickens > 0) data.eggs += data.chickens;
    if(data.cows > 0) data.milk += data.cows;
    updateUI();

}, 60000);

// --- Səhifə yüklənəndə ---
window.addEventListener('load', () => { loadData(); updateUI(); });
