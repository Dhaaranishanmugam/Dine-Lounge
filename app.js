let userName = "", diningOption = "", menuType = "", cart = {}, currentCategory = "";
let orderCode = "";
    function formatPrice(p)
    { return "₹" + p;

    }
    function getMenuItems()
    {
        return window.menuItems.filter(item => (menuType === "Veg" ? item.veg : !item.veg));
    }
    function getCategoryMenu(cat)
    {
        return getMenuItems().filter(item => item.category === cat);
    }
    function getMenuItem(id) {
            return window.menuItems.find(x => x.id == id);
    }
    function generateOrderCode()
    {
            const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            let code = "";
            for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
            return code;
    }

    function renderCategoryGrid()
    {
    const catList = window.categories
        .filter(cat => getCategoryMenu(cat.label).length > 0)
        .map(cat => `
        <div class="col-6 col-md-4 col-lg-3 mb-3">
            <div class="category-card${currentCategory === cat.label ? " selected" : ""}" data-category="${cat.label}">
            <span class="category-icon">${cat.icon}</span>
            <span class="category-label">${cat.label}</span>
            </div>
        </div>
        `).join("");
        document.getElementById("categoryGrid").innerHTML = catList;

        document.querySelectorAll(".category-card").forEach(card => {
            card.onclick = () => {
            currentCategory = card.getAttribute("data-category");
            renderCategoryGrid();
            renderMenuGrid();
            };
        });
    }

    function renderMenuGrid() {
    const menu = getCategoryMenu(currentCategory);
    let html = "";
    if (menu.length === 0) {
        html = `<div class="col-12 text-center text-muted fs-4 py-5">No items in this category!</div>`;
    }
    menu.forEach(item => {
        const qty = cart[item.id] || 0;
        html += `
        <div class="col-12 col-md-6 col-lg-4">
            <div class="menu-card h-100 shadow-sm">
            <div class="menu-img-box">
                <img src="${item.img}" alt="${item.name}" class="menu-img">
                <!-- <img src="assets/${item.img}" alt="${item.name}" class="menu-img">-->
            </div>
            <div class="menu-body d-flex flex-column">
                <div class="menu-title">${item.name}</div>
                <div class="menu-desc">${item.desc}</div>
                <div class="d-flex align-items-center justify-content-between mt-auto">
                <span class="menu-price">${formatPrice(item.price)}</span>
                <div class="menu-qty-controls">
                    <button class="qty-btn" onclick="changeQty(${item.id},-1)">–</button>
                    <span class="cart-qty">${qty}</span>
                    <button class="qty-btn" onclick="changeQty(${item.id},1)">+</button>
                </div>
                </div>
            </div>
            </div>
        </div>
        `;
    });
    document.getElementById("menuGrid").innerHTML = html;
    }
    window.changeQty = function(id, delta)
    {
        cart[id] = (cart[id] || 0) + delta;
        if (cart[id] < 0) cart[id] = 0;
        if (cart[id] === 0) delete cart[id];
        renderMenuGrid();
        renderCart();
    };

    function renderCart()
    {
        const cartList = document.getElementById("cartList");
        let html = "", total = 0;
        Object.keys(cart).forEach(id => {
            const item = getMenuItem(id);
            if (!item) return;
            const qty = cart[id];
            const price = item.price * qty;
            total += price;
            html += `<li class="list-group-item d-flex justify-content-between align-items-center">
            <span>${item.name} <span class="badge bg-secondary">${qty}</span></span>
            <span class="fw-bold">${formatPrice(price)}</span>
            </li>`;
        });
        if (!html) html = `<li class="list-group-item text-center text-muted fs-6">Your cart is empty.</li>`;
        cartList.innerHTML = html;
        document.getElementById("cartTotal").textContent = formatPrice(total);

        document.getElementById("orderUserName").textContent = userName ? "👤 " + userName : "";
        document.getElementById("orderDining").textContent = diningOption ? "· " + diningOption : "";
    }

    function openConfirmModal()
    {
        const modal = new bootstrap.Modal(document.getElementById("confirmModal"));
        renderReviewCart();
        document.getElementById("confirmAlert").classList.add("d-none");
        modal.show();
    }
    function renderReviewCart()
    {
        let html = "", total = 0;
        Object.keys(cart).forEach(id => {
            const item = getMenuItem(id);
            if (!item) return;
            const qty = cart[id];
            const price = item.price * qty;
            total += price;
            html += `<li class="list-group-item d-flex align-items-center justify-content-between">
            <span>${item.name}</span>
            <div class="d-flex align-items-center">
                <button class="qty-btn me-2" style="background:var(--soft-brown);" onclick="updateReviewQty(${id},-1)">–</button>
                <span class="fs-6">${qty}</span>
                <button class="qty-btn ms-2" style="background:var(--gold);" onclick="updateReviewQty(${id},1)">+</button>
            </div>
            <span class="fw-bold">${formatPrice(price)}</span>
            </li>`;
        });
        document.getElementById("reviewCartList").innerHTML = html || `<li class="list-group-item text-center text-muted fs-6">No items added.</li>`;
        document.getElementById("reviewTotal").textContent = formatPrice(total);
    }
    window.updateReviewQty = function(id, delta)
    {
        cart[id] = (cart[id] || 1) + delta;
        if (cart[id] < 1) delete cart[id];
        renderReviewCart();
        renderCart();
    };

    function openSuccessModal()
    {
        orderCode = generateOrderCode();
        document.getElementById("orderCode").textContent = orderCode;
        document.getElementById("successUserName").textContent = userName;
        const modal = new bootstrap.Modal(document.getElementById("successModal"));
        modal.show();
    }

    function openReceivedModal()
    {
        const modal = new bootstrap.Modal(document.getElementById("receivedModal"));
        modal.show();
    }

    document.addEventListener("DOMContentLoaded", function()
    {
        const userModal = new bootstrap.Modal(document.getElementById("userModal"));
        userModal.show();

        document.querySelectorAll(".opt-btn").forEach(btn => {
            btn.onclick = function() {
            const parent = this.parentElement;
            parent.querySelectorAll(".opt-btn").forEach(b => b.classList.remove("selected"));
            this.classList.add("selected");
            const input = parent.parentElement.querySelector("input[type=hidden]");
            if (input) input.value = this.getAttribute("data-value");
            };
        });

        document.getElementById("userForm").onsubmit = function(e)
        {
            e.preventDefault();
            userName = document.getElementById("userName").value.trim();
            diningOption = document.getElementById("userDining").value;
            menuType = document.getElementById("userMenuType").value;
            if (!userName || !diningOption || !menuType) return;
            userModal.hide();

            const filteredCats = window.categories.filter(cat => getCategoryMenu(cat.label).length > 0);
            currentCategory = filteredCats.length ? filteredCats[0].label : "";
            cart = {};
            renderCategoryGrid();
            renderMenuGrid();
            renderCart();
            document.getElementById("menuGrid").scrollIntoView({behavior:"smooth"});
        };

        document.getElementById("clearCartBtn").onclick = function() {
            cart = {};
            renderMenuGrid();
            renderCart();
        };
        document.getElementById("proceedBtn").onclick = function() {
            if (Object.keys(cart).length === 0) {
            const alert = document.getElementById("confirmAlert");
            alert.textContent = "Please add items to your order.";
            alert.classList.remove("d-none");
            const modal = new bootstrap.Modal(document.getElementById("confirmModal"));
            modal.show();
            return;
            }
            openConfirmModal();
        };

        document.getElementById("backToMenuBtn").onclick = function() {
            const modal = bootstrap.Modal.getInstance(document.getElementById("confirmModal"));
            modal.hide();
        };
        document.getElementById("confirmOrderBtn").onclick = function() {
            if (Object.keys(cart).length === 0) {
            document.getElementById("confirmAlert").classList.remove("d-none");
            return;
            }
            const modal = bootstrap.Modal.getInstance(document.getElementById("confirmModal"));
            modal.hide();
            setTimeout(openSuccessModal, 500);
        };

        document.getElementById("newOrderBtn").onclick = function() {
            const modal = bootstrap.Modal.getInstance(document.getElementById("successModal"));
            modal.hide();
            setTimeout(openReceivedModal, 300);
        };
        document.getElementById("receivedNewOrderBtn").onclick = function() {
            const modal = bootstrap.Modal.getInstance(document.getElementById("receivedModal"));
            modal.hide();
            setTimeout(() => {
            userName = "";
            diningOption = "";
            menuType = "";
            cart = {};
            orderCode = "";
            document.getElementById("userForm").reset();
            document.querySelectorAll(".opt-btn").forEach(b => b.classList.remove("selected"));
            userModal.show();
            renderCart();
            document.getElementById("menuGrid").innerHTML = "";
            document.getElementById("categoryGrid").innerHTML = "";
            }, 300);
        };

        function adjustOrderSummary()
        {
            const aside = document.getElementById("orderSummary");
            if (window.innerWidth < 1200) aside.classList.add("static-pos");
            else aside.classList.remove("static-pos");
        }
        window.addEventListener("resize", adjustOrderSummary);
        adjustOrderSummary();
    });