const catalog = [
    { id: 1, name: 'Fresh Milk (1L)', price: 2.50, icon: 'fa-bottle-droplet' },
    { id: 2, name: 'Organic Vegetables', price: 12.00, icon: 'fa-carrot' },
    { id: 3, name: 'Snacks & Munchies', price: 5.00, icon: 'fa-cookie-bite' },
    { id: 4, name: 'Cleaning Supplies', price: 8.50, icon: 'fa-pump-soap' }
];

let currentUser = '', currentRoom = '';

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    currentUser = document.getElementById('username').value.trim();
    currentRoom = document.getElementById('room').value.trim().toUpperCase();
    
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('app-view').style.display = 'block';
    document.getElementById('display-room').innerText = currentRoom;
    
    renderCatalog();
    logActivity('Joined the room');
    updateUI();
});

function renderCatalog() {
    document.getElementById('catalog-list').innerHTML = catalog.map(p => `
        <div class="col-md-6">
            <div class="card card-custom p-3 d-flex flex-row justify-content-between align-items-center">
                <div><h6 class="fw-bold mb-1"><i class="fa-solid ${p.icon} text-primary me-2"></i>${p.name}</h6>
                <small class="text-muted">$${p.price.toFixed(2)}</small></div>
                <button class="btn btn-outline-primary btn-sm" onclick="addToCart(${p.id})"><i class="fa-solid fa-plus"></i></button>
            </div>
        </div>
    `).join('');
}

function addToCart(id) {
    const prod = catalog.find(p => p.id === id);
    let cart = JSON.parse(localStorage.getItem(`cart_${currentRoom}`)) || [];
    cart.push({ ...prod, cartId: Date.now(), addedBy: currentUser });
    localStorage.setItem(`cart_${currentRoom}`, JSON.stringify(cart));
    logActivity(`Added ${prod.name}`);
    updateUI();
}

function removeCartItem(cartId, name) {
    let cart = JSON.parse(localStorage.getItem(`cart_${currentRoom}`)) || [];
    cart = cart.filter(item => item.cartId !== cartId);
    localStorage.setItem(`cart_${currentRoom}`, JSON.stringify(cart));
    logActivity(`Removed ${name}`);
    updateUI();
}

function logActivity(msg) {
    let logs = JSON.parse(localStorage.getItem(`logs_${currentRoom}`)) || [];
    logs.unshift(`<strong>${currentUser}:</strong> ${msg} <span class="text-muted float-end" style="font-size:0.75rem">${new Date().toLocaleTimeString()}</span>`);
    localStorage.setItem(`logs_${currentRoom}`, JSON.stringify(logs.slice(0, 30)));
}

function updateUI() {
    if(!currentRoom) return;
    const cart = JSON.parse(localStorage.getItem(`cart_${currentRoom}`)) || [];
    const logs = JSON.parse(localStorage.getItem(`logs_${currentRoom}`)) || [];
    
    let total = 0, splits = {};
    document.getElementById('cart-container').innerHTML = cart.length ? cart.map(item => {
        total += item.price;
        splits[item.addedBy] = (splits[item.addedBy] || 0) + item.price;
        return `<li class="list-group-item d-flex justify-content-between align-items-center py-2">
            <div><span class="fw-bold">${item.name}</span><br><small class="text-muted">Added by: ${item.addedBy}</small></div>
            <div><span class="fw-bold me-3">$${item.price.toFixed(2)}</span>
            <button class="btn btn-sm btn-outline-danger no-print" onclick="removeCartItem(${item.cartId}, '${item.name}')"><i class="fa-solid fa-trash"></i></button></div>
        </li>`;
    }).join('') : '<li class="list-group-item text-center text-muted">Cart is empty</li>';

    document.getElementById('final-total').innerText = `$${total.toFixed(2)}`;
    document.getElementById('total-cost-text').innerText = `$${total.toFixed(2)} / $75.00`;
    
    const pBar = document.getElementById('delivery-progress');
    pBar.style.width = `${Math.min((total/75)*100, 100)}%`;
    pBar.className = `progress-bar ${total >= 75 ? 'bg-success' : 'bg-primary'}`;

    document.getElementById('split-list').innerHTML = Object.entries(splits).map(([user, amt]) => 
        `<li class="list-group-item d-flex justify-content-between px-0"><span>${user}</span><strong>$${amt.toFixed(2)}</strong></li>`
    ).join('');

    document.getElementById('log-list').innerHTML = logs.map(l => `<div class="log-item">${l}</div>`).join('');
}

// Ensure syncing between multiple browser tabs
window.addEventListener('storage', updateUI);