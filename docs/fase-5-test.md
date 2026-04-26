# Fase 5 - Guia de prueba manual

## Preparacion

1. Configura `DATABASE_URL`, `NEXTAUTH_URL` y `NEXTAUTH_SECRET`.
2. Ejecuta `npm install`.
3. Ejecuta `npm run db:generate`.
4. Aplica schema con `npm run db:push`.
5. Si tienes PostgreSQL disponible, carga demo con `npm run db:seed`.
6. Arranca la app con `npm run dev`.

## Credenciales seed

- Admin: `admin@tcgleague.dev` / `League123!`
- Player Luna: `luna@tcgleague.dev` / `League123!`
- Player Marco: `marco@tcgleague.dev` / `League123!`
- Player Sofia: `sofia@tcgleague.dev` / `League123!`
- Player Alex (solicitud pendiente hacia Luna): `alex@tcgleague.dev` / `League123!`

## Flujo 1 - Solicitud de amistad desde perfil

1. Inicia sesion como `marco@tcgleague.dev`.
2. Abre perfil por nick, por ejemplo `/profile/SofiaNova`.
3. Pulsa `Añadir amigo`.
4. Verifica mensaje de exito y estado de solicitud enviada.
5. Cambia a `sofia@tcgleague.dev` y revisa:
   - `/profile/me`
   - `/chat`
   Debe aparecer la solicitud en pendientes.

## Flujo 2 - Aceptar/Rechazar solicitud

1. Como destinatario, abre `/chat`.
2. En bloque `Solicitudes pendientes`, pulsa `Aceptar` o `Rechazar`.
3. Si aceptas:
   - aparece en lista de amigos
   - puedes abrir `Mensaje`
4. Si rechazas:
   - desaparece de pendientes
   - no permite chat directo hasta nueva solicitud

## Flujo 3 - Chat 1:1

1. Con dos usuarios amigos (por ejemplo `luna` y `marco`), abre `/chat`.
2. Selecciona conversacion o abre `/chat?with=<userId>`.
3. Envía un mensaje.
4. Cambia al otro usuario y abre el mismo chat:
   - debe verse el mensaje nuevo
   - al abrir chat se marca como leido
5. Verifica que un usuario no participante no puede acceder enviando `chatId` manual.

## Flujo 4 - Perfil publico mejorado

1. Abre `/profile/[id]` de otro jugador.
2. Verifica botones:
   - `Retar jugador`
   - `Añadir amigo` o `Mensaje` segun estado
3. Comprueba badges y stats:
   - tienda
   - ELO
   - juego principal / ELO por juego
   - historial de partidas

## Flujo 5 - Dashboard social

1. Entra en `/dashboard`.
2. Verifica:
   - bloque de solicitudes de amistad pendientes
   - bloque de ultimos mensajes
   - acceso rapido a `/chat`

## Flujo 6 - Notificaciones

1. Envia solicitud de amistad -> se crea `FRIEND_REQUEST`.
2. Acepta solicitud -> se crea `FRIEND_REQUEST_ACCEPTED`.
3. Envia mensaje -> se crea `NEW_MESSAGE`.
4. El contador superior de pendientes accionables no debe mezclar historico no accionable.
