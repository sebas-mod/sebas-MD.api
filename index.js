const express = require('express');
const ytSearch = require('yt-search');
//const sharp = require('sharp');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 8080;

app.set('json spaces', 2);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(session({
    secret: 'secreto-super-seguro-sebasmdi-2026',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // Expiración en 1 día
}));

// CREDENCIALES FIJAS
const USUARIO_VALIDO = "Luisrojas30921@gmail.com";
const CONTRASEÑA_VALIDA = "987654321";

// Middleware para restringir accesos si no está logueado
function requerirLogin(req, res, next) {
    if (req.session && req.session.usuario) {
        return next();
    } else {
        return res.redirect('/login');
    }
}

// ==========================================
// RUTA: LOGIN CON ESTILO NEGRO Y ROJO PREMIUM
// ==========================================
app.get('/login', (req, res) => {
    if (req.session.usuario) return res.redirect('/');

    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login | Sebas-MD</title>
            <style>
                body { font-family: 'Segoe UI', system-ui, sans-serif; background: #060608; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .login-container { background: #0d0d12; padding: 40px; border-radius: 12px; box-shadow: 0 10px 40px rgba(255,42,59,0.15); border: 1px solid #1f1f29; width: 100%; max-width: 360px; text-align: center; }
                
                /* Avatar en el Login */
                .login-avatar { width: 90px; height: 90px; border-radius: 50%; border: 2px solid #ff2a3b; margin: 0 auto 20px auto; display: block; box-shadow: 0 0 15px rgba(255,42,59,0.3); object-fit: cover; }
                
                h2 { color: #fff; margin: 0 0 5px 0; font-size: 1.8em; font-weight: 800; }
                h2 span { color: #ff2a3b; text-shadow: 0 0 10px rgba(255,42,59,0.4); }
                p.login-sub { color: #8a8a93; font-size: 0.9em; margin-bottom: 25px; }
                
                .input-group { text-align: left; margin-bottom: 15px; }
                .input-group label { display: block; font-size: 0.8em; color: #8a8a93; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 0.5px; }
                input { width: 100%; padding: 12px; border-radius: 6px; border: 1px solid #1f1f29; background: #14141c; color: #fff; box-sizing: border-box; font-size: 0.95em; }
                input:focus { border-color: #ff2a3b; outline: none; box-shadow: 0 0 8px rgba(255,42,59,0.4); }
                
                button { width: 100%; padding: 12px; background: #ff2a3b; border: none; color: #fff; font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 1em; transition: 0.2s; margin-top: 10px; }
                button:hover { background: #cc1b2a; box-shadow: 0 0 15px rgba(255,42,59,0.5); }
                .error-msg { color: #ff4a5a; font-size: 0.85em; margin-top: 15px; background: rgba(255,74,90,0.1); padding: 8px; border-radius: 4px; border: 1px solid rgba(255,74,90,0.2); }
            </style>
        </head>
        <body>
            <div class="login-container">
                <img class="login-avatar" src="https://github.com/sebas-mod.png" alt="Sebas-MD">
                <h2>Sebas-<span>MD</span></h2>
                <p class="login-sub">Introduce tus credenciales para acceder al Panel</p>
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
                ${req.query.error ? '<div class="error-msg">Acceso denegado: Datos incorrectos</div>' : ''}
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
        return res.redirect('/login?error=true');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// ==========================================
// RUTA: DASHBOARD INTERACTIVO POR SECCIONES
// ==========================================
app.get('/', requerirLogin, (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sebas-MD | Dashboard Avanzado</title>
            <style>
                :root {
                    --bg-main: #060608;
                    --bg-card: #0d0d12;
                    --bg-input: #14141c;
                    --primary: #ff2a3b;
                    --primary-hover: #cc1b2a;
                    --text-main: #f4f4f6;
                    --text-muted: #8a8a93;
                    --border: #1f1f29;
                }
                body { font-family: 'Segoe UI', system-ui, sans-serif; background: var(--bg-main); color: var(--text-main); padding: 20px; margin: 0; display: flex; flex-direction: column; min-height: 100vh; }
                
                /* Header Superior */
                .header-bar { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; width: 100%; margin: 0 auto 20px auto; padding: 10px 20px; background: var(--bg-card); border-radius: 10px; border: 1px solid var(--border); box-sizing: border-box; }
                .user-badge { color: var(--text-muted); font-size: 0.9em; display: flex; align-items: center; gap: 8px; }
                .user-badge::before { content: "●"; color: var(--primary); text-shadow: 0 0 8px var(--primary); }
                .logout-btn { background: var(--primary); color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 0.9em; font-weight: bold; transition: 0.2s; }
                .logout-btn:hover { background: var(--primary-hover); }

                /* Perfil Central */
                .profile-section { text-align: center; margin-bottom: 30px; }
                .avatar { width: 110px; height: 110px; border-radius: 50%; border: 3px solid var(--primary); margin: 0 auto 12px auto; display: block; box-shadow: 0 0 25px rgba(255,42,59,0.4); object-fit: cover; transition: 0.3s; }
                .avatar:hover { transform: scale(1.05); }
                h1 { margin: 0; font-size: 2.6em; font-weight: 900; letter-spacing: -0.5px; }
                h1 span { color: var(--primary); text-shadow: 0 0 15px rgba(255,42,59,0.5); }
                p.sub { color: var(--text-muted); font-size: 1.05em; max-width: 650px; margin: 6px auto 20px auto; line-height: 1.5; }
                
                /* Enlaces de Contacto */
                .btn-group { display: flex; justify-content: center; gap: 12px; margin-bottom: 10px; flex-wrap: wrap; }
                .btn { padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 0.9em; transition: 0.2s; color: #fff; display: flex; align-items: center; gap: 8px; }
                .btn-github { background: #161b22; border: 1px solid #30363d; }
                .btn-github:hover { background: #21262d; border-color: #8b949e; }
                .btn-wsp { background: #1bd741; }
                .btn-wsp:hover { background: #1aa634; box-shadow: 0 0 12px rgba(27,215,65,0.4); }

                /* Layout del Panel */
                .main-layout { display: flex; gap: 20px; max-width: 1200px; width: 100%; margin: 0 auto; flex-grow: 1; box-sizing: border-box; }
                
                /* Menú de Categorías Lateral */
                .sidebar { display: flex; flex-direction: column; gap: 8px; width: 220px; flex-shrink: 0; }
                .tab-button { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-muted); padding: 14px 18px; border-radius: 8px; text-align: left; font-size: 0.95em; font-weight: 600; cursor: pointer; transition: 0.2s; }
                .tab-button:hover { background: #14141a; color: #fff; border-color: var(--primary); }
                .tab-button.active { background: var(--primary); color: #fff; border-color: var(--primary); box-shadow: 0 4px 15px rgba(255,42,59,0.3); }

                /* Cuadro de Contenidos */
                .content-area { flex-grow: 1; background: var(--bg-card); border: 1px solid var(--border); padding: 25px; border-radius: 12px; min-width: 0; }
                .tab-content { display: none; }
                .tab-content.active { display: block; animation: fadeIn 0.25s ease; }
                
                .section-header { font-size: 1.4em; font-weight: 700; margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid var(--border); padding-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #fff; }
                .section-header span { color: var(--primary); }

                /* Grid de Endpoints */
                .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 15px; }
                .endpoint { background: #111116; padding: 18px; border-radius: 8px; border: 1px solid var(--border); position: relative; overflow: hidden; transition: 0.2s; }
                .endpoint::before { content: ""; position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: var(--primary); }
                .endpoint:hover { border-color: var(--primary); background: #15151f; transform: translateY(-1px); }
                .endpoint strong { color: #fff; font-size: 1.1em; display: block; }
                .endpoint p { color: var(--text-muted); font-size: 0.85em; margin: 6px 0 12px 0; line-height: 1.4; }
                
                .badge { background: var(--primary); color: #fff; font-size: 0.7em; padding: 2px 5px; border-radius: 4px; font-weight: bold; margin-right: 6px; }
                .badge.test { background: #2a2a35; color: #8a8a93; }
                code { background: var(--bg-main); padding: 8px 10px; border-radius: 5px; font-size: 0.8em; color: #ff4a5a; display: block; word-break: break-all; font-family: monospace; border: 1px solid #1c1c24; }

                footer { margin-top: 40px; color: #444; font-size: 0.8em; text-align: center; border-top: 1px solid var(--border); padding-top: 15px; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
                
                @media(max-width: 820px) {
                    .main-layout { flex-direction: column; }
                    .sidebar { width: 100%; flex-direction: row; overflow-x: auto; padding-bottom: 5px; }
                    .tab-button { white-space: nowrap; padding: 10px 15px; }
                    .grid { grid-template-columns: 1fr; }
                }
            </style>
        </head>
        <body>
            <div class="header-bar">
                <div class="user-badge">User: ${req.session.usuario}</div>
                <a href="/logout" class="logout-btn">Cerrar Sesión</a>
            </div>
            
            <div class="profile-section">
                <img class="avatar" src="https://github.com/sebas-mod.png" alt="Sebas-MD">
                <h1>Sebas-<span>MD</span></h1>
                <p class="sub">Bienvenido a tu API Rest Privada. Panel de control multimedia estructurado de alta velocidad optimizado para automatizaciones y bots de mensajería.</p>
                <div class="btn-group">
                    <a href="https://github.com/sebas-mod" target="_blank" class="btn btn-github">🐱 Mi GitHub</a>
                    <a href="https://wa.me/5491138403093" target="_blank" class="btn btn-wsp">💬 Mi WhatsApp</a>
                </div>
            </div>

            <div class="main-layout">
                <div class="sidebar">
                    <button class="tab-button active" onclick="switchTab(event, 'search')">🔍 Search</button>
                    <button class="tab-button" onclick="switchTab(event, 'ia')">🤖 IA</button>
                    <button class="tab-button" onclick="switchTab(event, 'descargas')">📥 Descargas</button>
                    <button class="tab-button" onclick="switchTab(event, 'sticker')">🖼️ Sticker</button>
                    <button class="tab-button" onclick="switchTab(event, 'tools')">⚙️ Tools</button>
                    <button class="tab-button" onclick="switchTab(event, 'anime')">⚔️ Anime</button>
                </div>

                <div class="content-area">
                    <!-- SECCIÓN: SEARCH -->
                    <div id="search" class="tab-content active">
                        <div class="section-header">Sección <span>Search (10)</span></div>
                        <div class="grid">
                            <div class="endpoint">
                                <strong><span class="badge">GET</span> Buscador YouTube (Activo)</strong>
                                <p>Búsqueda asíncrona de videos en la plataforma.</p>
                                <code>/api/search/yt?query=musica</code>
                            </div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Google Search</strong><p>Busca páginas web y artículos generales.</p><code>/api/search/google?query=texto</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Pinterest</strong><p>Encuentra imágenes estáticas del catálogo.</p><code>/api/search/pinterest?query=anime</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Spotify Search</strong><p>Busca pistas de audio y álbumes.</p><code>/api/search/spotify?query=song</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Wikipedia</strong><p>Extrae resúmenes informativos directos.</p><code>/api/search/wikipedia?query=argentina</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> PlayStore</strong><p>Busca especificaciones de aplicaciones Android.</p><code>/api/search/playstore?query=whatsapp</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> TikTok Search</strong><p>Busca perfiles y videos dentro de TikTok.</p><code>/api/search/tiktokuser?query=sebas</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> MercadoLibre</strong><p>Buscador de productos, costos y ofertas.</p><code>/api/search/ml?query=celular</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Letras Música</strong><p>Extrae las letras de canciones líricas.</p><code>/api/search/lyrics?query=duki</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> GitHub Search</strong><p>Busca repositorios de código públicos.</p><code>/api/search/github?query=bot-wa</code></div>
                        </div>
                    </div>

                    <!-- SECCIÓN: IA -->
                    <div id="ia" class="tab-content">
                        <div class="section-header">Sección <span>Inteligencia Artificial (10)</span></div>
                        <div class="grid">
                            <div class="endpoint"><strong><span class="badge test">GET</span> ChatGPT-4o</strong><p>Respuestas complejas conversacionales.</p><code>/api/ia/chatgpt?text=hola</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Gemini Pro</strong><p>Análisis de código y lógica de Google AI.</p><code>/api/ia/gemini?text=codigo</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Llama 3</strong><p>Procesamiento avanzado de Meta AI.</p><code>/api/ia/llama?text=cuento</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Text-To-Image</strong><p>Genera imágenes artísticas artificiales.</p><code>/api/ia/text2img?prompt=cyberpunk cat</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Remove Background</strong><p>Elimina fondos de imágenes con redes.</p><code>/api/ia/removebg?url=LINK_FOTO</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> TTS Narrador</strong><p>Convierte texto escrito a audio natural.</p><code>/api/ia/tts?text=hola&voice=hombre</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Anime Filter</strong><p>Transforma una fotografía a formato anime.</p><code>/api/ia/toanime?url=LINK_FOTO</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Remini Enhancer</strong><p>Aumenta y repara la calidad de fotos borrosas.</p><code>/api/ia/enhance?url=LINK_FOTO</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Corrector Ortográfico</strong><p>Repara errores de escritura gramatical.</p><code>/api/ia/fixtext?text=hola k tal</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Copilot Helper</strong><p>Asistente de desarrollo de software guiado.</p><code>/api/ia/copilot?query=bucle en js</code></div>
                        </div>
                    </div>

                    <!-- SECCIÓN: DESCARGAS -->
                    <div id="descargas" class="tab-content">
                        <div class="section-header">Sección <span>Descargas (10)</span></div>
                        <div class="grid">
                            <div class="endpoint"><strong><span class="badge">GET</span> TikTok Downloader (Activo)</strong><p>Video limpio en HD sin marcas de agua.</p><code>/api/download/tiktok?url=LINK</code></div>
                            <div class="endpoint"><strong><span class="badge">GET</span> Instagram Downloader (Activo)</strong><p>Videos directos de Reels y Publicaciones.</p><code>/api/download/ig?url=LINK</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> YouTube MP3</strong><p>Extrae y descarga el flujo de audio en MP3.</p><code>/api/download/ytmp3?url=LINK</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> YouTube MP4</strong><p>Descarga videos completos en formato MP4.</p><code>/api/download/ytmp4?url=LINK</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Facebook Video</strong><p>Descarga multimedia de muros públicos.</p><code>/api/download/fb?url=LINK</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Twitter/X Video</strong><p>Extrae archivos multimedia de tweets.</p><code>/api/download/twitter?url=LINK</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Spotify Track</strong><p>Descarga canciones vía links de Spotify.</p><code>/api/download/spotify?url=LINK</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Mediafire Downloader</strong><p>Bypassa el link a descarga directa automatizada.</p><code>/api/download/mediafire?url=LINK</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Pinterest Video</strong><p>Descarga archivos de video de Pinterest.</p><code>/api/download/pinvideo?url=LINK</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> SoundCloud MP3</strong><p>Descarga pistas de audio independientes.</p><code>/api/download/soundcloud?url=LINK</code></div>
                        </div>
                    </div>

                    <!-- SECCIÓN: STICKER -->
                    <div id="sticker" class="tab-content">
                        <div class="section-header">Sección <span>Sticker & Edición (10)</span></div>
                        <div class="grid">
                            <div class="endpoint">
                                <strong><span class="badge">GET</span> Imagen a Sticker (Activo)</strong>
                                <p>Renderiza imágenes y las transforma a WebP.</p>
                                <code>/api/maker/sticker?url=ENLACE</code>
                            </div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Video a Sticker</strong><p>Convierte clips de video a WebP animado.</p><code>/api/maker/sticker-animado?url=LINK</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Sticker Meme</strong><p>Inyecta textos sobre la imagen WebP.</p><code>/api/maker/stickermeme?url=LINK&text=TEXTO</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Logo Neon</strong><p>Genera imágenes de texto neón carmesí.</p><code>/api/maker/logoneon?text=Sebas</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Filtro Blur</strong><p>Aplica un desenfoque gaussiano controlado.</p><code>/api/maker/blur?url=LINK&radius=5</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Pixelar Imagen</strong><p>Transforma capturas a formato retro pixelado.</p><code>/api/maker/pixelate?url=LINK&value=10</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Invertir Cromática</strong><p>Invierte por completo la matriz de colores.</p><code>/api/maker/invert?url=LINK</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Grayscale</strong><p>Filtro purista de escala de grises limpia.</p><code>/api/maker/grayscale?url=LINK</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Metadatos WebP</strong><p>Agrega marcas de autoría internas al sticker.</p><code>/api/maker/wm?url=LINK&pack=Pack&auth=Sebas</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Recorte Redondo</strong><p>Genera un corte esférico con canal alfa transparente.</p><code>/api/maker/circle?url=LINK</code></div>
                        </div>
                    </div>

                    <!-- SECCIÓN: TOOLS -->
                    <div id="tools" class="tab-content">
                        <div class="section-header">Sección <span>Tools & Utilidades (10)</span></div>
                        <div class="grid">
                            <div class="endpoint"><strong><span class="badge test">GET</span> Generador QR</strong><p>Crea imágenes de códigos QR instantáneos.</p><code>/api/tools/qr?text=hola</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Clima Ciudad</strong><p>Estado climático térmico y vientos actualizados.</p><code>/api/tools/weather?ciudad=buenos-aires</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Acortar Enlace</strong><p>Minimiza el tamaño de URLs extensas.</p><code>/api/tools/shorten?url=LINK</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Screenshot Web</strong><p>Renderiza una captura visual completa de una web.</p><code>/api/tools/ssweb?url=https://google.com</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Traductor API</strong><p>Traducción de idiomas por bloques limpios.</p><code>/api/tools/translate?text=hello&to=es</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Generar Password</strong><p>Crea cadenas alfanuméricas criptográficas seguras.</p><code>/api/tools/genpass?length=16</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Contador de Días</strong><p>Mide la distancia de tiempo entre fechas.</p><code>/api/tools/daysbetween?d1=2026-01-01</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Conversor Divisas</strong><p>Tasas y cambios monetarios globales vigentes.</p><code>/api/tools/currency?from=USD&to=ARS</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> GeoIP Info</strong><p>Analiza el proveedor geográfico de una dirección IP.</p><code>/api/tools/ipinfo?ip=1.1.1.1</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Ping Servidor</strong><p>Comprueba la latencia o disponibilidad de una web.</p><code>/api/tools/ping?url=google.com</code></div>
                        </div>
                    </div>

                    <!-- SECCIÓN: ANIME -->
                    <div id="anime" class="tab-content">
                        <div class="section-header">Sección <span>Anime Otaku Core (10)</span></div>
                        <div class="grid">
                            <div class="endpoint"><strong><span class="badge test">GET</span> Buscar Anime</strong><p>Fichas técnicas y rankings de MyAnimeList.</p><code>/api/anime/search?query=naruto</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Wallpapers 4K</strong><p>Imágenes en ultra resolución de personajes aleatorios.</p><code>/api/anime/wallpaper?query=waifu</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Frases De Anime</strong><p>Citas célebres tradicidas con subtítulo de autor.</p><code>/api/anime/quote</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Anime Hug GIF</strong><p>Retorna un GIF automatizado de abrazos.</p><code>/api/anime/hug</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Anime Slap GIF</strong><p>Imágenes dinámicas de cachetadas de comedia.</p><code>/api/anime/slap</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Anime Kill GIF</strong><p>Animaciones de batallas y ataques coordinados.</p><code>/api/anime/kill</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Galería Neko</strong><p>Colección de ilustraciones de temática Neko.</p><code>/api/anime/neko</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Otaku Trivia</strong><p>Preguntas selectivas sobre cultura general anime.</p><code>/api/anime/quiz</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Buscar Mangas</strong><p>Capítulos, tomos e información editorial de mangas.</p><code>/api/anime/manga?query=one-piece</code></div>
                            <div class="endpoint"><strong><span class="badge test">GET</span> Calendario Emisión</strong><p>Lista de lanzamientos semanales en Japón.</p><code>/api/anime/schedule</code></div>
                        </div>
                    </div>
                </div>
            </div>

            <footer>
                © 2026 Sebas-MD • Desarrollado para optimización de Bots Multimedia.
            </footer>

            <script>
                function switchTab(event, tabId) {
                    const contents = document.querySelectorAll('.tab-content');
                    contents.forEach(content => content.classList.remove('active'));
                    const buttons = document.querySelectorAll('.tab-button');
                    buttons.forEach(button => button.classList.remove('active'));
                    document.getElementById(tabId).classList.add('active');
                    event.currentTarget.classList.add('active');
                }
            </script>
        </body>
        </html>
    `);
});

// ==========================================
// ENDPOINTS DE PROCESAMIENTO MULTIMEDIA (LOGICA)
// ==========================================
app.get('/api/maker/sticker', requerirLogin, async (req, res) => {
    const imageUrl = req.query.url;
    if (!imageUrl) return res.status(400).json({ status: false, error: "Falta el parámetro 'url'" });
    try {
        const respuestaImagen = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const bufferImagen = Buffer.from(respuestaImagen.data, 'binary');
        const stickerWebp = await sharp(bufferImagen)
            .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .webp().toBuffer();
        res.setHeader('Content-Type', 'image/webp');
        res.send(stickerWebp);
    } catch (error) {
        res.status(500).json({ status: false, error: "No se pudo procesar el sticker." });
    }
});

app.get('/api/search/yt', requerirLogin, async (req, res) => {
    const query = req.query.query;
    if (!query) return res.status(400).json({ status: false, error: "Falta el parámetro 'query'" });
    try {
        const resultado = await ytSearch(query);
        res.json({ status: true, resultados: resultado.videos.slice(0, 5).map(v => ({ titulo: v.title, id: v.videoId, url: v.url, duracion: v.timestamp, miniatura: v.thumbnail })) });
    } catch (error) {
        res.status(500).json({ status: false, error: "Error en YouTube" });
    }
});

app.get('/api/download/tiktok', requerirLogin, async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ status: false, error: "Falta el parámetro 'url'" });
    try {
        const respuesta = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(videoUrl)}`);
        const datos = respuesta.data;
        res.json({ status: true, resultado: { titulo: datos.video.title, autor: datos.author.unique_id, video_sin_marca: datos.video.noWatermark, audio: datos.music.play_url } });
    } catch (error) {
        res.status(500).json({ status: false, error: "Error al extraer TikTok." });
    }
});

app.get('/api/download/ig', requerirLogin, async (req, res) => {
    const igUrl = req.query.url;
    if (!igUrl) return res.status(400).json({ status: false, error: "Falta el parámetro 'url'" });
    try {
        const respuesta = await axios.get(`https://api.sandipbaruwal.codes/instagram_v2?url=${encodeURIComponent(igUrl)}`);
        res.json({ status: true, resultado: { url_descarga: respuesta.data.url, tipo: respuesta.data.type } });
    } catch (error) {
        res.status(500).json({ status: false, error: "Error al extraer Instagram." });
    }
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 API en marcha: http://localhost:${PORT}`));
}