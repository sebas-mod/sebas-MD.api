const express = require('express');
const ytSearch = require('yt-search');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session'); // <-- Cambiado aquí

const app = express();
const PORT = process.env.PORT || 8080;

app.set('json spaces', 2);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuración de sesión ligera perfecta para Vercel Serverless
app.use(cookieSession({
    name: 'sebas_session',
    keys: ['secreto-sebas-2026'],
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
}));

const USUARIO_VALIDO = "Luisrojas30921@gmail.com";
const CONTRASEÑA_VALIDA = "987654321";

function requerirLogin(req, res, next) {
    if (req.session && req.session.usuario) {
        return next();
    } else {
        return res.redirect('/login');
    }
}

// ==========================================
// RUTA: LOGIN
// ==========================================
app.get('/login', (req, res) => {
    if (req.session && req.session.usuario) return res.redirect('/');
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login | Sebas-MD</title>
            <style>
                body { font-family: system-ui, sans-serif; background: #060608; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .login-container { background: #0d0d12; padding: 40px; border-radius: 12px; border: 1px solid #1f1f29; width: 100%; max-width: 360px; text-align: center; }
                .login-avatar { width: 90px; height: 90px; border-radius: 50%; border: 2px solid #ff2a3b; margin: 0 auto 20px auto; display: block; object-fit: cover; }
                h2 { color: #fff; margin: 0 0 5px 0; font-size: 1.8em; font-weight: 800; }
                h2 span { color: #ff2a3b; }
                p.login-sub { color: #8a8a93; font-size: 0.9em; margin-bottom: 25px; }
                .input-group { text-align: left; margin-bottom: 15px; }
                .input-group label { display: block; font-size: 0.8em; color: #8a8a93; text-transform: uppercase; margin-bottom: 5px; }
                input { width: 100%; padding: 12px; border-radius: 6px; border: 1px solid #1f1f29; background: #14141c; color: #fff; box-sizing: border-box; }
                button { width: 100%; padding: 12px; background: #ff2a3b; border: none; color: #fff; font-weight: bold; border-radius: 6px; cursor: pointer; margin-top: 10px; }
                button:hover { background: #cc1b2a; }
            </style>
        </head>
        <body>
            <div class="login-container">
                <img class="login-avatar" src="https://github.com/sebas-mod.png" alt="Sebas-MD">
                <h2>Sebas-<span>MD</span></h2>
                <p class="login-sub">Introduce tus credenciales para acceder</p>
                <form action="/login" method="POST">
                    <div class="input-group">
                        <label>Email</label>
                        <input type="email" name="email" placeholder="Introduce tu correo" required>
                    </div>
                    <div class="input-group">
                        <label>Contraseña</label>
                        <input type="password" name="password" placeholder="•••••••••" required>
                    </div>
                    <button type="submit">Iniciar Sesión</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email === USUARIO_VALIDO && password === CONTRASEÑA_VALIDA) {
        req.session.usuario = email;
        return res.redirect('/');
    } else {
        return res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.session = null; // Cierra la sesión limpiando la cookie
    res.redirect('/login');
});

// ==========================================
// RUTA: DASHBOARD INTERACTIVO
// ==========================================
app.get('/', requerirLogin, (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sebas-MD | Dashboard</title>
            <style>
                :root { --bg-main: #060608; --bg-card: #0d0d12; --primary: #ff2a3b; --text-main: #f4f4f6; --text-muted: #8a8a93; --border: #1f1f29; }
                body { font-family: system-ui, sans-serif; background: var(--bg-main); color: var(--text-main); padding: 20px; margin: 0; }
                .header-bar { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto 20px auto; padding: 10px 20px; background: var(--bg-card); border-radius: 10px; border: 1px solid var(--border); }
                .logout-btn { background: var(--primary); color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-weight: bold; }
                .profile-section { text-align: center; margin-bottom: 30px; }
                .avatar { width: 110px; height: 110px; border-radius: 50%; border: 3px solid var(--primary); margin: 0 auto 12px auto; display: block; object-fit: cover; }
                h1 { margin: 0; font-size: 2.6em; font-weight: 900; }
                h1 span { color: var(--primary); }
                p.sub { color: var(--text-muted); font-size: 1.05em; max-width: 650px; margin: 6px auto 20px auto; }
                .btn-group { display: flex; justify-content: center; gap: 12px; }
                .btn { padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 0.9em; color: #fff; }
                .btn-github { background: #161b22; border: 1px solid #30363d; }
                .btn-wsp { background: #1bd741; }
                .main-layout { display: flex; gap: 20px; max-width: 1200px; margin: 0 auto; }
                .sidebar { display: flex; flex-direction: column; gap: 8px; width: 220px; }
                .tab-button { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-muted); padding: 14px 18px; border-radius: 8px; text-align: left; font-size: 0.95em; cursor: pointer; }
                .tab-button.active { background: var(--primary); color: #fff; }
                .content-area { flex-grow: 1; background: var(--bg-card); border: 1px solid var(--border); padding: 25px; border-radius: 12px; }
                .tab-content { display: none; }
                .tab-content.active { display: block; }
                .section-header { font-size: 1.4em; font-weight: 700; margin: 0 0 20px 0; border-bottom: 2px solid var(--border); padding-bottom: 10px; }
                .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 15px; }
                .endpoint { background: #111116; padding: 18px; border-radius: 8px; border: 1px solid var(--border); }
                .endpoint strong { color: #fff; display: block; }
                .endpoint p { color: var(--text-muted); font-size: 0.85em; margin: 6px 0 12px 0; }
                code { background: var(--bg-main); padding: 8px 10px; border-radius: 5px; font-size: 0.8em; color: #ff4a5a; display: block; word-break: break-all; font-family: monospace; }
                footer { margin-top: 40px; color: #444; text-align: center; }
            </style>
        </head>
        <body>
            <div class="header-bar">
                <div>Sesión Activa</div>
                <a href="/logout" class="logout-btn">Cerrar Sesión</a>
            </div>
            <div class="profile-section">
                <img class="avatar" src="https://github.com/sebas-mod.png" alt="Sebas-MD">
                <h1>Sebas-<span>MD</span></h1>
                <p class="sub">API Rest Privada optimizada para automatizaciones y bots.</p>
                <div class="btn-group">
                    <a href="https://github.com/sebas-mod" target="_blank" class="btn btn-github">🐱 Mi GitHub</a>
                    <a href="https://wa.me/5491138403093" target="_blank" class="btn btn-wsp">💬 Mi WhatsApp</a>
                </div>
            </div>
            <div class="main-layout">
                <div class="sidebar">
                    <button class="tab-button active" onclick="switchTab(event, 'search')">🔍 Search</button>
                    <button class="tab-button" onclick="switchTab(event, 'descargas')">📥 Descargas</button>
                </div>
                <div class="content-area">
                    <div id="search" class="tab-content active">
                        <div class="section-header">Sección Search</div>
                        <div class="grid">
                            <div class="endpoint"><strong>Buscador YouTube</strong><p>Búsqueda asíncrona de videos.</p><code>/api/search/yt?query=musica</code></div>
                        </div>
                    </div>
                    <div id="descargas" class="tab-content">
                        <div class="section-header">Sección Descargas</div>
                        <div class="grid">
                            <div class="endpoint"><strong>TikTok Downloader</strong><p>Video limpio en HD sin marcas.</p><code>/api/download/tiktok?url=LINK</code></div>
                        </div>
                    </div>
                </div>
            </div>
            <footer>© 2026 Sebas-MD</footer>
            <script>
                function switchTab(event, tabId) {
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                    document.getElementById(tabId).classList.add('active');
                    event.currentTarget.classList.add('active');
                }
            </script>
        </body>
        </html>
    `);
});

// ==========================================
// ENDPOINTS
// ==========================================
app.get('/api/search/yt', requerirLogin, async (req, res) => {
    const query = req.query.query;
    if (!query) return res.status(400).json({ status: false, error: "Falta el parámetro 'query'" });
    try {
        const resultado = await ytSearch(query);
        res.json({ status: true, resultados: resultado.videos.slice(0, 5).map(v => ({ titulo: v.title, id: v.videoId, url: v.url })) });
    } catch (error) { res.status(500).json({ status: false }); }
});

app.get('/api/download/tiktok', requerirLogin, async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ status: false });
    try {
        const respuesta = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(videoUrl)}`);
        res.json({ status: true, resultado: respuesta.data });
    } catch (error) { res.status(500).json({ status: false }); }
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 API: http://localhost:${PORT}`));
}