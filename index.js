import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js';

const appSettings = {
  databaseURL:
    'https://shoppinglist-d7c87-default-rtdb.europe-west1.firebasedatabase.app/',
};

const shopsList = [
  { id: 'Aldi', name: 'Aldi' },
  { id: 'Consum', name: 'Consum' },
  { id: 'Ametller', name: 'Ametller' },
  { id: 'Mercat', name: 'Mercat' },
  { id: 'Condis', name: 'Condis' },
  { id: 'Autre', name: 'Autre' },
];

const app = initializeApp(appSettings);
const database = getDatabase(app);
const shoppingListInDB = ref(database, 'shoppingList');

const inputFieldEl = document.getElementById('input-field');
const shopSelectEl = document.getElementById('shop-select');
const filterSelectEl = document.getElementById('filter-select');
const addButtonEl = document.getElementById('add-button');
const shoppingListEl = document.getElementById('shopping-list');

addButtonEl.addEventListener('click', function () {
  let inputValue = inputFieldEl.value.trim();
  let shopValue = shopSelectEl.value;

  if (inputValue && shopValue) {
    inputValue = capitalizeFirstLetter(inputValue);

    push(shoppingListInDB, {
      name: inputValue,
      shop: shopValue,
    });

    clearInputFieldEl();
    shopSelectEl.selectedIndex = 0;
  } else {
    alert('Please enter an item and select a shop');
  }
});

filterSelectEl.addEventListener('change', function () {
  renderShoppingList();
});

function renderShoppingList() {
  onValue(shoppingListInDB, function (snapshot) {
    if (snapshot.exists()) {
      let itemsArray = Object.entries(snapshot.val());
      let currentFilter = filterSelectEl.value;

      clearShoppingListEl();

      for (let i = 0; i < itemsArray.length; i++) {
        let currentItem = itemsArray[i];
        let currentItemID = currentItem[0];
        let currentItemValue = currentItem[1];

        if (
          currentFilter === 'all' ||
          (typeof currentItemValue === 'object' &&
            currentItemValue.shop === currentFilter)
        ) {
          appendItemToShoppingListEl(currentItem);
        }
      }

      if (shoppingListEl.children.length === 0) {
        shoppingListEl.innerHTML = 'No items for this shop';
      }
    } else {
      shoppingListEl.innerHTML = 'No items here... yet';
    }
  });
}

function clearShoppingListEl() {
  shoppingListEl.innerHTML = '';
}

function clearInputFieldEl() {
  inputFieldEl.value = '';
}

function appendItemToShoppingListEl(item) {
  let itemID = item[0];
  let itemValue = item[1];

  let newEl = document.createElement('li');

  if (typeof itemValue === 'object') {
    newEl.textContent = `${itemValue.name}`;
    newEl.dataset.shop = itemValue.shop;
  } else {
    newEl.textContent = itemValue;
  }

  newEl.addEventListener('dblclick', function () {
    let exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`);
    remove(exactLocationOfItemInDB);
  });

  shoppingListEl.append(newEl);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

inputFieldEl.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    addButtonEl.click();
  }
});

function populateShopDropdowns() {
  while (shopSelectEl.options.length > 1) {
    shopSelectEl.remove(1);
  }

  while (filterSelectEl.options.length > 1) {
    filterSelectEl.remove(1);
  }

  shopsList.forEach((shop) => {
    const option = document.createElement('option');
    option.value = shop.id;
    option.textContent = shop.name;
    shopSelectEl.appendChild(option);
  });

  shopsList.forEach((shop) => {
    const option = document.createElement('option');
    option.value = shop.id;
    option.textContent = shop.name;
    filterSelectEl.appendChild(option);
  });
}

populateShopDropdowns();
renderShoppingList();
