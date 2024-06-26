const recipes = {
    "財富藥水 I": { "幸運藥水": 5, "「不常見」": 1, "「稀有」": 5, "「鍍金」": 1 },
    "財富藥水 II": { "財富藥水 I": 1, "幸運藥水": 10, "「不常見」": 5, "「稀有」": 10, "「鍍金」": 2 },
    "財富藥水 III": { "財富藥水 II": 1, "幸運藥水": 15, "「不常見」": 10, "「稀有」": 15, "「鍍金」": 5 },
    "天界藥水 I": { "幸運藥水": 100, "「迪維努斯」": 50, "「鍍金」": 20, "《天界》": 1 },
    "天界藥水 II": { "天界藥水 I": 2, "幸運藥水": 125, "「迪維努斯」": 75, "「鍍金」": 50, "「異國情調」": 1 }
};

let playtimeSeconds = 0;
let playtimeInterval;
let inventory = {};
let craftedItems = {};
let auras = {
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
    '「暴風雨」': 800,
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
    '《水手》': 80000,
    '《波塞冬》': 3800000,
    '《水生：火焰》': 4000000,
    '《哈迪斯》': 6666666,
    '「超級電壓」': 7500000,
    '“故障”': 12210110,
    '《星際天災：變異》': 15000000,
    '《神秘：遺產》': 15000000,
    '「彩色」': 20000000,
    '「奧術：黑暗」': 800000,
    '《空靈》': 35000000,
    '「異國情調:APEX」': 49999500,
    '“矩陣”': 50000000,
    '「半音：創世紀」': 99999999,
    '《深淵獵人》': 100000000,
    '「彈劾」': 200000000,
    '《大天使》': 250000000
}; // Load auras from the data

let leaderboard = [
    { name: "Alice", aura: "「結晶」", value: 64 },
    { name: "Bob", aura: "「好」", value: 5 },
    { name: "Carol", aura: "「稀有」", value: 16 }
];

let luck = 0; // Initialize luck

document.addEventListener('DOMContentLoaded', function() {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        alert('請登入以訪問您的庫存。');
        window.location.href = 'login.html';
        return;
    }

    fetch(`http://108.160.142.73:80/load-inventory?email=${userEmail}`)
        .then(response => response.json())
        .then(data => {
            inventory = data.inventory || {};
            craftedItems = data.craftedItems || {};
            updateInventoryDisplay();
            updateCraftedItemsDisplay();
            updateRecipesDisplay();
            updateAurasDisplay(); // Update the auras display
            startPlaytimeCounter();
            displayLeaderboard(); // Display the leaderboard
        })
        .catch(error => {
            console.error('Error:', error);
            alert('加載庫存失敗。請稍後再試。');
        });

    document.getElementById('roll-button').addEventListener('click', function() {
        const result = rollAura('Player'); // Replace 'Player' with actual player name if available
        updateDisplay(result);
        addItemToInventory(result.name, 1);
    });

    let autoRollInterval = null;
    document.getElementById('auto-roll-button').addEventListener('click', function() {
        if (autoRollInterval) {
            clearInterval(autoRollInterval);
            autoRollInterval = null;
            document.getElementById('auto-roll-button').textContent = '開始自動擲骰';
        } else {
            autoRollInterval = setInterval(() => {
                const result = rollAura('Player'); // Replace 'Player' with actual player name if available
                updateDisplay(result);
                addItemToInventory(result.name, 1);
            }, 1000);  // 每秒擲骰一次
            document.getElementById('auto-roll-button').textContent = '停止自動擲骰';
        }
    });
});

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
    displayLeaderboard();
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

function addItemToInventory(item, quantity) {
    if (inventory[item]) {
        inventory[item] += quantity;
    } else {
        inventory[item] = quantity;
    }
    updateInventoryDisplay();
    saveInventoryToServer();
}

function updateDisplay(result) {
    const resultDisplay = document.getElementById('result-display');
    resultDisplay.textContent = `你擲出了: ${result.name} (1 in ${result.chance} chance)`;
}

function updateInventoryDisplay() {
    const itemsList = document.getElementById('items-list');
    if (itemsList) {
        itemsList.innerHTML = '';
        Object.keys(inventory).forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item}: ${inventory[item]}`;
            // Only add the use button for non-aura items
            if (!auras.hasOwnProperty(item)) {
                const useButton = document.createElement('button');
                useButton.textContent = '使用';
                useButton.onclick = () => useItem(item);
                li.appendChild(useButton);
            }
            itemsList.appendChild(li);
        });
    }
    const luckDisplay = document.getElementById('luck-display');
    if (luckDisplay) {
        luckDisplay.textContent = `目前幸運值: ${luck}`;
    }
}

function updateCraftedItemsDisplay() {
    const craftedItemsList = document.getElementById('crafted-items-list');
    if (craftedItemsList) {
        craftedItemsList.innerHTML = '';
        Object.keys(craftedItems).forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item}: ${craftedItems[item]}`;
            craftedItemsList.appendChild(li);
        });
    }
}

function updateRecipesDisplay() {
    const recipesList = document.getElementById('recipes-list');
    if (recipesList) {
        recipesList.innerHTML = '';
        Object.keys(recipes).forEach(recipeName => {
            const recipe = recipes[recipeName];
            const li = document.createElement('li');
            li.textContent = `${recipeName} - `;
            const details = document.createElement('ul');
            Object.keys(recipe).forEach(ingredient => {
                if (ingredient !== 'luck') {
                    const ingredientLi = document.createElement('li');
                    ingredientLi.textContent = `${ingredient} x${recipe[ingredient]}`;
                    details.appendChild(ingredientLi);
                }
            });
            li.appendChild(details);
            const craftButton = document.createElement('button');
            craftButton.textContent = '製作';
            craftButton.onclick = () => craftItem(recipeName);
            li.appendChild(craftButton);
            recipesList.appendChild(li);
        });
    }
}

function updateAurasDisplay() {
    const aurasList = document.getElementById('auras-list');
    if (aurasList) {
        aurasList.innerHTML = '';
        Object.keys(auras).forEach(aura => {
            const li = document.createElement('li');
            li.textContent = `${aura}: ${auras[aura]}`;
            aurasList.appendChild(li);
        });
    }
}

function craftItem(recipeName) {
    const recipe = recipes[recipeName];
    if (canCraft(recipe)) {
        Object.keys(recipe).forEach(item => {
            if (item !== 'luck') {
                let requiredQuantity = recipe[item];
                // Deduct from inventory first
                if (inventory[item]) {
                    const inventoryDeduction = Math.min(inventory[item], requiredQuantity);
                    inventory[item] -= inventoryDeduction;
                    requiredQuantity -= inventoryDeduction;
                }
                // Deduct any remaining requirement from crafted items
                if (requiredQuantity > 0 && craftedItems[item]) {
                    craftedItems[item] -= requiredQuantity;
                }
            }
        });
        addToCraftedItems(recipeName, 1);
        updateInventoryDisplay();
        updateCraftedItemsDisplay();
        saveInventoryToServer();
        console.log(`${recipeName} crafted successfully.`);
    } else {
        alert("材料不足，無法製作 " + recipeName);
        console.log(`Failed to craft ${recipeName}: insufficient materials.`);
    }
}

function addToCraftedItems(item, quantity) {
    craftedItems[item] = (craftedItems[item] || 0) + quantity;
}

function saveInventoryToServer() {
    const userEmail = localStorage.getItem('userEmail');
    fetch('http://108.160.142.73:80/save-inventory', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: userEmail, inventory, craftedItems, auras, luck })
    })
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}

function canCraft(recipe) {
    return Object.keys(recipe).every(item => {
        if (item !== 'luck') {
            const totalAvailable = (inventory[item] || 0) + (craftedItems[item] || 0);
            if (totalAvailable < recipe[item]) {
                console.log(`Cannot craft because ${item} is insufficient: Available=${totalAvailable}, Required=${recipe[item]}`);
                return false;
            }
        }
        return true;
    });
}

function useItem(item) {
    if (inventory[item] > 0) {
        inventory[item] -= 1;
        switch(item) {
            case '幸運藥水':
                luck += 100; // Increase luck by 100 for example
                break;
            case '財富藥水 I':
                luck += 150; // Increase luck by 150 for example
                break;
            case '財富藥水 II':
                luck += 200; // Increase luck by 200 for example
                break;
            case '財富藥水 III':
                luck += 250; // Increase luck by 250 for example
                break;
            case '天界藥水 I':
                luck += 2000000; // Increase luck by 2000000 for example
                break;
            case '天界藥水 II':
                luck += 20000000; // Increase luck by 20000000 for example
                break;
            default:
                break;
        }
        console.log(`${item} 已使用！`);
        updateInventoryDisplay();
        saveInventoryToServer();
    } else {
        alert(`${item} 數量不足。`);
    }
}
