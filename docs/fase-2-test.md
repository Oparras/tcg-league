# Fase 2 - Guia de prueba manual

## Preparacion

1. Configura `DATABASE_URL`, `NEXTAUTH_URL` y `NEXTAUTH_SECRET`.
2. Instala dependencias con `npm install`.
3. Genera Prisma con `npm run db:generate`.
4. Aplica el schema con `npm run db:push`.
5. Si tienes PostgreSQL disponible, carga datos demo con `npm run db:seed`.
6. Inicia la app con `npm run dev`.

## Credenciales recomendadas

- Admin: `admin@tcgleague.dev` / `League123!`
- Owner Mana Vault: `sergio@manavault.es` / `League123!`
- Owner Dragon Den: `laia@dragonden.es` / `League123!`
- Owner adicional en seed: `sergio@manavault.es` tambien gestiona `Pixel Tavern Valencia`
- Player miembro: `luna@tcgleague.dev` / `League123!`
- Player sin membresia principal: `diego@tcgleague.dev` / `League123!`

## Flujo 1 - Registro

1. Entra en `/register`.
2. Crea un usuario nuevo con nick, nombre visible y ciudad.
3. Comprueba que no se pide elegir TCG principal durante el registro.
4. Finaliza el alta y entra en la app.
5. Abre Prisma Studio o el perfil del usuario y verifica que `mainGame` es `Riftbound`.

## Flujo 2 - Perfil propio

1. Inicia sesion con cualquier jugador.
2. Abre `/profile/me`.
3. Edita `nick`, `displayName`, `avatarUrl`, `city`, `bio`, `mainGame` y `availabilityStatus`.
4. Guarda y confirma que los cambios aparecen al recargar.
5. Intenta abrir otro perfil y confirma que no aparece el formulario de edicion.

## Flujo 3 - Listado y ficha de tiendas

1. Entra en `/stores`.
2. Busca una tienda por nombre.
3. Filtra por ciudad.
4. Filtra por juego soportado.
5. Abre una tienda y revisa:
   - datos base
   - juegos soportados
   - miembros
   - ranking interno
   - bloque de solicitud

## Flujo 4 - Solicitud de union

1. Accede con un jugador que no sea miembro de la tienda destino.
2. Entra en `/stores/mana-vault-madrid`.
3. Pulsa `Solicitar unirme` y envia un mensaje.
4. Vuelve a cargar la pagina y confirma que el estado queda en `pending`.
5. Intenta enviar otra solicitud pendiente a la misma tienda y confirma que se bloquea.

## Flujo 5 - Gestion por owner o admin

1. Inicia sesion como `sergio@manavault.es` o `admin@tcgleague.dev`.
2. Entra en `/stores/mana-vault-madrid/requests`.
3. Revisa la lista de solicitudes pendientes.
4. Acepta una solicitud.
5. Comprueba que:
   - la solicitud pasa a `accepted`
   - el jugador aparece en la ficha de la tienda
   - si no tenia tienda principal, ahora queda asignada
6. Repite el flujo con otra solicitud y usa `Rechazar`.
7. Comprueba que la solicitud pasa a `rejected`.

## Flujo 6 - Dashboard de owner

1. Inicia sesion como `sergio@manavault.es`.
2. Entra en `/dashboard`.
3. Comprueba que aparece el bloque `Solicitudes pendientes de mis tiendas`.
4. Verifica que las solicitudes se agrupan por tienda.
5. Usa el acceso directo a `Gestionar solicitudes` desde una de las tiendas.

## Flujo 7 - Panel admin

1. Inicia sesion como `admin@tcgleague.dev`.
2. Entra en `/admin`.
3. Comprueba que puedes:
   - cambiar el rol de un usuario
   - asignar owner a una tienda
   - validar o desvalidar una tienda
   - abrir la gestion de solicitudes de cualquier tienda
4. Crea una tienda nueva desde el formulario de creacion.
5. Edita una tienda existente y cambia juegos soportados o datos basicos.

## Flujo 8 - Verificacion cruzada

1. Vuelve a entrar como el jugador aceptado.
2. Abre `/profile/me` y confirma que la tienda aparece como actual.
3. Entra en la ficha de la tienda y revisa que ya figura entre los miembros.
4. Si la solicitud fue rechazada, confirma que la tienda permite reenviar la solicitud con un nuevo mensaje.
