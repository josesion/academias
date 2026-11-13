const fs = require('fs');
const p = 'C:/Users/pc/onedrive/escritorio/academias/server/src/app.ts';
let s = fs.readFileSync(p, 'utf8');
if (!s.includes('registroGratuitoRuta)')) {
  s = s.replace("app.use(logEventosRutas);\n\n// RUTAS DE LA PLATAFORMA", "app.use(logEventosRutas);\n\napp.use(registroGratuitoRuta);\n\n// RUTAS DE LA PLATAFORMA");
  fs.writeFileSync(p, s);
  console.log('done');
} else console.log('exists');
