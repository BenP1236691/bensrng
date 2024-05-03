document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

const inventoryKey = 'inventory-zh';
const equippedItemsKey = 'equippedItems-zh';
const inventory = loadInventory();
const equippedItems = loadEquippedItems();
let luck = calculateInitialLuck(equippedItems); // Calculates luck based on equipped items

const recipes = {
    '齒輪基礎': {'「稀有」': 1, '「常見」':1, '「好」': 1, '「不常見」': 1},
    '幸運手套': { '「迪維努斯」': 2, '「稀有」': 3, '「結晶」': 1, '齒輪基礎': 1, "luck": 25},
    '月亮裝置': { '「迪維努斯」': 1, '「稀有」': 1, '月': 1, '齒輪基礎': 1, 'luck': 50 },
    '太陽能裝置': { '「迪維努斯」': 1, '「稀有」': 1, '“太陽能”': 1, '齒輪基礎': 1, 'luck': 50 },
    // Additional recipes can be added here...
};

function initializePage() {
    updateInventoryDisplay();
    updateRecipesDisplay();
}

function loadInventory() {
    return JSON.parse(localStorage.getItem(inventoryKey)) || {};
}

function loadEquippedItems() {
    return JSON.parse(localStorage.getItem(equippedItemsKey)) || {};
}

function updateInventoryDisplay() {
    const itemsList = document.getElementById('items-list');
    itemsList.innerHTML = '';
    Object.keys(inventory).forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item}: ${inventory[item]}`;
        if (equippedItems[item]) {
            li.style.color = 'green';
            li.textContent += ' (已裝備)';
        }
        li.onclick = () => toggleEquipItem(item);
        itemsList.appendChild(li);
    });
}

function updateRecipesDisplay() {
    const recipesList = document.getElementById('recipes-list');
    recipesList.innerHTML = '';
    Object.keys(recipes).forEach(recipeName => {
        const recipe = recipes[recipeName];
        const li = document.createElement('li');
        li.textContent = `${recipeName} - `;
        const details = document.createElement('ul');

        Object.keys(recipe).forEach(ingredient => {
            const ingredientLi = document.createElement('li');
            ingredientLi.textContent = `${ingredient} x${recipe[ingredient]}`;
            details.appendChild(ingredientLi);
        });

        li.appendChild(details);
        const craftButton = document.createElement('button');
        craftButton.textContent = '製作';
        craftButton.onclick = () => craftItem(recipeName);
        li.appendChild(craftButton);
        recipesList.appendChild(li);
    });
}

function toggleEquipItem(item) {
    if (equippedItems[item]) {
        delete equippedItems[item];
        luck -= recipes[item].luck; // Reduce luck when item is unequipped
    } else {
        equippedItems[item] = true;
        luck += recipes[item].luck; // Increase luck when item is equipped
    }
    saveEquippedItems();
    updateInventoryDisplay();
    updateLuckDisplay();
}

function calculateInitialLuck(equipped) {
    return Object.keys(equipped).reduce((acc, item) => acc + recipes[item].luck, 0);
}

function saveEquippedItems() {
    localStorage.setItem(equippedItemsKey, JSON.stringify(equippedItems));
}

function saveInventory() {
    localStorage.setItem(inventoryKey, JSON.stringify(inventory));
}

function updateLuckDisplay() {
    document.getElementById('luck-display').textContent = `當前運氣: ${luck}`;
}