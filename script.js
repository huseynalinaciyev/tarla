// URL-dən user adı oxu
const urlParams = new URLSearchParams(window.location.search);
const telegramUser = urlParams.get('user') || 'Qonaq';
document.getElementById('welcome').innerText = `Xoş gəlmisiniz, @${telegramUser}!`;

const COIN_PER_PRODUCT = 1;
const EGG_SELL_PRICE = 5;
const MILK_SELL_PRICE = 7;
const storageKey = `farmGame_${telegramUser}`;

const plantStages = { empty:'🌿', seed:'🌱', growing:'🌿', mature:'🍀', burning:'🔥', rare:'🌸' };
const plotEls = document.querySelectorAll('.farm-plot');
const coinsEl = document.getElementById('coins');
const stockEl = document.getElementById('stock');
const eggsEl = document.getElementById('eggs');
const milkEl = document.getElementById('milk');
const chickensEl = document.getElementById('chickens');
const cowsEl = document.getElementById('cows');
const plotStageText = document.getElementById('plant-stage-text');
const wateringTimerEl = document.getElementById('watering-timer');
const harvestTimerEl = document.getElementById('harvest-timer');
const plotInfoHarvest = document.getElementById('harvest-ready');
const eventPopup = document.getElementById('event-popup');

let data = {
    coins:0, stock:0, eggs:0, milk:0, chickens:0, cows:0,
    farmPlots:[
        {stage:'empty', plantedAt:0, lastWateredAt:0, harvestReady:false},
        {stage:'empty', plantedAt:0, lastWateredAt:0, harvestReady:false},
        {stage:'empty', plantedAt:0, lastWateredAt:0, harvestReady:false},
        {stage:'empty', plantedAt:0, lastWateredAt:0, harvestReady:false}
    ],
    lastDailyBonus:0
};

function saveData(){ localStorage.setItem(storageKey,JSON.stringify(data)); }
function loadData(){ const saved=localStorage.getItem(storageKey); if(saved) data=JSON.parse(saved); }

function showEvent(text){ eventPopup.innerText=text; eventPopup.classList.remove('hidden'); setTimeout(()=>{eventPopup.classList.add('hidden')},3000); }

function updatePlotsUI(){
    plotEls.forEach((el,i)=>{
        const stage = data.farmPlots[i].stage;
        el.innerText = plantStages[stage] || '🌿';
    });
    const firstPlot = data.farmPlots[0];
    plotStageText.innerText = firstPlot.stage.charAt(0).toUpperCase()+firstPlot.stage.slice(1);
    wateringTimerEl.innerText = firstPlot.lastWateredAt ? 'Son suvarma qeydi mövcuddur' : '—';
    harvestTimerEl.innerText = firstPlot.harvestReady ? 'Hazırdır!' : '—';
    plotInfoHarvest.innerText = firstPlot.harvestReady ? 'Bəli' : 'Xeyr';
}

function updateUI(){
    coinsEl.innerText=data.coins;
    stockEl.innerText=data.stock;
    eggsEl.innerText=data.eggs;
    milkEl.innerText=data.milk;
    chickensEl.innerText=data.chickens;
    cowsEl.innerText=data.cows;
    updatePlotsUI();
    saveData();
}

// Gündəlik bonus
function checkDailyBonus(){
    const now=Date.now();
    if(!data.lastDailyBonus || now-data.lastDailyBonus>86400000){
        const bonus = 500 + Math.floor(Math.random()*500);
        data.coins+=bonus; data.lastDailyBonus=now;
        showEvent(`🎁 Gündəlik bonus: ${bonus} coin qazandınız!`);
    }
}

// Random event
function randomEvent(){
    const chance = Math.random();
    if(chance<0.05){
        const plotIndex=Math.floor(Math.random()*4);
        const plot=data.farmPlots[plotIndex];
        if(plot.stage!=='empty'&&plot.stage!=='burning'){
            plot.stage='burning';
            showEvent(`🌪️ Random event: Bitki torpaqdan yandı!`);
        }
    }
}

// Nadir bitki
function spawnRarePlant(){
    const chance=Math.random();
    if(chance<0.03){
        const plotIndex=Math.floor(Math.random()*4);
        const plot=data.farmPlots[plotIndex];
        if(plot.stage==='growing'){
            plot.stage='rare';
            showEvent('🌸 Nadir bitki torpaqda peyda oldu! Məhsul çox qazandıracaq!');
        }
    }
}

// Əsas əməliyyatlar
function plantCrop(plotIndex){
    const plot=data.farmPlots[plotIndex];
    if(plot.stage!=='empty'&&plot.stage!=='burning'){ alert('Əvvəlki bitkinizi yığın!'); return; }
    plot.stage='seed'; plot.plantedAt=Date.now(); plot.lastWateredAt=0; plot.harvestReady=false;
    updateUI(); showEvent('🌱 Bitki əkildi! 1 saat ərzində suvarın.');
}
function waterCrop(plotIndex){
    const plot=data.farmPlots[plotIndex];
    if(plot.stage==='empty'||plot.stage==='burning'){ alert('Əvvəlcə bitki əkilməlidir'); return; }
    const now=Date.now();
    if(plot.lastWateredAt && now-plot.lastWateredAt<3600000){ alert('1 saatda 1 dəfə suvarma mümkündür'); return; }
    plot.lastWateredAt=now;
    if(plot.stage==='seed') plot.stage='growing';
    updateUI(); showEvent('💧 Bitki suvarıldı!');
}
function harvestCrop(plotIndex){
    const plot=data.farmPlots[plotIndex];
    if(!plot.harvestReady){ alert('Məhsul hazır deyil'); return; }
    const reward = plot.stage==='rare'?10:1;
    data.stock+=reward; plot.stage='empty'; plot.harvestReady=false; plot.plantedAt=0; plot.lastWateredAt=0;
    updateUI(); showEvent(`🍀 Məhsul yığdınız! ${reward} coin əlavə edildi!`);
}

// Event listener
plotEls.forEach((el,i)=>el.addEventListener('click',()=>plantCrop(i)));
document.getElementById('btn-water').addEventListener('click',()=>plotEls.forEach((el,i)=>waterCrop(i)));
document.getElementById('btn-harvest').addEventListener('click',()=>plotEls.forEach((el,i)=>harvestCrop(i)));
document.getElementById('btn-sell').addEventListener('click',()=>{
    if(data.stock<=0){ alert('Satacaq məhsul yoxdur'); return; }
    data.coins+=data.stock*COIN_PER_PRODUCT; data.stock=0; updateUI(); showEvent('🛒 Məhsul satıldı!');
});
document.getElementById('btn-buy-chicken').addEventListener('click',()=>{ if(data.coins<100000){ alert('Pul kifayət deyil!'); return; } data.coins-=100000; data.chickens++; updateUI(); showEvent('🐔 Toyuq alındı!'); });
document.getElementById('btn-buy-cow').addEventListener('click',()=>{ if(data.coins<200000){ alert('Pul kifayət deyil!'); return; } data.coins-=200000; data.cows++; updateUI(); showEvent('🐄 İnək alındı!'); });
document.getElementById('btn-sell-eggs').addEventListener('click',()=>{ if(data.eggs<=0){ alert('Satacaq yumurta yoxdur'); return; } data.coins+=data.eggs*EGG_SELL_PRICE; data.eggs=0; updateUI(); showEvent('🥚 Yumurtalar satıldı!'); });
document.getElementById('btn-sell-milk').addEventListener('click',()=>{ if(data.milk<=0){ alert('Satacaq süd yoxdur'); return; } data.coins+=data.milk*MILK_SELL_PRICE; data.milk=0; updateUI(); showEvent('🥛 Süd satıldı!'); });

// Load
window.addEventListener('load',()=>{
    loadData();
    checkDailyBonus();
    updateUI();
});

// Avtomatik əməliyyatlar hər dəqiqə
setInterval(()=>{
    const now=Date.now();
    data.farmPlots.forEach(plot=>{
        if(plot.stage==='seed' && now-plot.plantedAt>3600000) plot.stage='burning';
        if(plot.stage==='growing' && plot.lastWateredAt && now-plot.lastWateredAt>18000000){ plot.stage='mature'; plot.harvestReady=true; }
        if(plot.stage==='burning' && now-plot.plantedAt>9000000){ plot.stage='empty'; plot.plantedAt=0; plot.lastWateredAt=0; plot.harvestReady=false; }
    });
    if(data.chickens>0) data.eggs+=data.chickens;
    if(data.cows>0) data.milk+=
