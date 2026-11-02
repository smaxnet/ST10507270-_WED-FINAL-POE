const menuItems = [
  { id: 'classic', name: 'Classic Kota', category: 'Kota', price: 45, description: 'Classic kota with chips and sauce.', image: 'kota1.jpeg' },
  { id: 'cheese', name: 'Cheese Kota', category: 'Kota', price: 55, description: 'Loaded with melted cheese.', image: 'kota2.png' },
  { id: 'chicken', name: 'Chicken Kota', category: 'Kota', price: 65, description: 'Succulent chicken and sauce.', image: 'kotaWALLPAPER.jpeg' },
  { id: 'beef', name: 'Beef Kota', category: 'Kota', price: 70, description: 'Beef-packed and satisfying.', image: 'beef kota.jpeg' },
  { id: 'russian', name: 'Russian Kota', category: 'Kota', price: 60, description: 'A rich, savoury favourite.', image: 'kota n russian.jpeg' },
  { id: 'chips', name: 'Golden Chips', category: 'Sides', price: 25, description: 'Crispy golden fries.', image: 'kotaWALLPAPER.jpeg' },
  { id: 'drink', name: 'Soft Drink', category: 'Drinks', price: 18, description: 'Cold soda or fizzy drink.', image: 'soft drink' },
  { id: 'juice', name: 'Fresh Juice', category: 'Drinks', price: 22, description: 'Fresh orange juice.', image: 'orange juice.jpeg' },
  { id: 'water', name: 'Water', category: 'Drinks', price: 12, description: 'Still bottled water.', image: 'still water.jpeg' },
  { id: 'iced-tea', name: 'Signature Iced Tea', category: 'Drinks', price: 25, description: 'Chilled tea with a refreshing citrus finish.', image: 'ice tea.jpeg' },
  { id: 'mocktail', name: 'Blue Island Mocktail', category: 'Drinks', price: 30, description: 'A bright, fruity blue island mocktail.', image: 'Kota bite/images.jpg' }
];

const cart = JSON.parse(localStorage.getItem('kotabite_cart') || '[]');


function formatCurrency(value) {
  return `R${Number(value || 0).toFixed(2)}`;
}

function saveCart() {
  localStorage.setItem('kotabite_cart', JSON.stringify(cart));
}

function addToCart(itemId) {
  const item = menuItems.find((entry) => entry.id === itemId);
  if (!item) return;

  const existing = cart.find((entry) => entry.id === itemId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }

  saveCart();
  renderCart();
  renderStatus(`${item.name} added to cart.`, 'success');
}

function updateQty(itemId, change) {
  const item = cart.find((entry) => entry.id === itemId);
  if (!item) return;

  item.qty += change;
  if (item.qty <= 0) {
    const index = cart.findIndex((entry) => entry.id === itemId);
    cart.splice(index, 1);
  }

  saveCart();
  renderCart();
}

function renderStatus(message, type = 'success') {
  const box = document.getElementById('statusBox');
  if (!box) return;

  box.textContent = message;
  box.className = `status-box ${type}`;

  setTimeout(() => {
    box.className = 'status-box';
    box.textContent = '';
  }, 2000);
}

function renderMenu() {
  const grid = document.getElementById('menuGrid');
  if (!grid) return;

  grid.innerHTML = menuItems.map((item) => `
    <div class="menu-card">
      <img class="menu-card__image" src="${item.image}" alt="${item.name}" loading="lazy">
      <div class="badge">${item.category}</div>
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <div class="menu-card__footer">
        <strong>${formatCurrency(item.price)}</strong>
        <button type="button" class="add-btn" data-item-id="${item.id}">Add</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.add-btn').forEach((button) => {
    button.addEventListener('click', () => addToCart(button.dataset.itemId));
  });
}

function renderCart() {
  const cartItems = document.getElementById('cartItems');
  if (!cartItems) return;

  const orderMadeField = document.getElementById('orderMade');
  if (orderMadeField) {
    orderMadeField.value = cart.length
      ? cart.map((item) => `${item.qty} × ${item.name}`).join('\n')
      : '';
  }

  if (!cart.length) {
    cartItems.innerHTML = '<p class="summary-text">Your cart is empty. Add a kota, side, or drink.</p>';
    updateTotals(0, 0, 0, 0);
    return;
  }

  cartItems.innerHTML = cart.map((item) => {
    const image = menuItems.find((menuItem) => menuItem.id === item.id)?.image || item.image || 'kota2.png';
    return `
      <div class="cart-item">
        <img class="cart-item__image" src="${image}" alt="${item.name}" loading="lazy">
        <div class="cart-item__meta">
          <strong>${item.name}</strong><br>
          <small>${formatCurrency(item.price)} each</small>
        </div>
        <div class="cart-item__controls">
          <button type="button" class="qty-btn" data-action="minus" data-item-id="${item.id}">−</button>
          <span>${item.qty}</span>
          <button type="button" class="qty-btn" data-action="plus" data-item-id="${item.id}">+</button>
          <button type="button" class="remove-btn" data-item-id="${item.id}">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  cartItems.querySelectorAll('.qty-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const change = button.dataset.action === 'plus' ? 1 : -1;
      updateQty(button.dataset.itemId, change);
    });
  });

  cartItems.querySelectorAll('.remove-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const index = cart.findIndex((entry) => entry.id === button.dataset.itemId);
      if (index >= 0) {
        cart.splice(index, 1);
        saveCart();
        renderCart();
      }
    });
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const vat = subtotal * 0.15;
  const deliveryFee = document.getElementById('orderType')?.value === 'delivery' ? 25 : 0;
  const total = subtotal + vat + deliveryFee;

  updateTotals(subtotal, vat, deliveryFee, total);
}

function updateTotals(subtotal, vat, deliveryFee, total) {
  const subtotalField = document.getElementById('subtotalValue');
  const vatField = document.getElementById('vatValue');
  const deliveryField = document.getElementById('deliveryValue');
  const totalField = document.getElementById('totalValue');
  const orderBalanceField = document.getElementById('orderBalance');

  if (subtotalField) subtotalField.textContent = formatCurrency(subtotal);
  if (vatField) vatField.textContent = formatCurrency(vat);
  if (deliveryField) deliveryField.textContent = formatCurrency(deliveryFee);
  if (totalField) totalField.textContent = formatCurrency(total);
  if (orderBalanceField) orderBalanceField.value = formatCurrency(total);
}

function handleOrderSubmit(event) {
  event.preventDefault();

  if (!cart.length) {
    renderStatus('Your cart is empty. Add a kota, side, or drink first.', 'error');
    return;
  }

  const customerName = document.getElementById('customerName')?.value?.trim() || '';
  const customerSurname = document.getElementById('customerSurname')?.value?.trim() || '';
  const customerPhone = document.getElementById('customerPhone')?.value?.trim() || '';
  const customerEmail = document.getElementById('customerEmail')?.value?.trim() || '';
  const orderType = document.getElementById('orderType')?.value || 'takeaway';
  const paymentMethod = document.getElementById('paymentMethod')?.value || 'Cash';
  const orderNotes = document.getElementById('orderNotes')?.value?.trim() || 'No special instructions';
  const deliveryAddress = document.getElementById('deliveryAddress')?.value?.trim() || '';

  if (customerName.length < 2 || customerSurname.length < 2) {
    renderStatus('Please enter your name and surname.', 'error');
    return;
  }

  if (customerPhone.replace(/\D/g, '').length < 10) {
    renderStatus('Please enter a valid phone number.', 'error');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    renderStatus('Please enter a valid email address.', 'error');
    return;
  }

  if (orderType === 'delivery' && deliveryAddress.length < 6) {
    renderStatus('Please enter a valid delivery address.', 'error');
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const vat = subtotal * 0.15;
  const deliveryFee = orderType === 'delivery' ? 25 : 0;
  const total = subtotal + vat + deliveryFee;

  const order = {
    customerName,
    customerSurname,
    customerPhone,
    customerEmail,
    orderType,
    paymentMethod,
    deliveryAddress,
    orderNotes,
    orderMade: cart.map((item) => `${item.qty} × ${item.name}`).join(', '),
    items: cart,
    subtotal,
    vat,
    deliveryFee,
    total,
    orderBalance: total,
    createdAt: new Date().toISOString()
  };

  localStorage.setItem('kotabite_final_order', JSON.stringify(order));
  localStorage.removeItem('kotabite_cart');

  const thankYou = document.getElementById('thankYouMessage');
  if (thankYou) {
    thankYou.style.display = 'block';
    thankYou.textContent = `Thank you, ${customerName} ${customerSurname}! Your order has been placed successfully. Total: ${formatCurrency(total)}.`;
  }

  renderStatus('Order placed successfully. Thank you!', 'success');
  cart.length = 0;
  renderCart();
  event.target.reset();
}

function clearCart() {
  cart.length = 0;
  localStorage.removeItem('kotabite_cart');
  renderCart();
  renderStatus('Cart cleared.', 'success');
}

document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  renderCart();

  const orderType = document.getElementById('orderType');
  if (orderType) {
    orderType.addEventListener('change', renderCart);
  }

  const orderForm = document.getElementById('orderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', handleOrderSubmit);
  }

  const clearCartBtn = document.getElementById('clearCartBtn');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', clearCart);
  }

  const itemSelect = document.getElementById('item');
  if (itemSelect) {
    itemSelect.addEventListener('change', () => {
      const { price } = getSelectedItemInfo();
      const qty = Number(document.getElementById('quantity')?.value || 1);
      const output = document.getElementById('quoteTotal');
      if (output) output.textContent = formatCurrency(price * qty);
    });
  }
});

function getSelectedItemInfo() {
  const radio = document.querySelector('input[name="item"]:checked');
  const select = document.getElementById('item');
  const selected = radio || (select && select.selectedOptions[0]);

  if (!selected) return { name: '', price: 0 };

  const price = Number(String(selected.dataset.price || selected.value || '0').replace(/[^0-9.-]/g, '')) || 0;
  const name = selected.dataset.name || selected.value || 'Classic Kota';
  return { name, price };
}
