// 酒店管理系统 - 完整前端逻辑
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化...');

    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkInDate').value = today;

    // 设置默认离店日期为明天
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('expectedCheckOutDate').value = tomorrow.toISOString().split('T')[0];

    // 初始化所有数据
    initializeAllData();

    // 绑定所有事件监听器
    bindAllEventListeners();
});

// API基础URL
const API_BASE = 'http://localhost:8080/api';

// ==================== 初始化函数 ====================

// 初始化所有数据
function initializeAllData() {
    loadGuests();
    loadRooms();
    loadAvailableRooms();
    loadAccountData();
}

// 加载账务相关数据
function loadAccountData() {
    loadCurrentGuests();
    loadAccountTypes();
    loadConsumptionItems();
    loadUnsettledAccounts();
    loadAdvancePayments();
    loadCheckoutRecords();
}

// ==================== 事件监听器绑定 ====================

// 绑定所有事件监听器
function bindAllEventListeners() {
    bindNavigationEvents();
    bindGuestManagementEvents();
    bindRoomManagementEvents();
    bindCheckInEvents();
    bindAccountManagementEvents();
    bindCheckoutEvents();
}

// 绑定导航事件
function bindNavigationEvents() {
    // 侧边栏导航
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // 更新活动链接
            document.querySelectorAll('.sidebar .nav-link').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');

            // 显示对应内容区域
            const sectionId = this.getAttribute('data-section');
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.add('d-none');
            });
            document.getElementById(sectionId).classList.remove('d-none');

            // 特殊处理
            if (sectionId === 'check-in') {
                console.log('切换到办理入住，重新加载房间');
                loadAvailableRooms();
            } else if (sectionId === 'account-management' || sectionId === 'checkout-management') {
                console.log('切换到账务管理，加载账务数据');
                loadAccountData();
            }
        });
    });
}

// 绑定客人管理事件
function bindGuestManagementEvents() {
    // 客人管理相关事件
    document.getElementById('add-guest-btn').addEventListener('click', function() {
        showGuestModal();
    });

    document.getElementById('refresh-guests-btn').addEventListener('click', function() {
        loadGuests();
    });

    document.getElementById('search-guest-btn').addEventListener('click', function() {
        const name = document.getElementById('search-guest').value;
        if (name) {
            searchGuests(name);
        } else {
            loadGuests();
        }
    });

    // 客人模态框保存按钮
    document.getElementById('save-guest-btn').addEventListener('click', function() {
        saveGuest();
    });
}

// 绑定房间管理事件
function bindRoomManagementEvents() {
    // 房间管理相关事件
    document.getElementById('add-room-btn').addEventListener('click', function() {
        showRoomModal();
    });

    document.getElementById('refresh-rooms-btn').addEventListener('click', function() {
        loadRooms();
    });

    document.getElementById('show-available-rooms-btn').addEventListener('click', function() {
        loadAvailableRoomsTable();
    });

    document.getElementById('show-all-rooms-btn').addEventListener('click', function() {
        loadRooms();
    });

    // 房间模态框保存按钮
    document.getElementById('save-room-btn').addEventListener('click', function() {
        saveRoom();
    });
}

// 绑定入住办理事件
function bindCheckInEvents() {
    // 办理入住相关事件
    document.getElementById('refresh-available-rooms').addEventListener('click', function() {
        console.log('手动刷新房间列表');
        loadAvailableRooms();
    });

    // 办理入住表单提交
    document.getElementById('check-in-form').addEventListener('submit', function(e) {
        e.preventDefault();
        checkInGuest();
    });
}

// 绑定账务管理事件
function bindAccountManagementEvents() {
    // 消费入账表单提交
    document.getElementById('consumption-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addConsumption();
    });

    // 消费项目选择事件
    document.getElementById('consumption-item').addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const price = selectedOption.getAttribute('data-price');
        document.getElementById('unit-price').value = price || '';
        calculateTotalAmount();
    });

    // 数量输入事件
    document.getElementById('quantity').addEventListener('input', function() {
        calculateTotalAmount();
    });

    // 预付款表单提交
    document.getElementById('advance-payment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addAdvancePayment();
    });

    // 客人选择事件（账务查询）
    document.getElementById('query-guest').addEventListener('change', function() {
        const guestId = this.value;
        if (guestId) {
            loadGuestAccounts(guestId);
            loadUnsettledAmount(guestId);
        } else {
            document.getElementById('guest-accounts-table').innerHTML = '';
            document.getElementById('unsettled-amount-display').textContent = '¥ 0.00';
        }
    });
}

// 绑定结账事件
function bindCheckoutEvents() {
    // 结账表单提交
    document.getElementById('checkout-form').addEventListener('submit', function(e) {
        e.preventDefault();
        processCheckout();
    });

    // 实付金额输入事件
    document.getElementById('actual-payment').addEventListener('input', function() {
        calculateChange();
    });

    // 结账客人选择事件
    document.getElementById('checkout-guest').addEventListener('change', function() {
        const guestId = this.value;
        if (guestId) {
            calculateCheckoutAmount(guestId);
        } else {
            resetCheckoutForm();
        }
    });

    // 打印收据按钮
    document.getElementById('print-receipt-btn').addEventListener('click', function() {
        showReceipt();
    });
}

// ==================== 客人管理功能 ====================

// 加载客人列表
function loadGuests() {
    fetch(`${API_BASE}/guests`)
        .then(response => response.json())
        .then(guests => {
            const tbody = document.getElementById('guest-table-body');
            tbody.innerHTML = '';

            if (guests.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="10" class="text-center">暂无客人数据</td>`;
                tbody.appendChild(row);
                return;
            }

            guests.forEach(guest => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${guest.id}</td>
                    <td>${guest.name}</td>
                    <td>${guest.gender}</td>
                    <td>${guest.origin || '-'}</td>
                    <td>${guest.workUnit || '-'}</td>
                    <td>${guest.profession || '-'}</td>
                    <td>${guest.checkInDate}</td>
                    <td>${guest.expectedCheckOutDate}</td>
                    <td>${guest.roomNumber}</td>
                    <td class="table-actions">
                        <button class="btn btn-sm btn-primary" onclick="editGuest(${guest.id})">编辑</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteGuest(${guest.id})">删除</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading guests:', error);
            alert('加载客人列表失败');
        });
}

// 搜索客人
function searchGuests(name) {
    fetch(`${API_BASE}/guests/search?name=${encodeURIComponent(name)}`)
        .then(response => response.json())
        .then(guests => {
            const tbody = document.getElementById('guest-table-body');
            tbody.innerHTML = '';

            if (guests.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="10" class="text-center">未找到相关客人</td>`;
                tbody.appendChild(row);
                return;
            }

            guests.forEach(guest => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${guest.id}</td>
                    <td>${guest.name}</td>
                    <td>${guest.gender}</td>
                    <td>${guest.origin || '-'}</td>
                    <td>${guest.workUnit || '-'}</td>
                    <td>${guest.profession || '-'}</td>
                    <td>${guest.checkInDate}</td>
                    <td>${guest.expectedCheckOutDate}</td>
                    <td>${guest.roomNumber}</td>
                    <td class="table-actions">
                        <button class="btn btn-sm btn-primary" onclick="editGuest(${guest.id})">编辑</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteGuest(${guest.id})">删除</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error searching guests:', error);
            alert('搜索客人失败');
        });
}

// 显示客人编辑模态框
function showGuestModal(guest = null) {
    const modal = new bootstrap.Modal(document.getElementById('guestModal'));
    const title = document.getElementById('guestModalTitle');

    // 先加载可用房间
    loadAvailableRoomsForModal().then(() => {
        if (guest) {
            title.textContent = '编辑客人信息';
            document.getElementById('guest-id').value = guest.id;
            document.getElementById('modal-name').value = guest.name;
            document.getElementById('modal-gender').value = guest.gender;
            document.getElementById('modal-origin').value = guest.origin || '';
            document.getElementById('modal-workUnit').value = guest.workUnit || '';
            document.getElementById('modal-profession').value = guest.profession || '';
            document.getElementById('modal-reasonForStay').value = guest.reasonForStay || '';
            document.getElementById('modal-checkInDate').value = guest.checkInDate;
            document.getElementById('modal-expectedCheckOutDate').value = guest.expectedCheckOutDate;
            document.getElementById('modal-roomNumber').value = guest.roomNumber;
            document.getElementById('modal-roomChangeHistory').value = guest.roomChangeHistory || '';
        } else {
            title.textContent = '新增客人';
            document.getElementById('guest-form').reset();
            document.getElementById('guest-id').value = '';

            // 设置默认日期
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('modal-checkInDate').value = today;

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            document.getElementById('modal-expectedCheckOutDate').value = tomorrow.toISOString().split('T')[0];
        }

        modal.show();
    });
}

// 为模态框加载可用房间
function loadAvailableRoomsForModal() {
    return fetch(`${API_BASE}/rooms/available`)
        .then(response => response.json())
        .then(rooms => {
            const modalSelect = document.getElementById('modal-roomNumber');
            modalSelect.innerHTML = '<option value="">请选择房间</option>';

            if (rooms.length > 0) {
                rooms.forEach(room => {
                    const option = document.createElement('option');
                    option.value = room.roomNumber;
                    option.textContent = `${room.roomNumber} - ${room.roomType || '未知房型'} (¥${room.price || '0'})`;
                    modalSelect.appendChild(option);
                });
            }
        });
}

// 编辑客人
function editGuest(id) {
    fetch(`${API_BASE}/guests/${id}`)
        .then(response => response.json())
        .then(guest => {
            showGuestModal(guest);
        })
        .catch(error => {
            console.error('Error fetching guest:', error);
            alert('获取客人信息失败');
        });
}

// 保存客人信息
function saveGuest() {
    const id = document.getElementById('guest-id').value;
    const guestData = {
        name: document.getElementById('modal-name').value,
        gender: document.getElementById('modal-gender').value,
        origin: document.getElementById('modal-origin').value,
        workUnit: document.getElementById('modal-workUnit').value,
        profession: document.getElementById('modal-profession').value,
        reasonForStay: document.getElementById('modal-reasonForStay').value,
        checkInDate: document.getElementById('modal-checkInDate').value,
        expectedCheckOutDate: document.getElementById('modal-expectedCheckOutDate').value,
        roomNumber: document.getElementById('modal-roomNumber').value,
        roomChangeHistory: document.getElementById('modal-roomChangeHistory').value
    };

    const url = id ? `${API_BASE}/guests/${id}` : `${API_BASE}/guests`;
    const method = id ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(guestData)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(guest => {
            bootstrap.Modal.getInstance(document.getElementById('guestModal')).hide();
            alert('保存成功！');
            loadGuests();
            loadAvailableRooms();
            loadCurrentGuests(); // 更新当前客人列表
        })
        .catch(error => {
            console.error('Error saving guest:', error);
            alert('保存失败: ' + error.message);
        });
}

// 删除客人
function deleteGuest(id) {
    if (confirm('确定要删除这位客人吗？')) {
        fetch(`${API_BASE}/guests/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    alert('删除成功！');
                    loadGuests();
                    loadAvailableRooms();
                    loadCurrentGuests(); // 更新当前客人列表
                } else {
                    throw new Error('删除失败');
                }
            })
            .catch(error => {
                console.error('Error deleting guest:', error);
                alert('删除失败');
            });
    }
}

// ==================== 房间管理功能 ====================

// 加载房间列表
function loadRooms() {
    fetch(`${API_BASE}/rooms`)
        .then(response => response.json())
        .then(rooms => {
            const tbody = document.getElementById('room-table-body');
            tbody.innerHTML = '';

            if (rooms.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="6" class="text-center">暂无房间数据</td>`;
                tbody.appendChild(row);
                return;
            }

            rooms.forEach(room => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${room.id}</td>
                    <td>${room.roomNumber}</td>
                    <td>${room.roomType || '-'}</td>
                    <td>${room.price ? '¥' + room.price : '-'}</td>
                    <td>
                        <span class="badge ${getStatusBadgeClass(room.status)}">
                            ${getStatusText(room.status)}
                        </span>
                    </td>
                    <td class="table-actions">
                        <button class="btn btn-sm btn-primary" onclick="editRoom(${room.id})">编辑</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteRoom(${room.id})">删除</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading rooms:', error);
            alert('加载房间列表失败');
        });
}

// 加载可用房间列表（用于下拉选择）
function loadAvailableRooms() {
    console.log('开始加载可用房间...');

    fetch(`${API_BASE}/rooms/available`)
        .then(response => {
            console.log('房间API响应状态:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(rooms => {
            console.log('成功获取房间数据:', rooms);

            // 更新办理入住表单的房间选择
            const select = document.getElementById('roomNumber');
            if (select) {
                select.innerHTML = '<option value="">请选择房间</option>';

                if (rooms.length === 0) {
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = '暂无可用房间';
                    option.disabled = true;
                    select.appendChild(option);
                    console.warn('没有可用房间');
                } else {
                    rooms.forEach(room => {
                        const option = document.createElement('option');
                        option.value = room.roomNumber;
                        option.textContent = `${room.roomNumber} - ${room.roomType || '未知房型'} (¥${room.price || '0'})`;
                        select.appendChild(option);
                    });
                    console.log(`填充了 ${rooms.length} 个房间选项`);
                }
            }

            // 同时更新模态框中的房间选择
            const modalSelect = document.getElementById('modal-roomNumber');
            if (modalSelect) {
                modalSelect.innerHTML = '<option value="">请选择房间</option>';

                if (rooms.length > 0) {
                    rooms.forEach(room => {
                        const option = document.createElement('option');
                        option.value = room.roomNumber;
                        option.textContent = `${room.roomNumber} - ${room.roomType || '未知房型'} (¥${room.price || '0'})`;
                        modalSelect.appendChild(option);
                    });
                }
            }
        })
        .catch(error => {
            console.error('加载可用房间失败:', error);

            // 显示用户友好的错误信息
            const select = document.getElementById('roomNumber');
            if (select) {
                select.innerHTML = '<option value="">加载房间失败，请检查网络连接</option>';
            }

            const modalSelect = document.getElementById('modal-roomNumber');
            if (modalSelect) {
                modalSelect.innerHTML = '<option value="">加载房间失败，请检查网络连接</option>';
            }

            alert('无法加载房间列表，请检查后端服务是否正常运行');
        });
}

// 加载可用房间表格
function loadAvailableRoomsTable() {
    fetch(`${API_BASE}/rooms/available`)
        .then(response => response.json())
        .then(rooms => {
            const tbody = document.getElementById('room-table-body');
            tbody.innerHTML = '';

            if (rooms.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="6" class="text-center">暂无可用房间</td>`;
                tbody.appendChild(row);
                return;
            }

            rooms.forEach(room => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${room.id}</td>
                    <td>${room.roomNumber}</td>
                    <td>${room.roomType || '-'}</td>
                    <td>${room.price ? '¥' + room.price : '-'}</td>
                    <td>
                        <span class="badge ${getStatusBadgeClass(room.status)}">
                            ${getStatusText(room.status)}
                        </span>
                    </td>
                    <td class="table-actions">
                        <button class="btn btn-sm btn-primary" onclick="editRoom(${room.id})">编辑</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteRoom(${room.id})">删除</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading available rooms:', error);
            alert('加载可用房间失败');
        });
}

// 显示房间编辑模态框
function showRoomModal(room = null) {
    const modal = new bootstrap.Modal(document.getElementById('roomModal'));
    const title = document.getElementById('roomModalTitle');

    if (room) {
        title.textContent = '编辑房间信息';
        document.getElementById('room-id').value = room.id;
        document.getElementById('modal-room-number').value = room.roomNumber;
        document.getElementById('modal-room-type').value = room.roomType || '';
        document.getElementById('modal-room-price').value = room.price || '';
        document.getElementById('modal-room-status').value = room.status;
    } else {
        title.textContent = '新增房间';
        document.getElementById('room-form').reset();
        document.getElementById('room-id').value = '';
    }

    modal.show();
}

// 编辑房间
function editRoom(id) {
    fetch(`${API_BASE}/rooms/${id}`)
        .then(response => response.json())
        .then(room => {
            showRoomModal(room);
        })
        .catch(error => {
            console.error('Error fetching room:', error);
            alert('获取房间信息失败');
        });
}

// 保存房间信息
function saveRoom() {
    const id = document.getElementById('room-id').value;
    const roomData = {
        roomNumber: document.getElementById('modal-room-number').value,
        roomType: document.getElementById('modal-room-type').value,
        price: document.getElementById('modal-room-price').value ?
            parseFloat(document.getElementById('modal-room-price').value) : null,
        status: document.getElementById('modal-room-status').value
    };

    const url = id ? `${API_BASE}/rooms/${id}` : `${API_BASE}/rooms`;
    const method = id ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(roomData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('保存失败');
            }
            return response.json();
        })
        .then(room => {
            bootstrap.Modal.getInstance(document.getElementById('roomModal')).hide();
            alert('保存成功！');
            loadRooms();
            loadAvailableRooms();
        })
        .catch(error => {
            console.error('Error saving room:', error);
            alert('保存失败');
        });
}

// 删除房间
function deleteRoom(id) {
    if (confirm('确定要删除这个房间吗？')) {
        fetch(`${API_BASE}/rooms/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    alert('删除成功！');
                    loadRooms();
                    loadAvailableRooms();
                } else {
                    throw new Error('删除失败');
                }
            })
            .catch(error => {
                console.error('Error deleting room:', error);
                alert('删除失败');
            });
    }
}

// ==================== 入住办理功能 ====================

// 办理入住
function checkInGuest() {
    const guestData = {
        name: document.getElementById('name').value,
        gender: document.getElementById('gender').value,
        origin: document.getElementById('origin').value,
        workUnit: document.getElementById('workUnit').value,
        profession: document.getElementById('profession').value,
        reasonForStay: document.getElementById('reasonForStay').value,
        checkInDate: document.getElementById('checkInDate').value,
        expectedCheckOutDate: document.getElementById('expectedCheckOutDate').value,
        roomNumber: document.getElementById('roomNumber').value
    };

    fetch(`${API_BASE}/guests`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(guestData)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(guest => {
            alert('入住办理成功！');
            document.getElementById('check-in-form').reset();

            // 重置日期为默认值
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('checkInDate').value = today;

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            document.getElementById('expectedCheckOutDate').value = tomorrow.toISOString().split('T')[0];

            // 刷新可用房间列表和客人列表
            loadAvailableRooms();
            loadGuests();
            loadCurrentGuests(); // 更新当前客人列表
        })
        .catch(error => {
            console.error('Error checking in guest:', error);
            alert('办理入住失败: ' + error.message);
        });
}

// ==================== 账务管理功能 ====================

// 加载当前在住客人
function loadCurrentGuests() {
    fetch(`${API_BASE}/guests/current`)
        .then(response => response.json())
        .then(guests => {
            const guestSelects = [
                'consumption-guest',
                'advance-guest',
                'query-guest',
                'checkout-guest'
            ];

            guestSelects.forEach(selectId => {
                const select = document.getElementById(selectId);
                select.innerHTML = '<option value="">请选择客人</option>';

                guests.forEach(guest => {
                    const option = document.createElement('option');
                    option.value = guest.id;
                    option.textContent = `${guest.name} (${guest.roomNumber})`;
                    option.setAttribute('data-room', guest.roomNumber);
                    select.appendChild(option);
                });
            });
        })
        .catch(error => {
            console.error('Error loading current guests:', error);
        });
}

// 加载账务类型
function loadAccountTypes() {
    fetch(`${API_BASE}/accounts/account-types`)
        .then(response => response.json())
        .then(types => {
            const select = document.getElementById('account-type');
            select.innerHTML = '<option value="">请选择类型</option>';

            types.forEach(type => {
                const option = document.createElement('option');
                option.value = type.typeName;
                option.textContent = type.typeName;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading account types:', error);
        });
}

// 加载消费项目
function loadConsumptionItems() {
    fetch(`${API_BASE}/accounts/consumption-items`)
        .then(response => response.json())
        .then(items => {
            const select = document.getElementById('consumption-item');
            select.innerHTML = '<option value="">请选择项目</option>';

            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item.itemName;
                option.textContent = `${item.itemName} (¥${item.price})`;
                option.setAttribute('data-price', item.price);
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading consumption items:', error);
        });
}

// 计算消费总金额
function calculateTotalAmount() {
    const unitPrice = parseFloat(document.getElementById('unit-price').value) || 0;
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    const totalAmount = unitPrice * quantity;
    document.getElementById('total-amount').value = totalAmount.toFixed(2);
}

// 添加消费记录
function addConsumption() {
    const guestSelect = document.getElementById('consumption-guest');
    const selectedGuest = guestSelect.options[guestSelect.selectedIndex];
    const guestId = guestSelect.value;
    const roomNumber = selectedGuest.getAttribute('data-room');

    const consumptionData = {
        guestId: parseInt(guestId),
        roomNumber: roomNumber,
        accountType: document.getElementById('account-type').value,
        itemName: document.getElementById('consumption-item').value,
        quantity: parseInt(document.getElementById('quantity').value) || 1,
        unitPrice: parseFloat(document.getElementById('unit-price').value),
        totalAmount: parseFloat(document.getElementById('total-amount').value),
        consumptionDate: document.getElementById('consumption-date').value || new Date().toISOString().split('T')[0]
    };

    fetch(`${API_BASE}/accounts/guest-accounts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(consumptionData)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(account => {
            alert('消费记录添加成功！');
            document.getElementById('consumption-form').reset();
            loadUnsettledAccounts();
        })
        .catch(error => {
            console.error('Error adding consumption:', error);
            alert('添加消费记录失败: ' + error.message);
        });
}

// 加载未结账消费记录
function loadUnsettledAccounts() {
    fetch(`${API_BASE}/accounts/guest-accounts/unsettled`)
        .then(response => response.json())
        .then(accounts => {
            const tbody = document.getElementById('unsettled-accounts-table');
            tbody.innerHTML = '';

            if (accounts.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="10" class="text-center">暂无未结账消费记录</td>`;
                tbody.appendChild(row);
                return;
            }

            accounts.forEach(account => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${account.id}</td>
                    <td>${account.guestName || '未知'}</td>
                    <td>${account.roomNumber}</td>
                    <td>${account.accountType}</td>
                    <td>${account.itemName}</td>
                    <td>${account.quantity}</td>
                    <td>¥${account.unitPrice}</td>
                    <td>¥${account.totalAmount}</td>
                    <td>${account.consumptionDate}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteAccount(${account.id})">删除</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading unsettled accounts:', error);
        });
}

// 删除消费记录
function deleteAccount(id) {
    if (confirm('确定要删除这条消费记录吗？')) {
        fetch(`${API_BASE}/accounts/guest-accounts/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    alert('删除成功！');
                    loadUnsettledAccounts();
                } else {
                    throw new Error('删除失败');
                }
            })
            .catch(error => {
                console.error('Error deleting account:', error);
                alert('删除失败');
            });
    }
}

// 添加预付款记录
function addAdvancePayment() {
    const guestSelect = document.getElementById('advance-guest');
    const selectedGuest = guestSelect.options[guestSelect.selectedIndex];
    const guestId = guestSelect.value;
    const roomNumber = selectedGuest.getAttribute('data-room');

    const paymentData = {
        guestId: parseInt(guestId),
        roomNumber: roomNumber,
        paymentAmount: parseFloat(document.getElementById('payment-amount').value),
        paymentMethod: document.getElementById('payment-method').value,
        paymentDate: document.getElementById('payment-date').value || new Date().toISOString().split('T')[0],
        remark: document.getElementById('payment-remark').value
    };

    fetch(`${API_BASE}/accounts/advance-payments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(payment => {
            alert('预付款记录添加成功！');
            document.getElementById('advance-payment-form').reset();
            loadAdvancePayments();
        })
        .catch(error => {
            console.error('Error adding advance payment:', error);
            alert('添加预付款记录失败: ' + error.message);
        });
}

// 加载预付款记录
function loadAdvancePayments() {
    fetch(`${API_BASE}/accounts/advance-payments`)
        .then(response => response.json())
        .then(payments => {
            const tbody = document.getElementById('advance-payments-table');
            tbody.innerHTML = '';

            if (payments.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="7" class="text-center">暂无预付款记录</td>`;
                tbody.appendChild(row);
                return;
            }

            payments.forEach(payment => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${payment.id}</td>
                    <td>${payment.guestName || '未知'}</td>
                    <td>${payment.roomNumber}</td>
                    <td>¥${payment.paymentAmount}</td>
                    <td>${payment.paymentMethod}</td>
                    <td>${payment.paymentDate}</td>
                    <td>${payment.remark || '-'}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading advance payments:', error);
        });
}

// 加载客人账务记录
function loadGuestAccounts(guestId) {
    fetch(`${API_BASE}/accounts/guest-accounts/guest/${guestId}`)
        .then(response => response.json())
        .then(accounts => {
            const tbody = document.getElementById('guest-accounts-table');
            tbody.innerHTML = '';

            if (accounts.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="8" class="text-center">该客人暂无消费记录</td>`;
                tbody.appendChild(row);
                return;
            }

            accounts.forEach(account => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${account.id}</td>
                    <td>${account.accountType}</td>
                    <td>${account.itemName}</td>
                    <td>${account.quantity}</td>
                    <td>¥${account.unitPrice}</td>
                    <td>¥${account.totalAmount}</td>
                    <td>${account.consumptionDate}</td>
                    <td>
                        <span class="badge ${account.isSettled ? 'bg-success' : 'bg-warning'}">
                            ${account.isSettled ? '已结账' : '未结账'}
                        </span>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading guest accounts:', error);
        });
}

// 加载客人欠款金额
function loadUnsettledAmount(guestId) {
    fetch(`${API_BASE}/accounts/unsettled-amount/guest/${guestId}`)
        .then(response => response.json())
        .then(amount => {
            document.getElementById('unsettled-amount-display').textContent = `¥ ${amount.toFixed(2)}`;
        })
        .catch(error => {
            console.error('Error loading unsettled amount:', error);
        });
}

// ==================== 结账管理功能 ====================

// 计算结账金额
function calculateCheckoutAmount(guestId) {
    // 获取客人未结账消费总额
    fetch(`${API_BASE}/accounts/guest-accounts/unsettled/guest/${guestId}`)
        .then(response => response.json())
        .then(accounts => {
            let totalConsumption = 0;
            accounts.forEach(account => {
                totalConsumption += parseFloat(account.totalAmount);
            });

            document.getElementById('total-consumption').value = totalConsumption.toFixed(2);

            // 获取预付款总额
            return fetch(`${API_BASE}/accounts/advance-payments/guest/${guestId}`);
        })
        .then(response => response.json())
        .then(payments => {
            let totalAdvance = 0;
            payments.forEach(payment => {
                totalAdvance += parseFloat(payment.paymentAmount);
            });

            document.getElementById('total-advance').value = totalAdvance.toFixed(2);

            const netAmount = parseFloat(document.getElementById('total-consumption').value) - totalAdvance;
            document.getElementById('net-amount').value = netAmount > 0 ? netAmount.toFixed(2) : '0.00';
        })
        .catch(error => {
            console.error('Error calculating checkout amount:', error);
        });
}

// 计算找零金额
function calculateChange() {
    const netAmount = parseFloat(document.getElementById('net-amount').value) || 0;
    const actualPayment = parseFloat(document.getElementById('actual-payment').value) || 0;

    if (actualPayment > netAmount) {
        document.getElementById('change-amount').value = (actualPayment - netAmount).toFixed(2);
    } else {
        document.getElementById('change-amount').value = '0.00';
    }
}

// 处理结账
function processCheckout() {
    const guestId = document.getElementById('checkout-guest').value;
    const paymentMethod = document.getElementById('checkout-payment-method').value;
    const actualPayment = parseFloat(document.getElementById('actual-payment').value);
    const remark = document.getElementById('checkout-remark').value;

    const checkoutData = {
        guestId: parseInt(guestId),
        paymentMethod: paymentMethod,
        actualPayment: actualPayment,
        remark: remark
    };

    fetch(`${API_BASE}/accounts/checkout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkoutData)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(record => {
            alert('结账成功！收据号: ' + record.receiptNumber);

            // 保存结账记录用于打印
            window.lastCheckoutRecord = record;

            // 显示打印按钮
            document.getElementById('print-receipt-btn').style.display = 'inline-block';

            // 刷新相关数据
            loadUnsettledAccounts();
            loadCheckoutRecords();
            loadGuests(); // 刷新客人列表（因为结账后客人会被删除）
            loadCurrentGuests(); // 刷新当前客人列表
            resetCheckoutForm();
        })
        .catch(error => {
            console.error('Error processing checkout:', error);
            alert('结账失败: ' + error.message);
        });
}

// 重置结账表单
function resetCheckoutForm() {
    document.getElementById('total-consumption').value = '';
    document.getElementById('total-advance').value = '';
    document.getElementById('net-amount').value = '';
    document.getElementById('actual-payment').value = '';
    document.getElementById('change-amount').value = '';
    document.getElementById('checkout-remark').value = '';
    document.getElementById('print-receipt-btn').style.display = 'none';
}

// 加载结账记录
function loadCheckoutRecords() {
    fetch(`${API_BASE}/accounts/checkout-records`)
        .then(response => response.json())
        .then(records => {
            const tbody = document.getElementById('checkout-records-table');
            tbody.innerHTML = '';

            if (records.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="10" class="text-center">暂无结账记录</td>`;
                tbody.appendChild(row);
                return;
            }

            records.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${record.id}</td>
                    <td>${record.guestName || '未知'}</td>
                    <td>${record.roomNumber}</td>
                    <td>¥${record.totalAmount}</td>
                    <td>¥${record.advancePayment}</td>
                    <td>¥${record.actualPayment}</td>
                    <td>¥${record.changeAmount}</td>
                    <td>${record.paymentMethod}</td>
                    <td>${record.checkoutDate}</td>
                    <td>${record.receiptNumber}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading checkout records:', error);
        });
}

// 显示收据
function showReceipt() {
    if (!window.lastCheckoutRecord) {
        alert('没有可打印的收据');
        return;
    }

    const record = window.lastCheckoutRecord;
    const receiptContent = document.getElementById('receipt-content');

    receiptContent.innerHTML = `
        <div class="receipt" id="printable-receipt" style="font-family: 'Courier New', monospace; font-size: 14px;">
            <div class="text-center mb-3">
                <h4>酒店结账收据</h4>
                <p>收据号: ${record.receiptNumber}</p>
                <p>日期: ${record.checkoutDate}</p>
            </div>
            
            <table class="table table-bordered">
                <tr>
                    <td><strong>客人姓名:</strong></td>
                    <td>${record.guestName || '未知'}</td>
                </tr>
                <tr>
                    <td><strong>房间号:</strong></td>
                    <td>${record.roomNumber}</td>
                </tr>
                <tr>
                    <td><strong>总消费金额:</strong></td>
                    <td>¥${record.totalAmount}</td>
                </tr>
                <tr>
                    <td><strong>预付款:</strong></td>
                    <td>¥${record.advancePayment}</td>
                </tr>
                <tr>
                    <td><strong>应付金额:</strong></td>
                    <td>¥${(record.totalAmount - record.advancePayment).toFixed(2)}</td>
                </tr>
                <tr>
                    <td><strong>实付金额:</strong></td>
                    <td>¥${record.actualPayment}</td>
                </tr>
                <tr>
                    <td><strong>找零金额:</strong></td>
                    <td>¥${record.changeAmount}</td>
                </tr>
                <tr>
                    <td><strong>付款方式:</strong></td>
                    <td>${record.paymentMethod}</td>
                </tr>
            </table>
            
            <div class="mt-4 text-center">
                <p>感谢您的光临！</p>
                <p>欢迎再次入住！</p>
            </div>
        </div>
    `;

    const receiptModal = new bootstrap.Modal(document.getElementById('receiptModal'));
    receiptModal.show();
}

// 打印收据
function printReceipt() {
    const printContent = document.getElementById('printable-receipt').innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;

    // 重新绑定事件
    bindAllEventListeners();
}

// ==================== 辅助函数 ====================

// 辅助函数：获取状态对应的徽章类
function getStatusBadgeClass(status) {
    switch (status) {
        case 'AVAILABLE': return 'bg-success';
        case 'OCCUPIED': return 'bg-warning';
        case 'MAINTENANCE': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

// 辅助函数：获取状态对应的文本
function getStatusText(status) {
    switch (status) {
        case 'AVAILABLE': return '可用';
        case 'OCCUPIED': return '已占用';
        case 'MAINTENANCE': return '维护中';
        default: return status;
    }
}

// ==================== 全局函数（供HTML内联调用） ====================

// 这些函数需要在全局作用域中，以便HTML中的onclick属性可以调用

// 编辑客人（全局函数）
window.editGuest = function(id) {
    fetch(`${API_BASE}/guests/${id}`)
        .then(response => response.json())
        .then(guest => {
            showGuestModal(guest);
        })
        .catch(error => {
            console.error('Error fetching guest:', error);
            alert('获取客人信息失败');
        });
};

// 删除客人（全局函数）
window.deleteGuest = function(id) {
    if (confirm('确定要删除这位客人吗？')) {
        fetch(`${API_BASE}/guests/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    alert('删除成功！');
                    loadGuests();
                    loadAvailableRooms();
                    loadCurrentGuests(); // 更新当前客人列表
                } else {
                    throw new Error('删除失败');
                }
            })
            .catch(error => {
                console.error('Error deleting guest:', error);
                alert('删除失败');
            });
    }
};

// 编辑房间（全局函数）
window.editRoom = function(id) {
    fetch(`${API_BASE}/rooms/${id}`)
        .then(response => response.json())
        .then(room => {
            showRoomModal(room);
        })
        .catch(error => {
            console.error('Error fetching room:', error);
            alert('获取房间信息失败');
        });
};

// 删除房间（全局函数）
window.deleteRoom = function(id) {
    if (confirm('确定要删除这个房间吗？')) {
        fetch(`${API_BASE}/rooms/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    alert('删除成功！');
                    loadRooms();
                    loadAvailableRooms();
                } else {
                    throw new Error('删除失败');
                }
            })
            .catch(error => {
                console.error('Error deleting room:', error);
                alert('删除失败');
            });
    }
};

// 删除消费记录（全局函数）
window.deleteAccount = function(id) {
    if (confirm('确定要删除这条消费记录吗？')) {
        fetch(`${API_BASE}/accounts/guest-accounts/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    alert('删除成功！');
                    loadUnsettledAccounts();
                } else {
                    throw new Error('删除失败');
                }
            })
            .catch(error => {
                console.error('Error deleting account:', error);
                alert('删除失败');
            });
    }
};

// 打印收据（全局函数）
window.printReceipt = printReceipt;