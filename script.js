const farmElement = document.getElementById('farm');
let coins = 0;
let stock = 0;
let eggs = 0;
let chickens = 0;
let farm = [];

const images = {
    seed: 'https://i.imgur.com/HB7YbcZ.png',        // toxum şəkli (sade kiçik göy nöqtə)
    watered: 'https://i.imgur.com/5o1HoQj.png',    // suvarılmış bitki (yaşıl sap)
    grown: 'https://i.imgur.com/X3B1rzP.png',      // yetişmiş bitki (yaşıl baş)
    chicken: 'https://i.imgur.com/oNf0G6m.png',    // toyuq ikonu
    egg: 'https://i.imgur.com/UPYHvOu.png'         // yumurta ikonu
};

// Ferma yerlərini yaratırıq
for(let i=0; i<10; i++) {
    farm.push({stage:'empty', timer:0});
    const plot = document.createElement('div');
    plot.className = 'plot';
    farmElement.appendChild(plot);
}

// UI yeniləmə funksiyası
function updateUI(){
    document.getElementById('coins').innerText = coins;
    document.getElementById('stock').innerText = stock;
    document.getElementById('eggs').innerText = eggs;

    const plots = document.querySelectorAll('.plot');
    plots.forEach((plot,i) => {
        plot.innerHTML = '';
        let state = farm[i].stage;

        if(state === 'empty') return;

        const img = document.createElement('img');
        img.className = 'plant-img';

        if(state === 'planted'){
            img.src = images.seed;
            plot.appendChild(img);
        }
        else if(state === 'watered'){
            img.src = images.watered;
            plot.appendChild(img);
            // əlavə su damcı animasiyası
            const droplets = document.createElement('div');
            droplets.className = 'droplets';
            for(let j=0; j<3; j++){
                const drop = document.createElement('div');
                drop.className = 'droplet';
                drop.style.left = `${j*15}px`;
                drop.style.animationDelay = `${j*0.4}s`;
                droplets.appendChild(drop);
            }
            plot.appendChild(droplets);
        }
        else if(state === 'grown'){
            img.src = images.grown;
            plot.appendChild(img);
        }
    });
}

// Əkmə funksiyası
function plantCrop(){
    let plot = farm.find(p=>p.stage==='empty');
    if(plot){
        plot.stage = 'planted';
        plot.timer = Date.now();
    }
    updateUI();
}

// Suvarma funksiyası (1 dəqiqə sonra suvarılabilir)
function waterCrops(){
    farm.forEach(p=>{
        if(p.stage==='planted' && (Date.now() - p.timer >= 60000)){
            p.stage = 'watered';
            p.timer = Date.now();
        }
    });
    updateUI();
}

// Yığım funksiyası (suvarıldıqdan 2 dəqiqə sonra məhsul yetişir)
function harvestCrops(){
    farm.forEach(p=>{
        if(p.stage==='watered' && (Date.now() - p.timer >= 120000)){
            p.stage = 'grown';
            p.timer = Date.now();
        }
    });
    updateUI();
}

// Məhsul satışı (yetişmiş məhsulu məhsula əlavə edir və tarladan silir)
function sellCrops(){
    let harvestedCount = farm.filter(p => p.stage === 'grown').length;
    coins += harvestedCount;
    stock += harvestedCount;
    // Silir
    farm.forEach(p => { if(p.stage === 'grown') p.stage = 'empty'; });
    updateUI();
}

// Toyuq alma funksiyası
function buyChicken(){
    if(coins >= 100000){
        coins -= 100000;
        chickens++;
    }
    updateUI();
}

// Yumurta satma
function sellEggs(){
    coins += eggs * 5;
    eggs = 0;
    updateUI();
}

// Toyuqlar hər dəqiqə yumurta qoyur
setInterval(() => {
    eggs += chickens;
    updateUI();
}, 60000);

// Bitkilərin mərhələlərinə görə avtomatik suvarma -> yetişmə
setInterval(() => {
    farm.forEach(p => {
        if(p.stage === 'watered' && Date.now() - p.timer >= 120000){
            p.stage = 'grown';
        }
    });
    updateUI();
}, 5000);

updateUI();
