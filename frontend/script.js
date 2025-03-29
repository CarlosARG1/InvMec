const API_URL = 'http://localhost:3000';
let token = localStorage.getItem('token');

async function loadInventory() {
    const response = await fetch(`${API_URL}/inventory`, {
        headers: { 'Authorization': token }
    });
    const inventory = await response.json();
    const inventoryTable = document.getElementById('inventory-table');
    inventoryTable.innerHTML = inventory.map((product) => `
        <tr>
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>${product.characteristics}</td>
            <td>
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
    console.log(logs);
}

loadInventory();
