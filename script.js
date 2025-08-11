let coins = 0;
let stock = 0;
let eggs = 0;
let farm = [];
let chickens = 0;
const farmElement = document.getElementById('farm');

// Ferma yerləri yarat
for (let i = 0; i < 10; i++) {
    farm.push({ stage: 'empty', timer: 0 });
    const plot = document.createElement('div');
    plot.className = 'plot';
    farmElement.appendChild(plot);
}

function updateUI() {
    document.getElementById('coins').innerText = `💰 Pul: ${coins}`;
    document.getElementById('stock').innerText = `🌱 Məhsul: ${stock}`;
    document.getElementById('eggs').innerText = `🥚 Yumurta: ${eggs}`;
    const plots = document.querySelectorAll('.plot');
    plots.forEach((plot, i) => {
        plot.innerHTML = '';
        if (farm[i].stage === 'planted') {
            let plant = document.createElement('div');
            plant.className = 'plant planted';
            plant.style.height = '40%';
            plot.appendChild(plant);
        } else if (farm[i].stage === 'watered') {
            let plant = document.createElement('div');
            plant.className = 'plant watered';
            plant.style.height = '80%';
            plot.appendChild(plant);
        }
    });
}

function plantCrop() {
    let plot = farm.find(p => p.stage === 'empty');
    if (plot) {
        plot.stage = 'planted';
        plot.timer = Date.now();
        updateUI();
    }
}

function waterCrops() {
    farm.forEach(p => {
        if (p.stage === 'planted' && Date.now() - p.timer >= 60000) {
            p.stage = 'watered';
            p.timer = Date.now();
        }
    });
    updateUI();
}

function harvestCrops() {
    farm.forEach(p => {
        if (p.stage === 'watered' && Date.now() - p.timer >= 120000) {
            p.stage = 'empty';
            stock++;
        }
    });
    updateUI();
}

function sellCrops() {
    coins += stock;
    stock = 0;
    updateUI();
}

function buyChicken() {
    if (coins >= 100000) {
        coins -= 100000;
        chickens++;
    }
    updateUI();
}

function sellEggs() {
    coins += eggs * 5;
    eggs = 0;
    updateUI();
}

// Toyuqlar hər dəqiqədə yumurta verir
setInterval(() => {
    eggs += chickens;
    updateUI();
}, 60000);

updateUI();
