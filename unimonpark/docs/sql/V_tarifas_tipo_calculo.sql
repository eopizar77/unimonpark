-- Sincroniza tarifas con Tarifa.java antes de usar ddl-auto=validate.
-- Ejecutar en el esquema unimonpark.

ALTER TABLE unimonpark.tarifas
    ADD COLUMN IF NOT EXISTS categoria_persona varchar(35),
    ADD COLUMN IF NOT EXISTS tipo_calculo varchar(20),
    ADD COLUMN IF NOT EXISTS horas_limite numeric(4,2),
    ADD COLUMN IF NOT EXISTS valor_hasta_limite numeric(10,2),
    ADD COLUMN IF NOT EXISTS valor_despues_limite numeric(10,2);

UPDATE unimonpark.tarifas
SET tipo_calculo = 'POR_HORA'
WHERE tipo_calculo IS NULL;

ALTER TABLE unimonpark.tarifas
    ALTER COLUMN tipo_calculo SET NOT NULL;

ALTER TABLE unimonpark.tarifas
    ADD CONSTRAINT ck_tarifas_tipo_calculo
    CHECK (tipo_calculo IN ('POR_HORA', 'POR_TRAMOS', 'PLANA', 'MENSUAL'));
