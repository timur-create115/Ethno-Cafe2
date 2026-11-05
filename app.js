/* ==========================================================
   Ethno place — логика сайта: меню, корзина, оформление заказа.
   ========================================================== */

/* ---------- НАСТРОЙКИ (меняйте здесь) ---------- */
const SETTINGS = {
  // Номер WhatsApp для приёма заказов: только цифры, с кодом страны
  whatsapp: "78722123456",
  // Стоимость доставки и порог бесплатной доставки, ₽
  deliveryPrice: 150,
  freeDeliveryFrom: 1500,
  pickupAddress: "г. Махачкала, ул. Абдулхакима Исмаилова, 45",
};

/* ---------- КАТЕГОРИИ МЕНЮ ---------- */
const CATEGORIES = [
  { id: "all", name: "Все блюда" },
  { id: "khinkal", name: "Хинкал и курзе" },
  { id: "hot", name: "Горячее" },
  { id: "pastry", name: "Выпечка" },
  { id: "soups", name: "Супы и салаты" },
  { id: "drinks", name: "Напитки" },
  { id: "desserts", name: "Десерты" },
];

/* ---------- БЛЮДА ----------
   Чтобы изменить блюдо:
   - name  — название
   - desc  — описание
   - price — цена в рублях (только число)
   - weight — выход/объём (можно оставить пустым "")
   - img   — путь к фото. Положите своё фото в папку images/ и укажите имя файла,
             например "images/moe-foto.jpg". Можно указать и ссылку https://...
   - id    — уникальный код блюда (латиница, не повторяется)
   Чтобы добавить блюдо — скопируйте строку целиком и поменяйте значения.
*/
const MENU = [
  { id: "avar-khinkal", category: "khinkal", name: "Аварский хинкал", desc: "Пышные кусочки теста, отварная баранина, бульон и чесночный соус", price: 450, weight: "450 г", img: "images/avar-khinkal.png" },
  { id: "kurze", category: "khinkal", name: "Курзе с мясом", desc: "Дагестанские пельмени с косичкой, сочная говядина, сливочное масло", price: 380, weight: "10 шт", img: "images/kurze.png" },
  { id: "chakapuli", category: "hot", name: "Чакапули", desc: "Молодая баранина, тушённая с тархуном, кинзой и белым вином", price: 590, weight: "350 г", img: "images/chakapuli.png" },
  { id: "dolma", category: "hot", name: "Долма", desc: "Виноградные листья с рубленым мясом и рисом, мацони с чесноком", price: 420, weight: "8 шт", img: "images/dolma.png" },
  { id: "shashlik", category: "hot", name: "Шашлык из баранины", desc: "Маринованная баранина на углях, красный лук и зелень", price: 650, weight: "300 г", img: "images/shashlik.png" },
  { id: "chudu", category: "pastry", name: "Чуду с мясом", desc: "Тонкое тесто с сочной мясной начинкой и топлёным маслом", price: 280, weight: "1 шт", img: "images/chudu.png" },
  { id: "botishal", category: "pastry", name: "Ботишал с тыквой", desc: "Слоёный горский пирог со сладкой тыквой", price: 300, weight: "1 шт", img: "images/botishal.png" },
  { id: "shurpa", category: "soups", name: "Шурпа", desc: "Наваристый суп из баранины с овощами и зеленью", price: 350, weight: "400 мл", img: "images/shurpa.png" },
  { id: "salad", category: "soups", name: "Овощной салат", desc: "Свежие томаты, огурцы, красный лук и горная зелень", price: 250, weight: "250 г", img: "images/salad.png" },
  { id: "tea", category: "drinks", name: "Чай с чабрецом", desc: "Чёрный чай с горным чабрецом, подаётся с сухофруктами", price: 150, weight: "400 мл", img: "images/tea.png" },
  { id: "compote", category: "drinks", name: "Домашний компот", desc: "Из абрикосов и ягод, без лишнего сахара", price: 120, weight: "500 мл", img: "images/compote.png" },
  { id: "halva", category: "desserts", name: "Халва с урбечем", desc: "Дагестанская халва на урбече с грецким орехом и мёдом", price: 220, weight: "150 г", img: "images/halva.png" },
  { id: "pakhlava", category: "desserts", name: "Пахлава", desc: "Слоёное тесто, мёд и грецкие орехи", price: 260, weight: "3 шт", img: "images/pakhlava.png" },
];

/* ==========================================================
   Ниже — логика. Обычно её менять не нужно.
   ========================================================== */

const IMAGE_BASE = "https://vantage-plum-delta.vercel.app/site/";
const dishImage = (dish) => `${IMAGE_BASE}${dish.img}`;

const STORAGE_KEY = "ethno-place-cart-v1";
const MAX_QTY = 50;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const formatPrice = (n) => n.toLocaleString("ru-RU") + " ₽";
const dishById = (id) => MENU.find((d) => d.id === id);

const ICONS = {
  cart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2"/><circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg>',
  minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
};

/* ---------- Состояние корзины (сохраняется в браузере) ---------- */
const state = {
  cart: loadCart(), // { [dishId]: количество }
  category: "all",
};

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const clean = {};
    for (const [id, qty] of Object.entries(raw)) {
      const n = Math.floor(Number(qty));
      if (dishById(id) && n > 0) clean[id] = Math.min(n, MAX_QTY);
    }
    return clean;
  } catch {
    return {};
  }
}

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
  } catch {
    /* хранилище недоступно (например, приватный режим) — корзина работает без сохранения */
  }
}

function setQty(id, qty) {
  const n = Math.max(0, Math.min(MAX_QTY, Math.floor(qty)));
  if (n === 0) delete state.cart[id];
  else state.cart[id] = n;
  saveCart();
  updateDishFoot(id);
  renderCart();
}

const cartCount = () => Object.values(state.cart).reduce((a, b) => a + b, 0);
const cartSubtotal = () =>
  Object.entries(state.cart).reduce((sum, [id, qty]) => sum + dishById(id).price * qty, 0);

function getMethod() {
  return $('input[name="method"]:checked')?.value || "delivery";
}

function deliveryCost(subtotal) {
  if (getMethod() === "pickup") return 0;
  return subtotal >= SETTINGS.freeDeliveryFrom ? 0 : SETTINGS.deliveryPrice;
}

/* ---------- Меню ---------- */
function renderFilters() {
  const wrap = $("[data-filters]");
  wrap.innerHTML = CATEGORIES.map(
    (c) =>
      `<button type="button" class="chip" role="tab" data-category="${c.id}" aria-selected="${c.id === state.category}">${c.name}</button>`
  ).join("");

  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-category]");
    if (!btn) return;
    state.category = btn.dataset.category;
    $$(".chip", wrap).forEach((c) => c.setAttribute("aria-selected", String(c === btn)));
    renderMenu();
  });
}

function dishFootHTML(dish) {
  const qty = state.cart[dish.id] || 0;
  const control = qty
    ? `<div class="stepper" aria-label="Количество: ${dish.name}">
         <button type="button" data-action="dec" data-id="${dish.id}" aria-label="Уменьшить">${ICONS.minus}</button>
         <span class="stepper__val" aria-live="polite">${qty}</span>
         <button type="button" data-action="inc" data-id="${dish.id}" aria-label="Увеличить">${ICONS.plus}</button>
       </div>`
    : `<button type="button" class="add-btn" data-action="add" data-id="${dish.id}" aria-label="Добавить в корзину: ${dish.name}">${ICONS.cart}Добавить</button>`;
  return `<span class="dish__price">${formatPrice(dish.price)}</span>${control}`;
}

function renderMenu() {
  const list = state.category === "all" ? MENU : MENU.filter((d) => d.category === state.category);
  $("[data-menu]").innerHTML = list
    .map(
      (d) => `
      <article class="dish">
        <img class="dish__img" src="${dishImage(d)}" alt="${d.name}" loading="lazy" onerror="this.style.display=\'none\'" />
        <div class="dish__body">
          <h3 class="dish__name">${d.name}</h3>
          <p class="dish__desc">${d.desc}</p>
          ${d.weight ? `<span class="dish__meta">${d.weight}</span>` : ""}
          <div class="dish__foot" data-foot="${d.id}">${dishFootHTML(d)}</div>
        </div>
      </article>`
    )
    .join("");
}

function updateDishFoot(id) {
  const foot = $(`[data-foot="${id}"]`);
  if (!foot) return;
  const hadFocus = foot.contains(document.activeElement);
  const focusedAction = document.activeElement?.dataset?.action;
  foot.innerHTML = dishFootHTML(dishById(id));
  if (hadFocus) {
    const target =
      $(`[data-action="${focusedAction === "add" ? "inc" : focusedAction}"]`, foot) ||
      $("button", foot);
    target?.focus();
  }
}

/* Клики в меню: добавить / +/- */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;
  const qty = state.cart[id] || 0;
  if (action === "add") {
    setQty(id, 1);
    toast(`«${dishById(id).name}» в корзине`);
  } else if (action === "inc") {
    setQty(id, qty + 1);
  } else if (action === "dec") {
    setQty(id, qty - 1);
  } else if (action === "remove") {
    setQty(id, 0);
  }
});

/* ---------- Корзина ---------- */
function renderCart() {
  const count = cartCount();
  const subtotal = cartSubtotal();
  const delivery = deliveryCost(subtotal);
  const isEmpty = count === 0;

  $$("[data-cart-count]").forEach((b) => {
    const changed = b.textContent !== String(count);
    b.textContent = count > 99 ? "99+" : count;
    b.hidden = isEmpty;
    if (changed && !isEmpty) {
      b.classList.remove("bump");
      void b.offsetWidth;
      b.classList.add("bump");
    }
  });

  $("[data-cart-empty]").hidden = !isEmpty;
  $("[data-checkout]").hidden = isEmpty;
  $("[data-cart-foot]").hidden = isEmpty;

  $("[data-cart-list]").innerHTML = Object.entries(state.cart)
    .map(([id, qty]) => {
      const d = dishById(id);
      return `
      <li class="cart-item">
        <img class="cart-item__img" src="${dishImage(d)}" alt="" loading="lazy" onerror="this.style.display=\'none\'" />
        <div>
          <div class="cart-item__top">
            <div>
              <h3 class="cart-item__name">${d.name}</h3>
              <span class="cart-item__unit">${formatPrice(d.price)} за порцию</span>
            </div>
            <button type="button" class="remove-btn" data-action="remove" data-id="${id}" aria-label="Удалить: ${d.name}">${ICONS.trash}</button>
          </div>
          <div class="cart-item__row">
            <div class="stepper">
              <button type="button" data-action="dec" data-id="${id}" aria-label="Уменьшить">${ICONS.minus}</button>
              <span class="stepper__val">${qty}</span>
              <button type="button" data-action="inc" data-id="${id}" aria-label="Увеличить">${ICONS.plus}</button>
            </div>
            <span class="cart-item__sum">${formatPrice(d.price * qty)}</span>
          </div>
        </div>
      </li>`;
    })
    .join("");

  $("[data-subtotal]").textContent = formatPrice(subtotal);
  $("[data-delivery-row]").hidden = getMethod() === "pickup";
  $("[data-delivery]").textContent = delivery === 0 ? "Бесплатно" : formatPrice(delivery);
  $("[data-total]").textContent = formatPrice(subtotal + delivery);
}

/* Открытие/закрытие панели корзины */
const drawer = $("[data-drawer]");
const overlay = $("[data-overlay]");
let lastFocus = null;

function openCart() {
  lastFocus = document.activeElement;
  overlay.hidden = false;
  requestAnimationFrame(() => {
    overlay.classList.add("is-open");
    drawer.classList.add("is-open");
  });
  drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-locked");
  setTimeout(() => $("[data-close-cart]", drawer)?.focus(), 50);
}

function closeCart() {
  overlay.classList.remove("is-open");
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-locked");
  setTimeout(() => (overlay.hidden = true), 250);
  lastFocus?.focus?.();
}

$$("[data-open-cart]").forEach((b) => b.addEventListener("click", openCart));
$$("[data-close-cart]").forEach((b) => b.addEventListener("click", closeCart));
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!$("[data-success]").hidden) closeSuccess();
  else if (drawer.classList.contains("is-open")) closeCart();
});

/* ---------- Доставка / самовывоз ---------- */
const form = $("[data-checkout]");
const METHOD_KEY = "ethno-place-method";

function applyMethod() {
  const isDelivery = getMethod() === "delivery";
  $("[data-address-field]").hidden = !isDelivery;
  $("[data-pickup-note]").hidden = isDelivery;
  if (!isDelivery) form.address.classList.remove("is-invalid");
  try { localStorage.setItem(METHOD_KEY, getMethod()); } catch {}
  renderCart();
}

try {
  const saved = localStorage.getItem(METHOD_KEY);
  if (saved) {
    const radio = $(`input[name="method"][value="${saved}"]`);
    if (radio) radio.checked = true;
  }
} catch {}

$$('input[name="method"]').forEach((r) => r.addEventListener("change", applyMethod));
form.addEventListener("input", (e) => e.target.classList.remove("is-invalid"));

/* ---------- Оформление заказа ---------- */
function validate() {
  const errors = [];
  const name = form.name.value.trim();
  const phoneDigits = form.phone.value.replace(/\D/g, "");
  const address = form.address.value.trim();

  [form.name, form.phone, form.address].forEach((el) => el.classList.remove("is-invalid"));

  if (name.length < 2) { errors.push("укажите имя"); form.name.classList.add("is-invalid"); }
  if (phoneDigits.length < 10 || phoneDigits.length > 15) { errors.push("проверьте телефон"); form.phone.classList.add("is-invalid"); }
  if (getMethod() === "delivery" && address.length < 5) { errors.push("укажите адрес доставки"); form.address.classList.add("is-invalid"); }

  return errors;
}

function buildOrderText(orderNo) {
  const subtotal = cartSubtotal();
  const delivery = deliveryCost(subtotal);
  const lines = Object.entries(state.cart).map(([id, qty]) => {
    const d = dishById(id);
    return `• ${d.name} × ${qty} = ${formatPrice(d.price * qty)}`;
  });
  const method = getMethod() === "delivery"
    ? `Доставка: ${form.address.value.trim()}`
    : `Самовывоз: ${SETTINGS.pickupAddress}`;
  const comment = form.comment.value.trim();

  return [
    `Заказ №${orderNo} — Ethno place`,
    "",
    ...lines,
    "",
    `Блюда: ${formatPrice(subtotal)}`,
    getMethod() === "delivery" ? `Доставка: ${delivery ? formatPrice(delivery) : "бесплатно"}` : null,
    `Итого: ${formatPrice(subtotal + delivery)}`,
    "",
    `Имя: ${form.name.value.trim()}`,
    `Телефон: ${form.phone.value.trim()}`,
    method,
    comment ? `Комментарий: ${comment}` : null,
  ].filter((l) => l !== null).join("\n");
}

$("[data-submit]").addEventListener("click", () => {
  const errors = validate();
  const errorBox = $("[data-form-error]");
  if (errors.length) {
    errorBox.textContent = "Пожалуйста, " + errors.join(", ") + ".";
    $(".is-invalid", form)?.focus();
    return;
  }
  errorBox.textContent = "";

  const orderNo = String(Date.now()).slice(-6);
  const total = cartSubtotal() + deliveryCost(cartSubtotal());
  const text = buildOrderText(orderNo);

  $("[data-success-text]").textContent =
    `Заказ №${orderNo} на сумму ${formatPrice(total)} сформирован. ` +
    (getMethod() === "delivery"
      ? "Мы перезвоним для подтверждения и привезём заказ горячим."
      : "Мы перезвоним, когда заказ будет готов к выдаче.");
  $("[data-whatsapp]").href = `https://wa.me/${SETTINGS.whatsapp}?text=${encodeURIComponent(text)}`;

  state.cart = {};
  saveCart();
  form.comment.value = "";
  renderCart();
  renderMenu();
  closeCart();
  $("[data-success]").hidden = false;
  document.body.classList.add("is-locked");
  $("[data-whatsapp]").focus();
});

function closeSuccess() {
  $("[data-success]").hidden = true;
  document.body.classList.remove("is-locked");
}
$("[data-close-success]").addEventListener("click", closeSuccess);
$("[data-success]").addEventListener("click", (e) => { if (e.target === e.currentTarget) closeSuccess(); });

/* ---------- Уведомление ---------- */
let toastTimer;
function toast(message) {
  const el = $("[data-toast]");
  el.textContent = message;
  el.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-visible"), 1800);
}

/* ---------- Подсветка активного раздела в навигации ---------- */
const navLinks = $$(".nav__link, .tabbar__item[href]");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${id}`));
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
["home", "menu", "about", "contacts"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) observer.observe(el);
});

/* ---------- Запуск ---------- */
renderFilters();
renderMenu();
applyMethod();
