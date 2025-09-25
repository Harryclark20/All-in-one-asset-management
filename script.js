// Asset Management System - Fixed & Complete

let assets = [];
let editingAssetId = null;

// Shortcuts
const el = id => document.getElementById(id);
const val = id => el(id)?.value?.trim() || "";
const num = id => Number(val(id)) || 0;

// -------- Modal Handling --------
function openModal(id) {
  el(id).classList.remove("hidden");
}
function closeModal() {
  document.querySelectorAll(".modal").forEach(m => m.classList.add("hidden"));
  editingAssetId = null;
  el("assetForm")?.reset();
}

// -------- Save Asset --------
function saveAsset() {
  const name = val("assetName");

  if (!name) {
    alert("Please fill in required fields (Asset Name)");
    return;
  }

  const assetData = {
    id: editingAssetId || Date.now(),
    name,
    category: val("category") || "",
    status: val("assetStatus") || "Active",
    serialNumber: val("serialNumber"),
    purchaseDate: val("purchaseDate"),
    purchasePrice: num("purchasePrice"),
    currentValue: num("currentValue"),
    location: val("location"),
    assignedTo: val("assignedTo"),
    warrantyExpiry: val("warrantyExpiry"),
    description: val("description"),
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

// -------- Edit / Delete --------
function editAsset(id) {
  const asset = assets.find(a => a.id === id);
  if (!asset) return;

  editingAssetId = id;
  Object.keys(asset).forEach(k => {
    if (el(k)) el(k).value = asset[k];
  });
  openModal("assetModal");
}

function deleteAsset(id) {
  if (confirm("Delete this asset?")) {
    assets = assets.filter(a => a.id !== id);
    updateDisplay();
  }
}

// -------- Update Display --------
function updateDisplay() {
  const tbody = el("assetTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const searchTerm = (el("searchInput")?.value || "").toLowerCase();
  const categoryFilter = el("categoryFilter")?.value || "";
  const statusFilter = el("statusFilter")?.value || "";

  assets
    .filter(asset => {
      const matchesSearch =
        (asset.name || "").toLowerCase().includes(searchTerm) ||
        (asset.serialNumber || "").toLowerCase().includes(searchTerm) ||
        (asset.assignedTo || "").toLowerCase().includes(searchTerm);

      const matchesCategory = !categoryFilter || asset.category === categoryFilter;
      const matchesStatus = !statusFilter || asset.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .forEach(asset => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${asset.name}</td>
        <td>${asset.category}</td>
        <td>${asset.status}</td>
        <td>${asset.purchaseDate}</td>
        <td>${asset.purchasePrice}</td>
        <td>${asset.currentValue}</td>
        <td>${asset.location}</td>
        <td>${asset.assignedTo || ""}</td>
        <td>
          <button onclick="editAsset(${asset.id})">Edit</button>
          <button onclick="deleteAsset(${asset.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
}

// -------- Export CSV --------
function exportCSV() {
  const searchTerm = (el("searchInput")?.value || "").toLowerCase();
  const categoryFilter = el("categoryFilter")?.value || "";
  const statusFilter = el("statusFilter")?.value || "";

  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      (asset.name || "").toLowerCase().includes(searchTerm) ||
      (asset.serialNumber || "").toLowerCase().includes(searchTerm) ||
      (asset.assignedTo || "").toLowerCase().includes(searchTerm);

    const matchesCategory = !categoryFilter || asset.category === categoryFilter;
    const matchesStatus = !statusFilter || asset.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const headers = [
    "Name",
    "Category",
    "Status",
    "Purchase Date",
    "Purchase Price",
    "Current Value",
    "Location",
    "Assigned To",
    "Serial Number",
    "Description",
  ];

  const csvData = [
    headers.join(","),
    ...filteredAssets.map(a =>
      [
        a.name || "",
        a.category || "",
        a.status || "",
        a.purchaseDate || "",
        Number(a.purchasePrice || 0),
        Number(a.currentValue || 0),
        a.location || "",
        a.assignedTo || "",
        a.serialNumber || "",
        (a.description || "").replace(/\n/g, " ").replace(/,/g, ";"),
      ].join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvData], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "assets.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
