let inventory = {};
let craftedItems = {};
let auras = {};
let leaderboard = [];
let luck = 0;

document.addEventListener('DOMContentLoaded', function() {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        alert('請登入以訪問您的庫存。');
        window.location.href = 'login.html';
        return;
    }

    fetch(`https://202.182.114.79:1109/load-inventory?email=${userEmail}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error); });
            }
            return response.json();
        })
        .then(data => {
            inventory = data.inventory || {};
            craftedItems = data.craftedItems || {};
            auras = data.auras || {};
            leaderboard = data.leaderboard || [];
            updateInventoryDisplay();
            displayLeaderboard();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('加載庫存失敗。請稍後再試。');
        });

    document.getElementById('roll-button').addEventListener('click', function() {
        const result = rollAura('Player');
        if (result) {
            updateDisplay(result);
            addItemToInventory(result.name, 1);
        }
    });

    let autoRollInterval = null;
    document.getElementById('auto-roll-button').addEventListener('click', function() {
        if (autoRollInterval) {
            clearInterval(autoRollInterval);
            autoRollInterval = null;
            document.getElementById('auto-roll-button').textContent = '自動擲骰';
        } else {
            autoRollInterval = setInterval(() => {
                const result = rollAura('Player');
                if (result) {
                    updateDisplay(result);
                    addItemToInventory(result.name, 1);
                }
            }, 1000);
            document.getElementById('auto-roll-button').textContent = '停止自動擲骰';
        }
    });
});

function rollAura(playerName) {
    if (!Object.keys(auras).length) {
        console.error('No auras available');
        return null;
    }

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
    return null;
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
    leaderboard.sort((a, b) => b.value - a.value);
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
    if (result && result.name && result.chance) {
        resultDisplay.textContent = `你擲出了: ${result.name} (1 in ${result.chance} chance)`;
    } else {
        console.error('Invalid result:', result);
    }
}

function updateInventoryDisplay() {
    const itemsList = document.getElementById('items-list');
    if (itemsList) {
        itemsList.innerHTML = '';
        Object.keys(inventory).forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item}: ${inventory[item]}`;
            const useButton = document.createElement('button');
            useButton.textContent = '使用';
            useButton.onclick = () => useItem(item);
            li.appendChild(useButton);
            itemsList.appendChild(li);
        });
    }
    const luckDisplay = document.getElementById('luck-display');
    if (luckDisplay) {
        luckDisplay.textContent = `目前幸運值: ${luck}`;
    }
}

function useItem(item) {
    if (inventory[item] > 0) {
        inventory[item] -= 1;
        switch(item) {
            case '幸運藥水':
                luck += 100;
                break;
            case '財富藥水 I':
                luck += 150;
                break;
            case '財富藥水 II':
                luck += 200;
                break;
            case '財富藥水 III':
                luck += 250;
                break;
            case '天界藥水 I':
                luck += 2000000;
                break;
            case '天界藥水 II':
                luck += 20000000;
                break;
            default:
                break;
        }
        alert(`${item} 已使用！`);
        updateInventoryDisplay();
        saveInventoryToServer();
    } else {
        alert(`${item} 數量不足。`);
    }
}

function saveInventoryToServer() {
    const userEmail = localStorage.getItem('userEmail');
    fetch('https://202.182.114.79:1109/save-inventory', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: userEmail, inventory, craftedItems, currentAura: '', currentAuraValue: 0 })
    })
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}
