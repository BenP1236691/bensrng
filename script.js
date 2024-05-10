// 定義光環和機率
const auras = {
    '「常見」': 2,
    '「不常見」': 4,
    '「好」': 5,
    '「自然」': 8,
    '「稀有」': 16,
    '「迪維努斯」': 32,
    '「結晶」': 64,
    '「憤怒」': 128,
    '「黃玉」': 150,
    '「冰川」': 256,
    '「風」': 300,
    '「紅寶石」': 350,
    '「翡翠」': 500,
    '「鍍金」': 512,
    '「頭獎」': 777,
    '「藍寶石」': 800,
    '「海藍寶石」': 900,
    '《迪亞波力》': 1004,
    '「珍貴」': 1024,
    '「未定義」': 1111,
    '「磁力」': 2048,
    '「星辰」': 4096,
    '「出血」': 4444,
    '“太陽能”': 5000,
    '「月」': 5000,
    '《星光》': 5000,
    '「衝」': 6900,
    '「亡靈」': 10000,
    '「彗星」': 12000,
    '「憤怒：激烈」': 12800,
    '「永久凍土」': 24500,
    '「暴風雨」': 30000,
    '「水生」': 40000,
    '「臉紅：腦白質切除」': 69000,
    '「鸚鵡螺」': 70000,
    '「異國情調」': 99999,
    '《亡靈：惡魔》': 100000,
    '《迪亞波利：虛空》': 100400,
    '《玉》': 125000,
    '「有界」': 200000,
    '《天界》': 350000,
    '《銀河》': 500000,
    '「農曆：滿月」': 500000,
    '《暮光之城》': 600000,
    '「Kyawthuite」': 850000,
    '「奧秘」': 1000000,
    '《星際天災》': 1000000,
    '「磁性：反極性」': 1024000,
    '《萬有引力》': 2000000,
    '《有界無界》': 2000000,
    '「虛擬」': 2500000,
    '《水手》': 3000000,
    '《波塞冬》': 3800000,
    '《水生：火焰》': 4000000,
    '《哈迪斯》': 6666666,
    '「超級電壓」': 7500000,
    '“故障”': 12210110,
    '《星際天災：變異》': 15000000,
    '《神秘：遺產》': 15000000,
    '「彩色」': 20000000,
    '「奧術：黑暗」': 30000000,
    '《空靈》': 35000000,
    '「異國情調:APEX」': 49999500,
    '“矩陣”': 50000000,
    '「半音：創世紀」': 99999999,
    '《深淵獵人》': 100000000,
    '「彈劾」': 200000000,
    '《大天使》': 250000000
};
let leaderboard = [
    { name: "Alice", aura: "「結晶」", value: 64 },
    { name: "Bob", aura: "「好」", value: 5 },
    { name: "Carol", aura: "「稀有」", value: 16 }
];

function rollAura(playerName) {
    let totalWeight = 0;
    const weightedAuras = [];
    for (const aura in auras) {
        let weight = 1 / auras[aura];
        totalWeight += weight;
        weightedAuras.push({ name: aura, weight: weight, value: auras[aura] });
    }
    let random = Math.random() * totalWeight;
    for (const aura of weightedAuras) {
        if (random < aura.weight) {
            updateLeaderboard(playerName, aura.name, aura.value);
            return { name: aura.name, chance: Math.round(1 / (aura.weight / totalWeight)) };
        }
        random -= aura.weight;
    }
}

function updateLeaderboard(playerName, aura, value) {
    const playerIndex = leaderboard.findIndex(player => player.name === playerName);
    if (playerIndex > -1) {
        if (leaderboard[playerIndex].value < value) {
            leaderboard[playerIndex].aura = aura;
            leaderboard[playerIndex].value = value;
        }
    } else {
        leaderboard.push({ name: playerName, aura, value });
    }
    leaderboard.sort((a, b) => b.value - a.value); // Sort descending by aura value
}


function displayLeaderboard() {
    const leaderboardElement = document.getElementById('leaderboard');
    leaderboardElement.innerHTML = '';
    leaderboard.forEach(player => {
        const playerElement = document.createElement('li');
        playerElement.textContent = `${player.name}: ${player.aura}`;
        leaderboardElement.appendChild(playerElement);
    });
}




// 添加物品到庫存
function addItemToInventory(item, quantity) {
    const inventory = JSON.parse(localStorage.getItem('inventory-zh')) || {};
    if (inventory[item]) {
        inventory[item] += quantity;
    } else {
        inventory[item] = quantity;
    }
    localStorage.setItem('inventory-zh', JSON.stringify(inventory));
}

// 更新顯示結果
// 更新顯示結果
function updateDisplay(result) {
    const resultDisplay = document.getElementById('result-display');
    resultDisplay.textContent = `你擲出了: ${result.name} (1 in ${result.chance} chance)`;
}



// 監聽擲骰按鈕事件
// 監聽擲骰按鈕事件
document.getElementById('roll-button').addEventListener('click', function() {
    const result = rollAura();
    updateDisplay(result);
    addItemToInventory(result.name, 1);
});


// 自動擲骰開關
let autoRollInterval = null;
// 自動擲骰開關
function toggleAutoRoll() {
    if (autoRollInterval) {
        clearInterval(autoRollInterval);
        autoRollInterval = null;
        document.getElementById('auto-roll-button').textContent = '開始自動擲骰';
    } else {
        autoRollInterval = setInterval(() => {
            const result = rollAura();
            updateDisplay(result);
            addItemToInventory(result.name, 1);
        }, 1000);  // 每秒擲骰一次
        document.getElementById('auto-roll-button').textContent = '停止自動擲骰';
    }
}
