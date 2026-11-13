const fs = require('fs');
const p = 'C:/Users/pc/onedrive/escritorio/academias/server/src/app.ts';
let s = fs.readFileSync(p, 'utf8');
if (!s.includes('registroGratuitoRuta')) {
  s = s.replace("import logEventosRutas from \"./rutas/log.ruta\";\n\nimport protectRutas", "import logEventosRutas from \"./rutas/log.ruta\";\n\nimport registroGratuitoRuta from \"./rutas/registro.gratuito.ruta\";\n\nimport protectRutas");
  fs.writeFileSync(p, s);
  console.log('done');
} else console.log('exists');
