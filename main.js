const API = '/api';
let currentUser = null;

async function request(url, method, data) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (data) options.body = JSON.stringify(data);
  const res = await fetch(`${API}${url}`, options);
  return res.json();
}

function openDdosModal() {
  if (!currentUser) {
    document.getElementById('auth-modal').style.display = 'flex';
  } else {
    document.getElementById('add-ddos-modal').style.display = 'flex';
  }
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

async function authUser(mode) {
  const email = document.getElementById('auth-email').value.trim();
  const pass = document.getElementById('auth-pass').value.trim();
  if (!email || !pass) return;
  const data = { email, password: pass };
  const res = await request(mode === 'login' ? '/login' : '/register', 'POST', data);
  if (res.success) {
    currentUser = { id: res.userId, email };
    closeModal('auth-modal');
    updateAccount();
  } else {
    alert(res.error || 'Ошибка');
  }
}

async function submitAddDdosForm() {
  const site = document.getElementById('add-ddos-site').value.trim();
  if (!site || !currentUser) return;
  const res = await request('/add-service', 'POST', {
    userId: currentUser.id,
    type: 'DDoS Protection',
    target: site
  });
  if (res.success) {
    alert('Услуга добавлена');
    closeModal('add-ddos-modal');
    updateAccount();
  } else {
    alert(res.error || 'Ошибка');
  }
}

function logoutUser() {
  currentUser = null;
  updateAccount();
}

async function updateAccount() {
  const el = document.getElementById('account-content');
  if (!currentUser) {
    el.innerHTML = `<button onclick="document.getElementById('auth-modal').style.display='flex'">Войти / Регистрация</button>`;
    return;
  }
  const res = await fetch(`${API}/services/${currentUser.id}`);
  const services = await res.json();
  el.innerHTML = `
    <h3>${currentUser.email}</h3>
    <button onclick="logoutUser()">Выйти</button><br><br>
    <button onclick="document.getElementById('add-ddos-modal').style.display='flex'">Добавить DDoS защиту</button>
    <h4>Услуги:</h4>
    <ul>${services.map(s => `<li>${s.type}: ${s.target}</li>`).join('') || '<li>Нет услуг</li>'}</ul>
  `;
}
