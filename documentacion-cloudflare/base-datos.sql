-- Estructura de referencia existente. NO ejecutar de nuevo sin revisar el entorno.
CREATE TABLE IF NOT EXISTS reclamaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE,
    fecha_registro TEXT NOT NULL DEFAULT (datetime('now')),
    tipo_reclamo TEXT NOT NULL CHECK (tipo_reclamo IN ('Reclamo', 'Queja')),
    nombre TEXT NOT NULL,
    documento TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT,
    servicio TEXT,
    detalle TEXT NOT NULL,
    pedido TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'Pendiente',
    fecha_respuesta TEXT
);

-- Disparador ya creado y verificado en D1.
CREATE TRIGGER IF NOT EXISTS trg_jht_codigo_reclamacion
AFTER INSERT ON reclamaciones
FOR EACH ROW
WHEN NEW.codigo IS NULL
BEGIN
  UPDATE reclamaciones
  SET codigo = 'JHT-' || strftime('%Y', NEW.fecha_registro) || '-' || printf('%06d', NEW.id)
  WHERE id = NEW.id;
END;
