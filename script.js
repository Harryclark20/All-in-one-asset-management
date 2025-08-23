        let assets = [];
        let editingAssetId = null;
        let currentDetailAsset = null;

    
        function updateStats() {
            const totalAssets = assets.length;
            const activeAssets = assets.filter(a => a.status === 'Active').length;
            const totalValue = assets.reduce((sum, a) => sum + (a.currentValue || 0), 0);

            document.getElementById('totalAssets').textContent = totalAssets;
            document.getElementById('activeAssets').textContent = activeAssets;
            document.getElementById('totalValue').textContent = '$' + totalValue.toLocaleString();
        }

        function renderAssetsTable() {
            const tbody = document.getElementById('assetsTableBody');
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const categoryFilter = document.getElementById('categoryFilter').value;
            const statusFilter = document.getElementById('statusFilter').value;

            const filteredAssets = assets.filter(asset => {
                const matchesSearch = asset.name.toLowerCase().includes(searchTerm) ||
                                    asset.serialNumber.toLowerCase().includes(searchTerm) ||
                                    asset.assignedTo.toLowerCase().includes(searchTerm);
                const matchesCategory = !categoryFilter || asset.category === categoryFilter;
                const matchesStatus = !statusFilter || asset.status === statusFilter;
                return matchesSearch && matchesCategory && matchesStatus;
            });

            tbody.innerHTML = filteredAssets.map(asset => `
                <tr>
                    <td>
                        <div>
                            <div style="font-weight: 500;">${asset.name}</div>
                            <div style="font-size: 0.875rem; color: #6b7280;">S/N: ${asset.serialNumber}</div>
                        </div>
                    </td>
                    <td>
                        <span class="badge badge-blue">${asset.category}</span>
                    </td>
                    <td>
                        <span class="badge ${getStatusBadgeClass(asset.status)}">${asset.status}</span>
                    </td>
                    <td>${asset.location || 'N/A'}</td>
                    <td>${asset.assignedTo || 'Unassigned'}</td>
                    <td>$${(asset.currentValue || 0).toLocaleString()}</td>
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
            switch(status) {
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

        function openAddModal() {
            editingAssetId = null;
            document.getElementById('modalTitle').textContent = 'Add New Asset';
            clearForm();
            document.getElementById('assetModal').classList.add('active');
        }

        function editAsset(id) {
            const asset = assets.find(a => a.id === id);
            if (!asset) return;

            editingAssetId = id;
            document.getElementById('modalTitle').textContent = 'Edit Asset';
            
            // Populate form
            document.getElementById('assetName').value = asset.name || '';
            document.getElementById('assetCategory').value = asset.category || '';
            document.getElementById('assetStatus').value = asset.status || '';
            document.getElementById('serialNumber').value = asset.serialNumber || '';
            document.getElementById('purchaseDate').value = asset.purchaseDate || '';
            document.getElementById('purchasePrice').value = asset.purchasePrice || '';
            document.getElementById('currentValue').value = asset.currentValue || '';
            document.getElementById('location').value = asset.location || '';
            document.getElementById('assignedTo').value = asset.assignedTo || '';
            document.getElementById('warrantyExpiry').value = asset.warrantyExpiry || '';
            document.getElementById('description').value = asset.description || '';

            document.getElementById('assetModal').classList.add('active');
        }

        function viewAsset(id) {
            const asset = assets.find(a => a.id === id);
            if (!asset) return;

            currentDetailAsset = asset;
            const detailsHTML = `
                <div class="form-grid">
                    <div><strong>Asset Name:</strong> ${asset.name}</div>
                    <div><strong>Serial Number:</strong> ${asset.serialNumber || 'N/A'}</div>
                    <div><strong>Category:</strong> <span class="badge badge-blue">${asset.category}</span></div>
                    <div><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(asset.status)}">${asset.status}</span></div>
                    <div><strong>Location:</strong> ${asset.location || 'N/A'}</div>
                    <div><strong>Assigned To:</strong> ${asset.assignedTo || 'Unassigned'}</div>
                    <div><strong>Purchase Date:</strong> ${asset.purchaseDate || 'N/A'}</div>
                    <div><strong>Purchase Price:</strong> $${(asset.purchasePrice || 0).toLocaleString()}</div>
                    <div><strong>Current Value:</strong> $${(asset.currentValue || 0).toLocaleString()}</div>
                    <div><strong>Warranty Expiry:</strong> ${asset.warrantyExpiry || 'N/A'}</div>
                </div>
                ${asset.description ? `<div style="margin-top: 1rem;"><strong>Description:</strong><br><div style="background: #f9fafb; padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">${asset.description}</div></div>` : ''}
            `;
            
            document.getElementById('assetDetails').innerHTML = detailsHTML;
            document.getElementById('detailModal').classList.add('active');
        }

        function editFromDetail() {
            closeDetailModal();
            editAsset(currentDetailAsset.id);
        }

        function deleteAsset(id) {
            if (confirm('Are you sure you want to delete this asset?')) {
                assets = assets.filter(a => a.id !== id);
                updateDisplay();
            }
        }

        function saveAsset() {
            const name = document.getElementById('assetName').value;
            const category = document.getElementById('assetCategory').value;
            
            if (!name || !category) {
                alert('Please fill in required fields (Asset Name and Category)');
                return;
            }

            const assetData = {
                name,
                category,
                status: document.getElementById('assetStatus').value,
                serialNumber: document.getElementById('serialNumber').value,
                purchaseDate: document.getElementById('purchaseDate').value,
                purchasePrice: parseFloat(document.getElementById('purchasePrice').value) || 0,
                currentValue: parseFloat(document.getElementById('currentValue').value) || 0,
                location: document.getElementById('location').value,
                assignedTo: document.getElementById('assignedTo').value,
                warrantyExpiry: document.getElementById('warrantyExpiry').value,
                description: document.getElementById('description').value
            };

            if (editingAssetId) {
                // Update existing asset
                const index = assets.findIndex(a => a.id === editingAssetId);
                if (index !== -1) {
                    assets[index] = { ...assetData, id: editingAssetId };
                }
            } else {
                // Add new asset
                assetData.id = Date.now();
                assets.push(assetData);
            }

            closeModal();
            updateDisplay();
        }

        function clearForm() {
            document.getElementById('assetName').value = '';
            document.getElementById('assetCategory').value = '';
            document.getElementById('assetStatus').value = 'Active';
            document.getElementById('serialNumber').value = '';
            document.getElementById('purchaseDate').value = '';
            document.getElementById('purchasePrice').value = '';
            document.getElementById('currentValue').value = '';
            document.getElementById('location').value = '';
            document.getElementById('assignedTo').value = '';
            document.getElementById('warrantyExpiry').value = '';
            document.getElementById('description').value = '';
        }

        function closeModal() {
            document.getElementById('assetModal').classList.remove('active');
        }

        function closeDetailModal() {
            document.getElementById('detailModal').classList.remove('active');
        }

        function exportCSV() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const categoryFilter = document.getElementById('categoryFilter').value;
            const statusFilter = document.getElementById('statusFilter').value;

            const filteredAssets = assets.filter(asset => {
                const matchesSearch = asset.name.toLowerCase().includes(searchTerm) ||
                                    asset.serialNumber.toLowerCase().includes(searchTerm) ||
                                    asset.assignedTo.toLowerCase().includes(searchTerm);
                const matchesCategory = !categoryFilter || asset.category === categoryFilter;
                const matchesStatus = !statusFilter || asset.status === statusFilter;
                return matchesSearch && matchesCategory && matchesStatus;
            });

            const headers = ['Name', 'Category', 'Status', 'Purchase Date', 'Purchase Price', 'Current Value', 'Location', 'Assigned To', 'Serial Number'];
            const csvData = [
                headers.join(','),
                ...filteredAssets.map(asset => [
                    asset.name,
                    asset.category,
                    asset.status,
                    asset.purchaseDate,
                    asset.purchasePrice,
                    asset.currentValue,
                    asset.location,
                    asset.assignedTo,
                    asset.serialNumber
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'assets.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }

        // Close modals when clicking outside
        document.addEventListener('click', function(e) {
            const modal = document.getElementById('assetModal');
            const detailModal = document.getElementById('detailModal');
            
            if (e.target === modal) {
                closeModal();
            }
            if (e.target === detailModal) {
                closeDetailModal();
            }
        });

        // Initialize the app
        document.addEventListener('DOMContentLoaded', initializeData);
    