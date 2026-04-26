# Fase 5 - Social + ELO por games (guia de prueba)

## Preparacion

1. Configura `DATABASE_URL`, `NEXTAUTH_URL` y `NEXTAUTH_SECRET`.
2. Ejecuta `npm install`.
3. Ejecuta `npm run db:generate`.
4. Si aplicaste el nuevo schema de score en matches, ejecuta `npm run db:push`.
5. Si tienes PostgreSQL disponible, carga demo con `npm run db:seed`.
6. Arranca la app con `npm run dev`.

## Credenciales seed

- Admin: `admin@tcgleague.dev` / `League123!`
- Luna: `luna@tcgleague.dev` / `League123!`
- Marco: `marco@tcgleague.dev` / `League123!`
- Sofia: `sofia@tcgleague.dev` / `League123!`
- Alex: `alex@tcgleague.dev` / `League123!`

## 1) Pendientes sociales en contador superior

1. Inicia sesion como `luna@tcgleague.dev`.
2. Verifica el badge superior de pendientes.
3. Debe incluir solicitudes de amistad recibidas.
4. Abre el dropdown de pendientes y valida seccion `Solicitudes de amistad`.
5. Accede al enlace y confirma que abre `/chat`.

## 2) Chat bloqueado sin amistad

1. Con un usuario que no sea amigo del objetivo, abre `/chat?with=<userId>`.
2. Debe aparecer aviso: necesitas amistad aceptada.
3. Debe mostrar CTA para ir al perfil y enviar solicitud.
4. No debe crearse chat nuevo si no hay amistad aceptada.

## 3) Chat permitido con amistad aceptada

1. Acepta una solicitud de amistad desde `/chat`.
2. Abre `/chat?with=<friendUserId>`.
3. Debe abrirse/crearse la conversacion.
4. Envia mensaje y valida recepcion desde la otra cuenta.

## 4) Crear reto con formato BO1/BO3/BO5

1. Ve a `/challenges/new`.
2. Selecciona rival y juego.
3. En `Formato`, confirma opciones:
   - `BO1 - Mejor de 1`
   - `BO3 - Mejor de 3`
   - `BO5 - Mejor de 5`
4. Crea un reto.

## 5) Reporte de resultado por games

1. Acepta el reto y abre el match.
2. Reporta resultado usando `playerAScore` y `playerBScore`.
3. Pruebas recomendadas:
   - BO3: `2-1` (valido)
   - BO3: `2-0` (valido)
   - BO3: `1-1` (invalido)
4. El ganador debe calcularse automaticamente por marcador.

## 6) Confirmacion y ELO ponderado

1. Desde el rival, confirma resultado.
2. Verifica en `/matches/[id]`:
   - ELO before/after de ambos jugadores.
   - Score final del match.
3. Compara dos casos:
   - BO3 `2-1` (impacto moderado)
   - BO3 `2-0` (impacto mayor)

## 7) Historial de perfil

1. Entra en `/profile/[id]`.
2. En historial verifica:
   - Rival
   - Formato (BO1/BO3/BO5)
   - Resultado por games (ej. `2-1`)
   - Cambio de ELO (`+X` / `-X` cuando aplique)
