import { fechaHoy } from "../../src/hooks/fecha";

describe(" Funcion fechaHoy", ()=> {
    // 1. ARRANGE: Definir la fecha que vamos a SIMULAR
    // Usaremos una fecha conocida, por ejemplo, el 10 de octubre de 2025.
    const MOCK_DATE = '2025-10-10T12:00:00.000Z';
    const EXPECTED_OUTPUT = '2025-10-10';

    // 💡 Setup (Preparación): Antes de que corran los tests...
    beforeAll(() => {
        // 1. Indicamos a Jest que use timers falsos
        jest.useFakeTimers();
        // 2. Le decimos al sistema cuál es la hora y fecha "actual"
        jest.setSystemTime(new Date(MOCK_DATE));
    });

    // 💡 Teardown (Limpieza): Después de que corran todos los tests...
    afterAll(() => {
        // Restauramos los timers para que otros tests usen la hora real
        jest.useRealTimers();
    });

 // --- Caso 1: Verificar el formato con meses/días de dos dígitos ---
    it('Debe devolver la fecha simulada formateada como YYYY-MM-DD', () => {
        // 2. ACT (Ejecutar la función)
        const resultado = fechaHoy();

        // 3. ASSERT (Comprobar)
        expect(resultado).toBe(EXPECTED_OUTPUT);
    }); 

// --- Caso 2: Verificar el 'padding' (el cero inicial) para meses y días de un dígito ---
    it('Debe asegurarse de que los meses y días de un solo dígito tengan un cero (padding)', () => {
        // Preparamos otra fecha para este test (Enero 1, 2024)
        const MOCK_SINGLE_DIGIT_DATE = '2024-01-01T00:00:00.000';
        const EXPECTED_SINGLE_OUTPUT = '2024-01-01';

        // ⚠️ IMPORTANTE: Volvemos a fijar la hora del sistema SOLO para esta prueba
        jest.setSystemTime(new Date(MOCK_SINGLE_DIGIT_DATE));

        const resultado = fechaHoy();

        expect(resultado).toBe(EXPECTED_SINGLE_OUTPUT);
        
        // 🔄 Restablecemos el mock original para que no afecte a futuros tests
        jest.setSystemTime(new Date(MOCK_DATE));
    });

} );

