let latestOrderKey = null;

const menu = {
  lao: [
    { name: "เหลาม้า+กุ้งสด+หอยแครง", price: 170 },
    { name: "เหลาปูม้า+กุ้งสด", price: 150 },
    { name: "เหลาปูม้า+หอยแครง", price: 160 },
    { name: "เหลากุ้งสด+หอยโข่ง", price: 150 },
    { name: "เหลาหอยแครง/หอยโข่ง", price: 100 },
    { name: "เหลากุ้งสด/กุ้งสุก", price: 100 },
    { name: "เหลาหอยแครง+กุ้งสด", price: 120 }
  ],
  season: [
    { name: "ตำส้มโอ", price: 45 },
    { name: "ตำกระท้อน", price: 45 },
    { name: "ตำมะม่วง", price: 45 },
    { name: "ตำผลไม้", price: 50 },
    { name: "ตำข้าวโพด", price: 45 }
  ],
  tum: [
    { name: "ตำปูม้า+หอยแครง+กุ้งสด", price: 150 },
    { name: "ตำปูม้า+หอยแครง", price: 130 },
    { name: "ตำปูม้า+กุ้งสด", price: 120 },
    { name: "ตำกุ้งสด+หอยแครง", price: 90 },
    { name: "ตำกุ้งสุก", price: 90 },
    { name: "ตำปูม้าสด", price: 90 },
    { name: "ตำหอยแครง", price: 80 },
    { name: "ตำหอยโข่ง", price: 80 },
    { name: "ตำกุ้งสุก+ไข่ลูก", price: 60 },
    { name: "ตำทะเลน้อย", price: 60 },
    { name: "ตำปูปลาร้า", price: 40 },
    { name: "ตำลาว", price: 40 },
    { name: "ตำไทย", price: 40 },
    { name: "ตำโคราช", price: 40 },
    { name: "ตำแดง", price: 40 },
    { name: "ตำถั่วฝักยาว", price: 45 },
    { name: "ตำป่า", price: 55 },
    { name: "ตำซั่ว", price: 55 },
    { name: "ตำเส้นแก้ว", price: 50 },
    { name: "ตำป่าเส้นแก้ว/ขนมจีน", price: 55 },
    { name: "ตำซั่วขนมจีน", price: 45 }
  ],
  topping: [
    { name: "ไข่เค็ม", price: 12 },
    { name: "ไข่เยี่ยวม้า", price: 12 },
    { name: "หมูยอ", price: 10 },
    { name: "หอยดอง", price: 10 },
    { name: "ขนมจีน", price: 5 }
  ]
};

const cart = {};
const PROMPTPAY_NUMBER = "0801138627";

function escapeId(name) {
  return btoa(unescape(encodeURIComponent(name))).replace(/=+$/, '');
}

function showTab(tabId, event) {
  document.querySelectorAll('.menu-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  event.target.classList.add('active');
}

function renderMenus() {
  Object.entries(menu).forEach(([cat, items]) => {
    const container = document.getElementById(cat);
    container.innerHTML = '';
    items.forEach(item => {
      cart[item.name] = 0;
      const div = document.createElement('div');
      div.className = 'menu-item';
      const id = escapeId(item.name);
      div.innerHTML = `
        <h3>${item.name}</h3>
        <p>${item.price} บาท</p>
        <div class="menu-controls">
          <button onclick="changeQty('${item.name.replace(/'/g, "\\'")}', -1)">-</button>
          <span id="qty-${id}">0</span>
          <button onclick="changeQty('${item.name.replace(/'/g, "\\'")}', 1)">+</button>
        </div>
      `;
      container.appendChild(div);
    });
  });
  updateTotalPrice();
  updateOrderSummary();
}

function changeQty(name, delta) {
  cart[name] = Math.max(0, (cart[name] || 0) + delta);
  document.getElementById(`qty-${escapeId(name)}`).textContent = cart[name];
  updateTotalPrice();
  updateOrderSummary();
}

function findPriceByName(name) {
  for (const catItems of Object.values(menu)) {
    const item = catItems.find(i => i.name === name);
    if (item) return item.price;
  }
  return 0;
}

function updateTotalPrice() {
  let total = 0;
  for (const [name, qty] of Object.entries(cart)) {
    if (qty > 0) {
      total += findPriceByName(name) * qty;
    }
  }
  document.getElementById('totalPrice').textContent = total.toFixed(2);
  updatePromptPayQR(total);
}

function updatePromptPayQR(amount) {
  const img = document.getElementById('promptpayQR');
  img.src = `https://promptpay.io/${PROMPTPAY_NUMBER}/${amount.toFixed(2)}.png`;
}

function updateOrderSummary() {
  let summary = '';
  for (const [name, qty] of Object.entries(cart)) {
    if (qty > 0) {
      const price = findPriceByName(name);
      summary += `${name} x${qty} = ${(price * qty).toFixed(2)} บาท\n`;
    }
  }
  document.getElementById('orderSummary').textContent = summary || 'ไม่พบสินค้าในตะกร้า';
}

function selectPayment(btn) {
  document.querySelectorAll('.pay-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const method = btn.getAttribute('data-method');
  const promptpaySection = document.getElementById('promptpaySection');
  if (method === 'พร้อมเพย์') {
    promptpaySection.style.display = 'block';
  } else {
    promptpaySection.style.display = 'none';
  }
}

function sendOrder() {
  const items = [];
  let total = 0;
  for (const [name, qty] of Object.entries(cart)) {
    if (qty > 0) {
      const price = findPriceByName(name);
      total += price * qty;
      items.push({ name, qty, price });
    }
  }

  const customerName = document.getElementById("customerName").value.trim();
  const orderNote = document.getElementById("orderNote").value.trim();

  if (items.length === 0) {
    alert("กรุณาเลือกเมนูก่อนส่งคำสั่งซื้อ");
    return;
  }

  if (!customerName) {
    alert("กรุณากรอกชื่อลูกค้า");
    return;
  }

  const orderData = {
    name: customerName,
    items,
    total,
    paymentMethod: document.querySelector('.pay-btn.active')?.getAttribute('data-method') || 'เงินสด',
    note: orderNote,
    timestamp: new Date().toISOString()
  };

  const db = firebase.database();
  const orderRef = db.ref("orders").push();
  latestOrderKey = orderRef.key;

  orderRef.set(orderData)
    .then(() => {
      alert("ส่งคำสั่งซื้อเรียบร้อยแล้ว!");
      resetCart();
      document.getElementById("deleteOrderBtn").style.display = "inline-block";
    })
    .catch(err => {
      console.error("ส่งคำสั่งซื้อผิดพลาด:", err);
      alert("เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ");
    });
}

function deleteMyOrder() {
  if (!latestOrderKey) {
    alert("ยังไม่มีออเดอร์ล่าสุดให้ลบ");
    return;
  }

  const sure = confirm("คุณแน่ใจหรือไม่ว่าต้องการลบออเดอร์ล่าสุด?");
  if (!sure) return;

  const db = firebase.database();
  db.ref("orders/" + latestOrderKey).remove()
    .then(() => {
      alert("ลบออเดอร์เรียบร้อยแล้ว");
      latestOrderKey = null;
      document.getElementById("deleteOrderBtn").style.display = "none";
    })
    .catch(err => {
      console.error("ลบออเดอร์ผิดพลาด:", err);
      alert("เกิดข้อผิดพลาดในการลบออเดอร์");
    });
}

function resetCart() {
  Object.keys(cart).forEach(name => {
    cart[name] = 0;
    document.getElementById(`qty-${escapeId(name)}`).textContent = "0";
  });
  document.getElementById('customerName').value = "";
  document.getElementById('orderNote').value = "";
  updateTotalPrice();
  updateOrderSummary();
  document.getElementById("deleteOrderBtn").style.display = "none";
}


renderMenus();
