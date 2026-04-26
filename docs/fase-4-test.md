# Fase 4 - Guia de prueba manual

## Preparacion

1. Configura `DATABASE_URL`, `NEXTAUTH_URL` y `NEXTAUTH_SECRET`.
2. Ejecuta `npm install`.
3. Ejecuta `npm run db:generate`.
4. Aplica schema con `npm run db:push`.
5. Si tienes PostgreSQL disponible, ejecuta `npm run db:seed`.
6. Arranca la app con `npm run dev`.

## Credenciales seed

- Admin: `admin@tcgleague.dev` / `League123!`
- Owner Mana Vault + Pixel Tavern: `sergio@manavault.es` / `League123!`
- Owner Dragon Den: `laia@dragonden.es` / `League123!`
- Player: `luna@tcgleague.dev` / `League123!`

## Flujo 1 - Store finder avanzado

1. Inicia sesion con cualquier usuario.
2. Entra en `/stores`.
3. Comprueba busqueda por nombre.
4. Aplica filtros por:
   - ciudad
   - provincia/region
   - pais
   - juego
   - solo verificadas
   - con jugadores activos
5. Verifica que cada card muestra:
   - logo
   - nombre
   - ciudad/direccion
   - juegos
   - miembros activos
   - top player o ELO medio
   - estado verificada/no verificada
   - boton `Ver tienda`
   - boton `Solicitar unirme`
   - boton `Ver eventos oficiales` cuando existe link externo

## Flujo 2 - Ficha de tienda

1. Abre cualquier tienda desde `/stores`.
2. Comprueba en `/stores/[id]`:
   - datos de ubicacion/contacto
   - miembros actuales
   - ranking interno por ELO
   - bloque `Eventos oficiales`
3. Valida el texto: la inscripcion se hace en plataforma externa.
4. Abre al menos un link externo (locator/website/maps/discord/instagram).
5. Usa `Retar jugadores` y verifica redireccion a `/challenges/new?store=...`.

## Flujo 3 - Solicitar unirme desde directorio

1. Con un player que no pertenezca a una tienda, abre `/stores`.
2. Pulsa `Solicitar unirme` en una card.
3. Comprueba que te lleva al bloque de union en `/stores/[id]#join`.
4. Envia la solicitud.
5. Verifica estado `Solicitud pendiente`.

## Flujo 4 - Edicion de tienda por owner/admin

1. Inicia sesion como owner (`sergio@manavault.es`) o admin.
2. Entra a una tienda que gestionas.
3. Comprueba que aparece card `Editar tienda`.
4. Modifica:
   - address, description, logo/banner
   - websiteUrl, officialLocatorUrl, googleMapsUrl, discordUrl, instagramUrl
   - juegos soportados
5. Guarda cambios y recarga.
6. Verifica que se reflejan en la ficha y en `/stores`.

## Flujo 5 - Seguridad

1. Inicia sesion con un player normal.
2. Abre una tienda de terceros.
3. Verifica que NO aparece `Editar tienda`.
4. Si intentas editar via request manual, la action debe rechazar por permisos.

## Flujo 6 - Dashboard

1. Entra en `/dashboard`.
2. Comprueba bloques nuevos:
   - `Mis tiendas`
   - `Tiendas cerca de ti`
   - `Tiendas de mis juegos`
3. Verifica accesos:
   - `Abrir tienda`
   - `Eventos oficiales` (cuando aplique)
