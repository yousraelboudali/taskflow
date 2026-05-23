function switchTab(tab) {
  document.getElementById('tab-login').classList.toggle('hidden', tab !== 'login');
  document.getElementById('tab-register').classList.toggle('hidden', tab !== 'register');
  document.getElementById('btn-login').className = tab === 'login'
    ? 'flex-1 py-2 rounded-lg bg-[#aec8f5] text-[#143156] font-semibold text-sm transition-all'
    : 'flex-1 py-2 rounded-lg glass-input text-[#c4c6cc] font-semibold text-sm transition-all';
  document.getElementById('btn-register').className = tab === 'register'
    ? 'flex-1 py-2 rounded-lg bg-[#aec8f5] text-[#143156] font-semibold text-sm transition-all'
    : 'flex-1 py-2 rounded-lg glass-input text-[#c4c6cc] font-semibold text-sm transition-all';
}

async function login() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');

  try {
    const res  = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    window.location.href = 'dashboard.html';
  } catch (err) {
    errEl.textContent = err.response?.data?.message || 'Erreur de connexion';
    errEl.classList.remove('hidden');
  }
}

async function register() {
  const fullName = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const errEl    = document.getElementById('register-error');

  if (!fullName || !email || !password) {
    errEl.textContent = 'Tous les champs sont obligatoires';
    errEl.classList.remove('hidden');
    return;
  }

  try {
    const res  = await axios.post('http://localhost:5000/api/auth/register', { fullName, email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    alert('Compte créé avec succès ! 🎉');
  } catch (err) {
    errEl.textContent = err.response?.data?.message || 'Erreur d\'inscription';
    errEl.classList.remove('hidden');
  }
}