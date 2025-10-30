module.exports = {
    // 💡 IMPORTANTE: Reemplazamos 'preset: ts-jest' por la configuración explícita.
    // Esto es necesario para apuntar a un tsconfig diferente al predeterminado.
    
    // Configuración del transformador
    transform: {
        // Le dice a ts-jest que procese archivos .ts y .tsx
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            // 👈 ¡AQUÍ ESTÁ LA CLAVE! Apunta al archivo de configuración de Jest
            tsconfig: 'tsconfig.jest.json', 
        }],
    },
    
    // 💡 Ambiente para tests que interactúan con la BD (Node.js)
    testEnvironment: 'node',
    
    // 💡 Patrón de archivos de test. (Debe coincidir con tus archivos de prueba)
    testMatch: [
        "**/__tests__/**/*.ts", 
        "**/?(*.)+(test|spec).ts"
    ],
    
    // 💡 Ignora directorios de compilación y dependencias
    testPathIgnorePatterns: [
        "/node_modules/",
        "/build/" // O tu 'outDir' en tsconfig.json
    ],
    
    // 💡 Asegúrate de que Jest sepa dónde buscar archivos .ts
    moduleFileExtensions: [
        "ts",
        "js",
        "json",
        "node"
    ]
};