const WHATSAPP_NUMBER = "213697454244";

const products = [
  {
    id: 1,
    name: "حذاء نايكي أحمر رياضي",
    price: 4800,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700",
    desc: "حذاء رياضي بتصميم عصري للاستخدام اليومي."
  },
  {
    id: 2,
    name: "حذاء بوما كلاسيك أسود",
    price: 5200,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=700",
    desc: "تصميم كلاسيكي أنيق ومناسب للإطلالات اليومية."
  }
];

let cart = JSON.parse(localStorage.getItem("nesaqo_cart") || "[]");

const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const orderModal = document.getElementById("orderModal");

function money(value) {
  return new Intl.NumberFormat("ar-DZ").format(value) + " دج";
}

function renderProducts(list = products) {
  productsGrid.innerHTML = list.map(p => `
    <article class="product-card">
      <img class="product-image" src="${p.image}" alt="${p.name}" loading="lazy">
      <div class="product-info">
        <h3 class="product-title">${p.name}</h3>
        <p class="product-desc">${p.desc}</p>
        <div class="price">${money(p.price)}</div>
        <div class="product-actions">
          <button class="secondary-btn" onclick="addToCart(${p.id})">أضف للسلة</button>
          <button class="primary-btn" onclick="buyNow(${p.id})">اطلب الآن</button>
        </div>
      </div>
    </article>
  `).join("");
}

function saveCart() {
  localStorage.setItem("nesaqo_cart", JSON.stringify(cart));
  renderCart();
}

function addToCart(id) {
  const item = cart.find(x => x.id === id);
  if (item) item.qty++;
  else cart.push({id, qty: 1});
  saveCart();
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(x => x.id !== id);
  saveCart();
}

function changeQty(id, amount) {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty += amount;
  if (item.qty <= 0) removeFromCart(id);
  else saveCart();
}

function renderCart() {
  const count = cart.reduce((sum, x) => sum + x.qty, 0);
  const total = cart.reduce((sum, x) => {
    const p = products.find(product => product.id === x.id);
    return sum + (p ? p.price * x.qty : 0);
  }, 0);

  cartCount.textContent = count;
  cartTotal.textContent = money(total);

  if (!cart.length) {
    cartItems.innerHTML = '<div class="empty">السلة فارغة حاليًا 🛒</div>';
    return;
  }

  cartItems.innerHTML = cart.map(item => {
    const p = products.find(product => product.id === item.id);
    return `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.name}">
        <div>
          <h3>${p.name}</h3>
          <p>${money(p.price)}</p>
          <div class="qty">
            <button onclick="changeQty(${p.id}, -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="changeQty(${p.id}, 1)">+</button>
          </div>
        </div>
        <button class="icon-btn" onclick="removeFromCart(${p.id})" aria-label="حذف">🗑</button>
      </div>
    `;
  }).join("");
}

function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("show");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  if (!orderModal.classList.contains("show")) overlay.classList.remove("show");
}

function buyNow(id) {
  cart = [{id, qty: 1}];
  saveCart();
  openOrderModal();
}

function openOrderModal() {
  if (!cart.length) return;
  orderModal.classList.add("show");
  overlay.classList.add("show");
}

function closeOrderModal() {
  orderModal.classList.remove("show");
  if (!cartDrawer.classList.contains("open")) overlay.classList.remove("show");
}

function buildWhatsAppMessage() {
  const name = document.getElementById("fullName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const notes = document.getElementById("notes").value.trim();

  let message = `مرحباً، أريد تأكيد طلب من متجر NESAQO STORE:\n\n`;
  cart.forEach((item, index) => {
    const p = products.find(product => product.id === item.id);
    message += `${index + 1}. ${p.name} × ${item.qty} — ${money(p.price * item.qty)}\n`;
  });

  const total = cart.reduce((sum, item) => {
    const p = products.find(product => product.id === item.id);
    return sum + p.price * item.qty;
  }, 0);

  message += `\n💰 المجموع: ${money(total)}\n`;
  message += `👤 الاسم: ${name}\n`;
  message += `📞 الهاتف: ${phone}\n`;
  message += `📍 العنوان: ${address}`;
  if (notes) message += `\n📝 ملاحظات: ${notes}`;

  return message;
}

document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
document.getElementById("checkoutBtn").addEventListener("click", openOrderModal);
document.getElementById("closeModal").addEventListener("click", closeOrderModal);

overlay.addEventListener("click", () => {
  closeCart();
  closeOrderModal();
});

searchInput.addEventListener("input", e => {
  const q = e.target.value.trim().toLowerCase();
  renderProducts(products.filter(p => p.name.toLowerCase().includes(q)));
});

document.getElementById("orderForm").addEventListener("submit", e => {
  e.preventDefault();
  const message = encodeURIComponent(buildWhatsAppMessage());
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  closeOrderModal();
});

renderProducts();
renderCart();
