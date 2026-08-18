const WHATSAPP_NUMBER = "213697454244";

// المنتجات الحالية تجريبية. عند وصول أول شحنة نستبدل هذه البيانات فقط.
const products = [
  { id: 1, name: "حذاء رياضي موديل A", price: 4800, stock: 8, sizes: [39,40,41,42,43], image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900", desc: "حذاء رياضي عصري للاستخدام اليومي." },
  { id: 2, name: "حذاء رياضي موديل B", price: 5200, stock: 5, sizes: [40,41,42,43,44], image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900", desc: "تصميم أنيق ومريح للإطلالات اليومية." }
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
const productModal = document.getElementById("productModal");
const productDetails = document.getElementById("productDetails");

function money(value){ return new Intl.NumberFormat("ar-DZ").format(value) + " دج"; }
function available(p){ return p.stock > 0; }

function renderProducts(list = products){
  productsGrid.innerHTML = list.map(p => `
    <article class="product-card">
      <div class="image-wrap"><img class="product-image" src="${p.image}" alt="${p.name}" loading="lazy"><span class="stock-badge ${p.stock < 1 ? 'out' : ''}">${p.stock > 0 ? `متوفر ${p.stock}` : 'نفد المخزون'}</span></div>
      <div class="product-info">
        <h3 class="product-title">${p.name}</h3><p class="product-desc">${p.desc}</p>
        <div class="price">${money(p.price)}</div>
        <div class="sizes-preview">المقاسات: ${p.sizes.join(" · ")}</div>
        <div class="product-actions"><button class="secondary-btn" onclick="showProduct(${p.id})">التفاصيل</button><button class="primary-btn" ${!available(p)?'disabled':''} onclick="buyNow(${p.id})">${available(p)?'اطلب الآن':'نفد المخزون'}</button></div>
      </div>
    </article>`).join("");
}

function showProduct(id){
  const p = products.find(x=>x.id===id); if(!p)return;
  productDetails.innerHTML = `<img class="detail-image" src="${p.image}" alt="${p.name}"><span class="eyebrow">NESAQO</span><h2>${p.name}</h2><p class="muted">${p.desc}</p><div class="detail-price">${money(p.price)}</div><p><strong>المخزون:</strong> ${p.stock > 0 ? `${p.stock} زوج` : 'نفد'}</p><div class="size-picker"><strong>اختر المقاس:</strong><div>${p.sizes.map(s=>`<button type="button" class="size-btn" data-size="${s}" onclick="selectSize(this)">${s}</button>`).join('')}</div></div><button class="primary-btn full detail-buy" ${!available(p)?'disabled':''} onclick="buyNow(${p.id}, true)">إضافة للسلة والطلب</button>`;
  productModal.classList.add("show"); productModal.setAttribute("aria-hidden","false"); overlay.classList.add("show");
}
function selectSize(btn){ document.querySelectorAll('.size-btn').forEach(x=>x.classList.remove('selected')); btn.classList.add('selected'); }
function selectedSize(){ const x=document.querySelector('.size-btn.selected'); return x ? Number(x.dataset.size) : null; }

function saveCart(){ localStorage.setItem("nesaqo_cart", JSON.stringify(cart)); renderCart(); }
function addToCart(id,size){ const p=products.find(x=>x.id===id); if(!p||!available(p))return; if(!size){showProduct(id);return;} const item=cart.find(x=>x.id===id&&x.size===size); if(item){if(item.qty>=p.stock)return;item.qty++;}else cart.push({id,qty:1,size}); saveCart(); openCart(); }
function removeFromCart(id,size){cart=cart.filter(x=>!(x.id===id&&x.size===size));saveCart();}
function changeQty(id,size,amount){const item=cart.find(x=>x.id===id&&x.size===size),p=products.find(x=>x.id===id);if(!item||!p)return;item.qty+=amount;if(item.qty<=0)removeFromCart(id,size);else if(item.qty>p.stock)item.qty=p.stock;else saveCart();}
function renderCart(){const count=cart.reduce((s,x)=>s+x.qty,0);const total=cart.reduce((s,x)=>{const p=products.find(y=>y.id===x.id);return s+(p?p.price*x.qty:0)},0);cartCount.textContent=count;cartTotal.textContent=money(total);if(!cart.length){cartItems.innerHTML='<div class="empty">السلة فارغة حاليًا 🛒</div>';return;}cartItems.innerHTML=cart.map(item=>{const p=products.find(x=>x.id===item.id);return `<div class="cart-item"><img src="${p.image}" alt="${p.name}"><div><h3>${p.name}</h3><p>المقاس ${item.size} · ${money(p.price)}</p><div class="qty"><button onclick="changeQty(${p.id},${item.size},-1)">−</button><span>${item.qty}</span><button onclick="changeQty(${p.id},${item.size},1)">+</button></div></div><button class="icon-btn" onclick="removeFromCart(${p.id},${item.size})">🗑</button></div>`}).join("");}
function openCart(){cartDrawer.classList.add("open");overlay.classList.add("show");}
function closeCart(){cartDrawer.classList.remove("open");if(!orderModal.classList.contains("show")&&!productModal.classList.contains("show"))overlay.classList.remove("show");}
function closeProductModal(){productModal.classList.remove("show");productModal.setAttribute("aria-hidden","true");if(!cartDrawer.classList.contains("open")&&!orderModal.classList.contains("show"))overlay.classList.remove("show");}
function buyNow(id,fromModal=false){const p=products.find(x=>x.id===id);if(!p||!available(p))return;const size=fromModal?selectedSize():null;if(!size){showProduct(id);return;}cart=[{id,qty:1,size}];saveCart();closeProductModal();openOrderModal();}
function openOrderModal(){if(!cart.length)return;cartDrawer.classList.remove("open");orderModal.classList.add("show");overlay.classList.add("show");}
function closeOrderModal(){orderModal.classList.remove("show");if(!cartDrawer.classList.contains("open")&&!productModal.classList.contains("show"))overlay.classList.remove("show");}
function getDeliveryType(){const x=document.querySelector('input[name="deliveryType"]:checked');return x?x.value:"";}
function buildWhatsAppMessage(){const name=document.getElementById("fullName").value.trim(),phone=document.getElementById("phone").value.trim(),address=document.getElementById("address").value.trim(),deliveryType=getDeliveryType(),deliveryAddress=document.getElementById("deliveryAddress").value.trim(),notes=document.getElementById("notes").value.trim();let message=`مرحباً، أريد تأكيد طلب من متجر NESAQO STORE:\n\n`;cart.forEach((item,i)=>{const p=products.find(x=>x.id===item.id);message+=`${i+1}. ${p.name} — المقاس ${item.size} × ${item.qty} — ${money(p.price*item.qty)}\n`;});const total=cart.reduce((s,item)=>{const p=products.find(x=>x.id===item.id);return s+p.price*item.qty},0);message+=`\n💰 المجموع: ${money(total)}\n👤 الاسم: ${name}\n📞 الهاتف: ${phone}\n📍 الولاية/البلدية: ${address}\n🚚 طريقة التوصيل: ${deliveryType}\n📦 ${deliveryType==='باب المنزل'?'العنوان':'اسم مكتب الشحن'}: ${deliveryAddress}`;if(notes)message+=`\n📝 ملاحظات: ${notes}`;return message;}

document.getElementById("openCart").addEventListener("click",openCart);document.getElementById("closeCart").addEventListener("click",closeCart);document.getElementById("checkoutBtn").addEventListener("click",openOrderModal);document.getElementById("closeModal").addEventListener("click",closeOrderModal);document.getElementById("closeProductModal").addEventListener("click",closeProductModal);overlay.addEventListener("click",()=>{closeCart();closeOrderModal();closeProductModal();});searchInput.addEventListener("input",e=>{const q=e.target.value.trim().toLowerCase();renderProducts(products.filter(p=>p.name.toLowerCase().includes(q)||p.desc.toLowerCase().includes(q)));});document.getElementById("orderForm").addEventListener("submit",e=>{e.preventDefault();if(!getDeliveryType()){alert("يرجى اختيار طريقة التوصيل.");return;}const message=encodeURIComponent(buildWhatsAppMessage());window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`,"_blank");closeOrderModal();});renderProducts();renderCart();
