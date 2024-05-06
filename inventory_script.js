document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

const inventory = loadInventory();
const craftedItems = loadCraftedItems();

const recipes = {
    '齒輪基礎': {'「稀有」': 1, '「常見」':1, '「好」': 1, '「不常見」': 1 , "luck": 10},
    '幸運手套': { '「迪維努斯」': 2, '「稀有」': 3, '「結晶」': 1, '齒輪基礎':1, "luck": 25},
    '月亮裝置': { '「迪維努斯」': 1, '「稀有」': 1, '月': 1, '齒輪基礎':1, luck:40},
    '太陽能裝置': { '「迪維努斯」': 1, '「稀有」': 1, '“太陽能”': 1, '齒輪基礎':1, 'luck': 50 },
    '日蝕' : {'「迪維努斯」': 1, '“太陽能”': 1, '月': 1},
    "日蝕裝置": {"太陽能裝置": 1, '月亮裝置':1,  '日蝕':1, "luck": 100}
};

function initializePage() {
    updateInventoryDisplay();
    updateCraftedItemsDisplay();
    updateRecipesDisplay();
}

function loadInventory() {
    return JSON.parse(localStorage.getItem('inventory-zh')) || {};
}

function loadCraftedItems() {
    return JSON.parse(localStorage.getItem('craftedItems-zh')) || {};
}

function updateInventoryDisplay() {
    const itemsList = document.getElementById('items-list');
    itemsList.innerHTML = '';
    Object.keys(inventory).forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item}: ${inventory[item]}`;
        itemsList.appendChild(li);
    });
}

function updateCraftedItemsDisplay() {
    const craftedItemsList = document.getElementById('crafted-items-list');
    craftedItemsList.innerHTML = '';
    Object.keys(craftedItems).forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item}: ${craftedItems[item]}`;
        craftedItemsList.appendChild(li);
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
        saveInventory();
        saveCraftedItems();
        console.log(`${recipeName} crafted successfully.`);
    } else {
        alert("材料不足，無法製作 " + recipeName);
        console.log(`Failed to craft ${recipeName}: insufficient materials.`);
    }
}

function addToCraftedItems(item, quantity) {
    craftedItems[item] = (craftedItems[item] || 0) + quantity;
}

function saveInventory() {
    localStorage.setItem('inventory-zh', JSON.stringify(inventory));
}

function saveCraftedItems() {
    localStorage.setItem('craftedItems-zh', JSON.stringify(craftedItems));
}