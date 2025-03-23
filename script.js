// frontend/script.js
const API_URL = 'http://localhost:3000';
let token = localStorage.getItem('token');

async function login(username, password) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (data.token) {
        localStorage.setItem('token', data.token);
        token = data.token;
        loadInventory();
    } else {
        alert('Error en inicio de sesión');
    }
}

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    login(username, password);
});

async function loadInventory() {
    const response = await fetch(`${API_URL}/inventory`, {
        headers: { 'Authorization': token }
    });
    const inventory = await response.json();
    const inventoryTable = document.getElementById('inventory-table');
    inventoryTable.innerHTML = inventory.map((product, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>${product.characteristics}</td>
            <td>
                <button onclick="editProduct(${product.id})">Editar</button>
                <button onclick="removeProduct(${product.id})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('product-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const quantity = document.getElementById('quantity').value;
    const characteristics = document.getElementById('characteristics').value;

    await fetch(`${API_URL}/inventory`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify({ name, quantity, characteristics })
    });
    loadInventory();
});

async function removeProduct(id) {
    await fetch(`${API_URL}/inventory/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
    });
    loadInventory();
}

async function downloadLogs() {
    const response = await fetch(`${API_URL}/logs`, {
        headers: { 'Authorization': token }
    });
    const logs = await response.json();
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'logs.json';
    a.click();
    URL.revokeObjectURL(url);
}

loadInventory();
