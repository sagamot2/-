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
      div.innerHTML = `
        <h3>${item.name}</h3>
        <p>${item.price} บาท</p>
        <div class="menu-controls">
          <button onclick="changeQty('${item.name}', -1)">-</button>
          <span id="qty-${item.name}">0</span>
          <button onclick="changeQty('${item.name}', 1)">+</button>
        </div>
      `;
      container.appendChild(div);
    });
  });
  updateTotalPrice();
}

function changeQty(name, delta) {
  cart[name] = Math.max(0, (cart[name] || 0) + delta);
  document.getElementById(`qty-${name}`).textContent = cart[name];
  updateTotalPrice();
}

function updateTotalPrice() {
  let total = 0;
  Object.entries(cart).forEach(([name, qty]) => {
    if(qty > 0) {
      const price = findPriceByName(name);
      total += price * qty;
    }
  });
  const totalEl = document.getElementById('totalPrice');
  if(totalEl) totalEl.textContent = total;

  updatePromptPayQR(total);
}

function findPriceByName(name) {
  for (const cat in menu) {
    const found = menu[cat].find(item => item.name === name);
    if (found) return found.price;
  }
  return 0;
}

const firebaseConfig = {
  apiKey: "AIzaSyBS__oDn1BoIBG8TiYQks6mFwQd9sBFn_Q",
  authDomain: "somtam-da7ab.firebaseapp.com",
  databaseURL: "https://somtam-da7ab-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "somtam-da7ab",
  storageBucket: "somtam-da7ab.firebasestorage.app",
  messagingSenderId: "388718531258",
  appId: "1:388718531258:web:f673d147f1c3357d4ea883",
  measurementId: "G-T2MC23C0DJ"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

function togglePromptPay() {
  const method = document.getElementById('paymentMethod').value;
  const promptpaySection = document.getElementById('promptpaySection');
  if(method === 'พร้อมเพย์') {
    promptpaySection.style.display = 'block';
  } else {
    promptpaySection.style.display = 'none';
  }
}

function updatePromptPayQR(amount) {
  const phone = "0801138627";
  const qrImg = document.getElementById("promptpayQR");
  if(amount > 0 && qrImg) {
    qrImg.src = `https://promptpay.io/${phone}/${amount}.png`;
  } else if (qrImg) {
    qrImg.src = "";
  }
}

function sendOrder() {
  const paymentMethod = document.getElementById('paymentMethod').value;

  const orderItems = Object.entries(cart)
    .filter(([_, qty]) => qty > 0)
    .map(([name, qty]) => ({ name, qty }));

  if(orderItems.length === 0) {
    alert('กรุณาเลือกเมนูอย่างน้อย 1 รายการ');
    return;
  }

  const customerName = prompt("กรุณาใส่ชื่อของคุณ:");
  if(!customerName) {
    alert("กรุณากรอกชื่อเพื่อสั่งซื้อ");
    return;
  }

  const totalPrice = Object.entries(cart).reduce((sum, [name, qty]) => {
    return sum + (findPriceByName(name) * qty);
  }, 0);

  const orderData = {
    customerName,
    items: orderItems,
    totalPrice,
    paymentMethod,
    status: paymentMethod === "เงินสด" ? "รอดำเนินการ" : "รอชำระเงิน",
    orderDate: new Date().toISOString()
  };

  database.ref("orders").push(orderData)
    .then(() => {
      alert('ส่งคำสั่งซื้อเรียบร้อย ขอบคุณครับ!');
      Object.keys(cart).forEach(name => {
        cart[name] = 0;
        const qtySpan = document.getElementById(`qty-${name}`);
        if(qtySpan) qtySpan.textContent = '0';
      });
      updateTotalPrice();
      togglePromptPay();
    })
    .catch(err => {
      alert('เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ: ' + err.message);
    });
}

renderMenus();
