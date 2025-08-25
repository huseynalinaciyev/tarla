// URL-dən istifadəçi adı oxu
const urlParams = new URLSearchParams(window.location.search);
const telegramUser = urlParams.get('user') || 'Qonaq';

const welcomeEl = document.getElementById('welcome');
welcomeEl.innerText = `Xoş gəlmisiniz, @${telegramUser}!`;

// Bitki mərhələləri
const plantStages = {
    empty: '🌿',
    seed: '🌱',
    growing: '🌾',
    mature: '🍀',
    burning: '🔥'
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

const storageKey = `farmGame_${telegramUser}`;

// Yaddaş
function loadData() {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
        try { data = JSON.parse(saved); } 
        catch { console.warn("Yaddaşdan məlumat oxunarkən səhv."); }
    }
}
function saveData() { localStorage.setItem(storageKey, JSON.stringify(data)); }

const coinsEl = document.getElementById('coins');
const stockEl = document.getElementById('stock');
const eggsEl = document.getElementById('eggs');
const milkEl = document.getElementById('milk');
const chickensEl = document.getElementById('chickens');
const cowsEl = document.getElementById('cows');
const plantAreaEl = document.getElementById('plant-area');
const farmContainer = document.getElementById('plant-area-container');

const plotInfoStage = document.getElementById('plant-stage-text');
const wateringTimerEl = document.getElementById('watering-timer');
const harvestTimerEl = document.getElementById('harvest-timer');
const plotInfoHarvest = document.getElementById('harvest-ready');
const wateringEl = document.getElementById('watering-animation');

// Suvarma animasiyası
function showWateringAnimation() {
    wateringEl.innerHTML = '';
    wateringEl.classList.remove('hidden');
    for (let i = 0; i < 3; i++) {
        const drop = document.createElement('div');
        drop.className = 'droplet';
        drop.style.left = `${i*15}px`;
        drop.style.animationDelay = `${i*0.4}s`;
        wateringEl.appendChild(drop);
    }
    setTimeout(() => {
        wateringEl.classList.add('hidden');
        wateringEl.innerHTML = '';
    }, 3000);
}

// Zaman formatı
function formatTime(ms) {
    if(ms<=0) return '00:00';
    const totalSeconds = Math.floor(ms/1000);
    const minutes = Math.floor(totalSeconds/60).toString().padStart(2,'0');
    const seconds = (totalSeconds%60).toString().padStart(2,'0');
    return `${minutes}:${seconds}`;
}

// UI yeniləmə
function updatePlotUI() {
    const now = Date.now();
    const plot = data.farmPlot;
    plantAreaEl.innerText = plantStages[plot.plantStage];
    plotInfoStage.innerText = plot.plantStage.charAt(0).toUpperCase() + plot.plantStage.slice(1);

    if(plot.plantStage==='seed') {
        const waterLeft = plot.plantedAt+3600000 - now;
        wateringTimerEl.innerText = waterLeft>0 ? formatTime(waterLeft) : 'Suvarma vaxtı çatıb!';
        harvestTimerEl.innerText = '—';
        plotInfoHarvest.innerText = 'Xeyr';
    } else if(plot.plantStage==='growing') {
        const harvestLeft = plot.lastWateredAt+18000000 - now;
        harvestTimerEl.innerText = harvestLeft>0 ? formatTime(harvestLeft) : 'Hazırdır!';
        wateringTimerEl.innerText = 'Son suvarma qeydi mövcuddur';
        plotInfoHarvest.innerText = harvestLeft>0 ? 'Xeyr' : 'Bəli';
    } else if(plot.plantStage==='burning') {
        wateringTimerEl.innerText = '—';
        harvestTimerEl.innerText = '—';
        plotInfoHarvest.innerText = 'Xeyr';
    } else {
        wateringTimerEl.innerText = '—';
        harvestTimerEl.innerText = '—';
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

// Bitki əməliyyatları
function plantCrop() {
    if(data.farmPlot.plantStage!=='empty' && data.farmPlot.plantStage!=='burning') {
        alert('Əvvəlki bitkinizi yığın və ya yandırın!');
        return;
    }
    data.farmPlot.plantStage='seed';
    data.farmPlot.plantedAt=Date.now();
    data.farmPlot.lastWateredAt=0;
    data.farmPlot.harvestReady=false;
    updateUI();
    alert('Bitki əkildi! 1 saat ərzində suvarın.');
}
function waterCrop() {
    const plot = data.farmPlot;
    if(plot.plantStage==='empty' || plot.plantStage==='burning') { alert('Əvvəlcə bitki əkilməlidir.'); return; }
    const now = Date.now();
    if(plot.lastWateredAt && now - plot.lastWateredAt<3600000){ alert('Suvarma 1 saatda 1 dəfə mümkündür.'); return; }
    plot.lastWateredAt=now;
    if(plot.plantStage==='seed') plot.plantStage='growing';
    showWateringAnimation();
    updateUI();
    alert('Bitki suvarıldı! 5 saat sonra məhsul yığa bilərsiniz.');
}
function harvestCrop() {
    const plot = data.farmPlot;
    if(plot.plantStage!=='mature' || !plot.harvestReady){ alert('Məhsul hələ yığılmağa hazır deyil.'); return; }
    data.stock++;
    plot.plantStage='empty';
    plot.harvestReady=false;
    plot.plantedAt=0;
    plot.lastWateredAt=0;
    updateUI();
    alert('Məhsul yığdınız! 1 coin qazandınız.');
}

// Məhsul satışı
function sellProduct() { if(data.stock<=0){ alert('Satacaq məhsulunuz yoxdur.'); return; } data.coins+=data.stock*COIN_PER_PRODUCT; data.stock=0; updateUI(); alert('Məhsullar satıldı!'); }

// Heyvanlar
function buyChicken(){ if(data.coins<100000){alert('Kifayət qədər pul yoxdur!'); return;} data.coins-=100000; data.chickens++; updateUI(); alert('Toyuq alındı!'); }
function buyCow(){ if(data.coins<200000){alert('Kifayət qədər pul yoxdur!'); return;} data.coins-=200000; data.cows++; updateUI(); alert('İnək alındı!'); }
function sellEggs(){ if(data.eggs<=0){alert('Satacaq yumurta yoxdur.'); return;} data.coins+=data.eggs*EGG_SELL_PRICE; data.eggs=0; updateUI(); alert('Yumurtalar satıldı!'); }
function sellMilk(){ if(data.milk<=0){alert('Satacaq süd yoxdur.'); return;} data.coins+=data.milk*MILK_SELL_PRICE; data.milk=0; updateUI(); alert('Süd satıldı!'); }

// Animasiyalar: yağış, böcək, nadir işıq, bonus
function rainAnimation(){ for(let i=0;i<10;i++){ const drop=document.createElement('div'); drop.className='rain-drop'; drop.style.left=`${Math.random()*100}%`; drop.style.animationDuration=`${0.5+Math.random()}s`; farmContainer.appendChild(drop); setTimeout(()=>{drop.remove();},1500);} }
function bugAnimation(){ const bug=document.createElement('div'); bug.className='bug'; bug.style.left=`${Math.random()*100}%`; farmContainer.appendChild(bug); setTimeout(()=>{bug.remove();},2000);}
function specialPlantGlow(){ const glow=document.createElement('div'); glow.className='plant-glow'; farmContainer.appendChild(glow); setTimeout(()=>{glow.remove();},2000);}
function bonusCoinAnimation(amount){ const bonus=document.createElement('div'); bonus.className='bonus-coin'; bonus.innerText=`+${amount}`; farmContainer.appendChild(bonus); setTimeout(()=>{bonus.remove();},2000);}

// Təsadüfi hadisələr 2 dəqiqədə
setInterval(()=>{
    const plot = data.farmPlot;
    const chance = Math.random();
    if(chance<0.1 && plot.plantStage==='growing'){ plot.lastWateredAt = Date.now(); rainAnimation(); alert('Yağış yağdı! Bitki avtomatik suvarıldı.'); }
    else if(chance>=0.1 && chance<0.15 && plot.plantStage==='growing'){ plot.plantStage='seed'; plot.lastWateredAt = Date.now()-18000000; bugAnimation(); alert('Böcək hücumu! Bitki geri mərhələyə düşdü.'); }
    else if(chance>=0.15 && chance<0.18 && plot.plantStage==='mature'){ data.coins += 10; specialPlantGlow(); alert('Nadir bitki yetişdi! Bonus 10 coin qazandınız.'); }
    else if(chance>=0.18 && chance<0.25){ const bonus=Math.floor(Math.random()*5)+1; data.coins+=bonus; bonusCoinAnimation(bonus); alert(`Təsadüfi bonus! ${bonus} coin qazandınız.`); }
    updateUI();
},120000);

// Avtomatik əməliyyatlar hər dəqiqə
setInterval(()=>{
    const now = Date.now();
    const plot = data.farmPlot;

    if(plot.plantStage==='seed' && now - plot.plantedAt>3600000) { plot.plantStage='burning'; updateUI(); alert('Bitki suvarılmadığı üçün yandı!'); }
    if(plot.plantStage==='growing' && now - plot.lastWateredAt>18000000){ plot.plantStage='mature'; plot.harvestReady=true; updateUI(); alert('Bitki yetişdi! Məhsulu yığa bilərsiniz.'); }
    if(plot.plantStage==='burning' && now - plot.plantedAt>9000000){ plot.plantStage='empty'; plot.plantedAt=0; plot.lastWateredAt=0; plot.harvestReady=false; updateUI(); alert('Yanmış bitki torpaqdan təmizləndi.'); }

    if(data.chickens>0) data.eggs+=data.chickens;
    if(data.cows>0) data.milk+=data.cows;

    updateUI();
},60000);

// UI hər saniyə
setInterval(()=>{ updatePlotUI(); },1000);

// Yükləndikdə
window.addEventListener('load',()=>{ loadData(); updateUI(); });
