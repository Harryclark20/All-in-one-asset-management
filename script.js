// ===== STATE =====
let assets = [];
let editingAssetId = null;
let currentDetailAsset = null;

// ===== HELPERS (null-safe) =====
const el = (id) => document.getElementById(id);
const val = (id) => (el(id) ? el(id).value : "");
const setVal = (id, v = "") => { if (el(id)) el(id).value = v; };
const num = (id) => {
  const n = parseFloat(val(id));
  return isNaN(n) ? 0 : n;
};

// ===== STATS =====
function updateStats() {
  const totalAssets = assets.length;
  const activeAssets = assets.filter(a => (a.status || "") === "Active").length;
  const totalValue = assets.reduce((sum, a) => sum + (Number(a.currentValue) || 0), 0);

  el('totalAssets').textContent = totalAssets;
  el('activeAssets').textContent = activeAssets;
  el('totalValue').textContent = '$' + totalValue.toLocaleString();
}

// ===== TABLE RENDER =====
function renderAssetsTable() {
  const tbody = el('assetsTableBody');
  if (!tbody) return;

  const searchTerm = (el('searchInput')?.value || "").toLowerCase();
  const categoryFilter = el('categoryFilter')?.value || "";
  const statusFilter = el('statusFilter')?.value || "";

  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      (asset.name || "").toLowerCase().includes(searchTerm) ||
      (asset.serialNumber || "").toLowerCase().includes(searchTerm) ||
      (asset.assignedTo || "").toLowerCase().includes(searchTerm) ||
      (asset.location || "").toLowerCase().includes(searchTerm);

    const matchesCategory = !categoryFilter || asset.category === categoryFilter;
    const matchesStatus = !statusFilter || asset.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  tbody.innerHTML = filteredAssets.map(asset => `
    <tr>
      <td>
        <div>
          <div style="font-weight: 500;">${asset.name || ''}</div>
          <div style="font-size: 0.875rem; color: #6b7280;">
            ${asset.serialNumber ? `S/N: ${asset.serialNumber}` : ''}</div>
        </div>
      </td>
      <td><span class="badge badge-blue">${asset.category || ''}</span></td>
      <td><span class="badge ${getStatusBadgeClass(asset.status)}">${asset.status || ''}</span></td>
      <td>${asset.location || 'N/A'}</td>
      <td>${asset.assignedTo || 'Unassigned'}</td>
      <td>$${Number(asset.currentValue || 0).toLocaleString()}</td>
      <td>
        <div class="actions">
          <button class="action-btn" onclick="viewAsset(${asset.id})" title="View">👁️</button>
          <button class="action-btn" onclick="editAsset(${asset.id})" title="Edit">✏️</button>
          <button class="btn-danger" onclick="deleteAsset(${asset.id})" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Active': return 'badge-green';
    case 'Under Maintenance': return 'badge-yellow';
    default: return 'badge-red';
  }
}

function updateDisplay() {
  updateStats();
  renderAssetsTable();
}

function filterAssets() {
  renderAssetsTable();
}

// ===== MODALS =====
function openAddModal() {
  editingAssetId = null;
  el('modalTitle').textContent = 'Add New Asset';
  clearForm();
  el('assetModal')?.classList.add('active');
}

function closeModal() {
  el('assetModal')?.classList.remove('active');
}

function closeDetailModal() {
  el('detailModal')?.classList.remove('active');
}

// ===== CRUD =====
function clearForm() {
  // Works even if some inputs are not in your HTML
  ['assetName','assetStatus','serialNumber','purchaseDate',
   'purchasePrice','currentValue','location','assignedTo','warrantyExpiry','description']
   .forEach(id => setVal(id, ''));

  setVal('assetStatus', 'Active');
}

function saveAsset() {
  const name = val('assetName');

  if (!name) {
    alert('Please fill in required fields (Asset Name)');
    return;
  }

  const assetData = {
    id: editingAssetId || Date.now(),
    name,
    category,
    status: val('assetStatus') || 'Active',
    serialNumber: val('serialNumber'),           // may be empty (safe)
    purchaseDate: val('purchaseDate'),           // may be empty (safe)
    purchasePrice: num('purchasePrice'),         // default 0 if missing
    currentValue: num('currentValue'),           // default 0 if missing
    location: val('location'),
    assignedTo: val('assignedTo'),
    warrantyExpiry: val('warrantyExpiry'),
    description: val('description')
  };

  if (editingAssetId) {
    const i = assets.findIndex(a => a.id === editingAssetId);
    if (i !== -1) assets[i] = assetData;
  } else {
    assets.push(assetData);
  }

  closeModal();
  updateDisplay();
}

function editAsset(id) {
  const asset = assets.find(a => a.id === id);
  if (!asset) return;

  editingAssetId = id;
  el('modalTitle').textContent = 'Edit Asset';

  setVal('assetName', asset.name || '');
  setVal('assetStatus', asset.status || 'Active');
  setVal('serialNumber', asset.serialNumber || '');
  setVal('purchaseDate', asset.purchaseDate || '');
  setVal('purchasePrice', asset.purchasePrice ?? '');
  setVal('currentValue', asset.currentValue ?? '');
  setVal('location', asset.location || '');
  setVal('assignedTo', asset.assignedTo || '');
  setVal('warrantyExpiry', asset.warrantyExpiry || '');
  setVal('description', asset.description || '');

  el('assetModal')?.classList.add('active');
}

function viewAsset(id) {
  const asset = assets.find(a => a.id === id);
  if (!asset) return;

  currentDetailAsset = asset;
  el('assetDetails').innerHTML = `
    <div class="form-grid">
      <div><strong>Asset Name:</strong> ${asset.name || ''}</div>
      <div><strong>Serial Number:</strong> ${asset.serialNumber || 'N/A'}</div>
      <div><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(asset.status)}">${asset.status || ''}</span></div>
      <div><strong>Location:</strong> ${asset.location || 'N/A'}</div>
      <div><strong>Assigned To:</strong> ${asset.assignedTo || 'Unassigned'}</div>
      <div><strong>Purchase Date:</strong> ${asset.purchaseDate || 'N/A'}</div>
      <div><strong>Purchase Price:</strong> $${Number(asset.purchasePrice || 0).toLocaleString()}</div>
      <div><strong>Current Value:</strong> $${Number(asset.currentValue || 0).toLocaleString()}</div>
      <div><strong>Warranty Expiry:</strong> ${asset.warrantyExpiry || 'N/A'}</div>
    </div>
    ${asset.description ? `<div style="margin-top: 1rem;"><strong>Description:</strong><br><div style="background: #f9fafb; padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">${asset.description}</div></div>` : ''}
  `;
  el('detailModal')?.classList.add('active');
}

function editFromDetail() {
  closeDetailModal();
  if (currentDetailAsset) editAsset(currentDetailAsset.id);
}

function deleteAsset(id) {
  if (confirm('Are you sure you want to delete this asset?')) {
    assets = assets.filter(a => a.id !== id);
    updateDisplay();
  }
}

// ===== EXPORT =====
function exportCSV() {
  const searchTerm = (el('searchInput')?.value || "").toLowerCase();
  const statusFilter = el('statusFilter')?.value || "";

  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      (asset.name || "").toLowerCase().includes(searchTerm) ||
      (asset.serialNumber || "").toLowerCase().includes(searchTerm) ||
      (asset.assignedTo || "").toLowerCase().includes(searchTerm);
    const matchesStatus = !statusFilter || asset.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const headers = ['Name','Category','Status','Purchase Date','Purchase Price','Current Value','Location','Assigned To','Serial Number','Description'];
  const csvData = [
    headers.join(','),
    ...filteredAssets.map(a => [
      (a.name || ''),
      (a.status || ''),
      (a.purchaseDate || ''),
      Number(a.purchasePrice || 0),
      Number(a.currentValue || 0),
      (a.location || ''),
      (a.assignedTo || ''),
      (a.serialNumber || ''),
      (a.description || '').replace(/\n/g,' ').replace(/,/g,';')
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'assets.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ===== CLICK OUTSIDE TO CLOSE =====
document.addEventListener('click', (e) => {
  const modal = el('assetModal');
  const detailModal = el('detailModal');
  if (e.target === modal) closeModal();
  if (e.target === detailModal) closeDetailModal();
});

// ===== BOOT =====
document.addEventListener('DOMContentLoaded', () => {
  // Optional: seed example to test
  // assets.push({ id: Date.now(), name: 'HP Laptop', category: 'Electronics', status: 'Active', location: 'Admin Office', assignedTo: 'Chidi', currentValue: 250000 });
  updateDisplay();
});
