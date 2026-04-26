# Fase 3 - Guia de prueba manual

## Preparacion

1. Configura `DATABASE_URL`, `NEXTAUTH_URL` y `NEXTAUTH_SECRET`.
2. Ejecuta `npm install`.
3. Genera Prisma con `npm run db:generate`.
4. Aplica el schema con `npm run db:push`.
5. Si tienes PostgreSQL disponible, carga datos demo con `npm run db:seed`.
6. Arranca la app con `npm run dev`.

## Credenciales seed

- Admin: `admin@tcgleague.dev` / `League123!`
- Owner Mana Vault y Pixel Tavern: `sergio@manavault.es` / `League123!`
- Owner Dragon Den: `laia@dragonden.es` / `League123!`
- Player Riftbound: `luna@tcgleague.dev` / `League123!`
- Player One Piece: `marco@tcgleague.dev` / `League123!`
- Player Pokemon: `sofia@tcgleague.dev` / `League123!`
- Player Magic: `alex@tcgleague.dev` / `League123!`
- Player Lorcana: `diego@tcgleague.dev` / `League123!`

## Flujo 1 - Crear reto nuevo

1. Inicia sesion como `luna@tcgleague.dev`.
2. Entra en `/challenges/new`.
3. Filtra jugadores si quieres por tienda o juego.
4. Selecciona un rival y crea un reto con fecha futura.
5. Comprueba que vuelves a `/challenges` y que el reto aparece en `Enviados`.

## Flujo 2 - Aceptar, rechazar o contraofertar

1. Inicia sesion con la cuenta retada.
2. Entra en `/challenges?tab=received`.
3. Prueba los tres caminos:
   - `Aceptar`
   - `Rechazar`
   - `Proponer nueva fecha`
4. Si se acepta, comprueba que aparece enlace a `/matches/[id]`.
5. Si hay contraoferta, vuelve con el retador y acepta la nueva fecha desde `Enviados`.

## Flujo 3 - Reportar resultado

1. Usa un match en estado `ACCEPTED`.
2. Entra en `/matches/[id]` como uno de los participantes.
3. Reporta ganador y prueba opcional.
4. Comprueba que el match pasa a `PLAYED_PENDING_CONFIRMATION`.

## Flujo 4 - Confirmar o disputar

1. Inicia sesion con el otro jugador del match.
2. Entra en `/matches/[id]`.
3. Prueba:
   - `Confirmar resultado`
   - `Disputar`
4. Si confirmas:
   - el match pasa a `CONFIRMED`
   - el ELO del juego cambia
   - el ELO global y stats del perfil se actualizan
5. Si disputas:
   - el match pasa a `DISPUTED`
   - aparece la disputa en `/admin`
   - si eres owner del store implicado, la veras tambien en dashboard

## Flujo 5 - Resolver disputa

1. Inicia sesion como `admin@tcgleague.dev`.
2. Entra en `/admin`.
3. Busca el bloque `Matches disputados`.
4. Abre el match y resuelve la disputa:
   - `Confirmar resultado`
   - `Cancelar match`

## Flujo 6 - Ranking y perfiles

1. Entra en `/rankings`.
2. Verifica:
   - ranking global
   - ranking por juego
   - filtro por tienda
   - filtro por ciudad
3. Entra en `/profile/[id]` de un jugador y comprueba:
   - historial de matches
   - ELO por juego
   - boton `Retar jugador`

## Flujo 7 - Dashboard

1. Como jugador, revisa `/dashboard`.
2. Comprueba que aparecen:
   - retos recibidos
   - matches proximos
   - resultados pendientes de confirmar
   - ultimos matches confirmados
3. Como owner, revisa tambien:
   - solicitudes pendientes de tus tiendas
   - disputas de tus tiendas cuando existan

## Flujo 8 - Regresion de retos duplicados

1. Crea un reto `A vs B` para un juego concreto.
2. Acepta el reto.
3. Reporta resultado.
4. Confirma resultado para que el match quede `CONFIRMED`.
5. Intenta crear otro reto `A vs B` para el mismo juego.
6. Debe permitirse porque el reto anterior ya no esta activo.
