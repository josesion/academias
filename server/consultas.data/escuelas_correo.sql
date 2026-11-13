/* ============================================================================
   049 - Agregar campo correo a escuelas para registro gratuito desde landing
   ============================================================================ */

ALTER TABLE escuelas
    ADD COLUMN correo VARCHAR(255) NULL
    COMMENT 'Correo de contacto para registro gratuito desde landing'
    AFTER celular;
