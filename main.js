/* CART SYSTEM */
const CART_KEY = 'playtrade_cart_v1';
const USER_KEY = "playtrade_user";
let authMode = "login";

/* THEME */
function toggleTheme(){
  const body = document.body;
  const t = body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  body.setAttribute('data-theme', t);
}

/* PRICE */
function formatPrice(v){ return '€' + Number(v).toFixed(2); }

/* CART HELPERS */
function getCart(){
  try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch(e){ return []; }
}

function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount(){
  const cnt = getCart().reduce((s,i)=> s + i.qty,0);
  document.getElementById('cartCount').textContent = cnt;
}

/* ADD TO CART */
function addToCartFromBtn(id){
  const card = document.querySelector(`.card[data-id="${id}"]`);
  if(card) addToCart(buildProductFromCard(card));
}

function buildProductFromCard(card){
  return {
    id: card.dataset.id,
    title: card.dataset.title,
    price: Number(card.dataset.price),
    img: card.dataset.img,
    qty: 1
  };
}

function addToCart(product){
  const cart = getCart();
  const idx = cart.findIndex(i=> i.id === product.id);
  if(idx>-1) cart[idx].qty++;
  else cart.push(product);
  saveCart(cart);
  flash('Added to cart');
}

/* PRODUCT MODAL */
function openProduct(el){
  document.getElementById('modalTitle').textContent = el.dataset.title;
  document.getElementById('modalImg').src = el.dataset.img;
  document.getElementById('modalDesc').textContent = el.dataset.desc;
  document.getElementById('modalPrice').textContent = formatPrice(el.dataset.price);
  document.getElementById('productModal').dataset.currentId = el.dataset.id;
  document.getElementById('productModal').style.display = 'flex';
}

function closeModal(){ document.getElementById('productModal').style.display='none';}

/* ADD / BUY NOW */
function addToCartModal(){
  const id = document.getElementById('productModal').dataset.currentId;
  const card = document.querySelector(`.card[data-id="${id}"]`);
  if(card) addToCart(buildProductFromCard(card));
  closeModal();
}

function buyNow(){
  addToCartModal();
  openCart();
  continueToCheckout();
}

/* CART MODAL */
function openCart(){ renderCart(); document.getElementById('cartModal').style.display='flex'; }
function closeCart(){ document.getElementById('cartModal').style.display='none'; }

function renderCart(){
  const list = document.getElementById('cartList');
  list.innerHTML='';
  const cart=getCart();

  if(cart.length===0){
    list.innerHTML='<div style="padding:12px;text-align:center;opacity:0.7">Cart is empty</div>';
    document.getElementById('cartTotal').textContent = formatPrice(0);
    return;
  }

  cart.forEach(item=>{
    const div=document.createElement('div');
    div.className='cart-item';
    div.innerHTML=`
      <img src="${item.img}">
      <div class="meta"><h4>${item.title}</h4><p>${formatPrice(item.price)}</p></div>
      <div class="qty">
        <button onclick="decreaseQty('${item.id}')">-</button>
        <div>${item.qty}</div>
        <button onclick="increaseQty('${item.id}')">+</button>
      </div>
      <button onclick="removeItem('${item.id}')">✕</button>`;
    list.appendChild(div);
  });

  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  document.getElementById('cartTotal').textContent = formatPrice(total);
}

function decreaseQty(id){
  const cart=getCart();
  const i=cart.find(i=>i.id===id);
  if(i){ i.qty=Math.max(1,i.qty-1); saveCart(cart); renderCart(); }
}
function increaseQty(id){
  const cart=getCart();
  const i=cart.find(i=>i.id===id);
  if(i){ i.qty++; saveCart(cart); renderCart(); }
}
function removeItem(id){
  saveCart(getCart().filter(i=>i.id!==id));
  renderCart();
}
function clearCart(){ saveCart([]); renderCart(); }

/* CHECKOUT */
function continueToCheckout(){
  const cart=getCart();
  if(cart.length===0) return;

  const wrap=document.getElementById('checkoutItems');
  wrap.innerHTML='';

  cart.forEach(i=>{
    const row=document.createElement('div');
    row.style.display='flex';
    row.style.justifyContent='space-between';
    row.innerHTML=`<div>${i.title} × ${i.qty}</div><div>${formatPrice(i.qty*i.price)}</div>`;
    wrap.appendChild(row);
  });

  const total=cart.reduce((s,i)=>s+i.qty*i.price,0);
  document.getElementById('checkoutTotal').textContent=formatPrice(total);
  document.getElementById('checkoutModal').style.display='flex';
  closeCart();
}

function closeCheckout(){
  document.getElementById('checkoutModal').style.display='none';
  document.getElementById('paymentNotice').textContent='';
}

function simulatePayment(){
  const total=document.getElementById('checkoutTotal').textContent;
  const msg=document.getElementById('paymentNotice');
  msg.textContent = 'Payment frozen in escrow: '+total;

  setTimeout(()=>{
    msg.textContent += ' • Seller delivering...';
    setTimeout(()=>{
      msg.textContent += ' • Confirm when received.';
      saveCart([]);
      updateCartCount();
    },1200);
  },800);
}

/* FLASH MESSAGE */
function flash(msg){
  const el=document.createElement('div');
  el.textContent=msg;
  el.style.position='fixed';
  el.style.left='50%';
  el.style.top='20%';
  el.style.transform='translateX(-50%)';
  el.style.background='var(--accent)';
  el.style.color='#fff';
  el.style.padding='8px 14px';
  el.style.borderRadius='10px';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),1500);
}

/* SEARCH */
function filterCards(){
  const s=document.getElementById('searchInput').value.toLowerCase();
  const f=document.getElementById('filterSelect').value;
  document.querySelectorAll('.card').forEach(c=>{
    const t=c.dataset.title.toLowerCase();
    const cat=c.dataset.category;
    const ok=(t.includes(s)||s==='') && (f==='all'||f===cat);
    c.style.display=ok?'block':'none';
  });
}

/* AI CHAT (unchanged) */
function toggleAIChat(){ 
  const c=document.getElementById('aiChat'); 
  c.style.display=c.style.display==='flex'?'none':'flex';
}

/* -------- AUTH SYSTEM (REGISTRATION + LOGIN) -------- */

/* -------- AUTH SYSTEM (REGISTER + LOGIN с разными формами) -------- */

function openAuthModal(){
  document.getElementById('authModal').style.display='flex';
  document.getElementById('authMsg').textContent='';
  renderAuthFields();
}

function closeAuthModal(){
  document.getElementById('authModal').style.display='none';
}

function switchAuthMode(){
  authMode = authMode === "login" ? "register" : "login";
  document.getElementById('authTitle').textContent = authMode === "login" ? "Login" : "Register";
  document.querySelector('.auth-actions .outline').textContent =
    authMode === "login" ? "Switch to Register" : "Switch to Login";

  renderAuthFields();
}

/* ПЕРЕРИСОВКА ФОРМЫ В ЗАВИСИМОСТИ ОТ РЕЖИМА */
function renderAuthFields(){
  const box = document.querySelector('.auth-fields');

  if(authMode === "login"){
    box.innerHTML = `
      <input id="authEmail" type="email" placeholder="Email">
      <input id="authPassword" type="password" placeholder="Password">
    `;
  } else {
    box.innerHTML = `
      <input id="regName" type="text" placeholder="Full Name">
      <input id="regUserName" type="text" placeholder="Username">
      <input id="regAge" type="number" placeholder="Age">
      <input id="regEmail" type="email" placeholder="Email">
      <input id="regPassword" type="password" placeholder="Password">
    `;
  }
}

/* SUBMIT AUTH */
function submitAuth(){
  const msg=document.getElementById('authMsg');
  msg.textContent='';

  if(authMode === "register"){
    const name = document.getElementById('regName').value.trim();
    const username = document.getElementById('regUserName').value.trim();
    const age = document.getElementById('regAge').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPassword').value.trim();

    if(!name || !username || !age || !email || !pass){
      msg.textContent='Please fill all fields.';
      return;
    }

    if(age < 12){
      msg.textContent='Minimum age is 12.';
      return;
    }

    const user = { name, username, age, email, pass };
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    msg.textContent = 'Account created!';
    setTimeout(()=>closeAuthModal(),700);
    return;
  }

  /* LOGIN */
  const email=document.getElementById('authEmail').value.trim();
  const pass=document.getElementById('authPassword').value.trim();

  const user=JSON.parse(localStorage.getItem(USER_KEY)||"{}");

  if(user.email===email && user.pass===pass){
    localStorage.setItem("playtrade_logged","1");
    msg.textContent='Logged in!';

    updateUserUI();
    setTimeout(()=>closeAuthModal(),700);
  } else {
    msg.textContent='Incorrect email or password.';
  }
}

function updateUserUI(){
  const isLogged = localStorage.getItem("playtrade_logged") === "1";
  const box = document.getElementById("userDisplay");
  const logoutBtn = document.getElementById("logoutBtn");

  if(isLogged){
    const user = JSON.parse(localStorage.getItem(USER_KEY) || "{}");
    box.textContent = user.username || user.email;
    box.style.display = "inline-block";
    logoutBtn.style.display = "inline-block";
  } else {
    box.style.display = "none";
    logoutBtn.style.display = "none";
  }
}
    

/* INIT */
window.addEventListener('load',()=>{
  updateCartCount();
  updateUserUI();
});
function logout(){
  localStorage.removeItem("playtrade_logged");
  updateUserUI();
}
