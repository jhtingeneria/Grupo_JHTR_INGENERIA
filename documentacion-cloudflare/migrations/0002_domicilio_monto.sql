-- Ejecutar UNA sola vez, ANTES de desplegar el Worker nuevo:
--   npx wrangler d1 execute NOMBRE_DE_TU_BASE --remote --file=migrations/0002_domicilio_monto.sql
-- Las filas existentes quedan con NULL en las columnas nuevas.
ALTER TABLE reclamaciones ADD COLUMN domicilio TEXT;
ALTER TABLE reclamaciones ADD COLUMN monto_reclamado TEXT;
