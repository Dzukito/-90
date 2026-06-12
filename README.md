# 90+

**90+** es un MVP web mobile-first de decisiones futboleras agónicas. Sos el DT en los últimos minutos: elegís un equipo ficticio, una cábala, respondés a eventos dramáticos y bancás consecuencias narrativas y mecánicas.

Subtítulo: **Decisiones rápidas. Goles agónicos. Caos mundialista.**

El juego evita nombres oficiales, marcas, escudos, torneos reales y jugadores reales. Todo el contenido usa equipos ficticios y arquetipos futboleros.

## Cómo jugar

1. Abrí `index.html`.
2. Tocá **Partido rápido** o **Copa express**.
3. Elegí uno de los ocho equipos ficticios.
4. Elegí una cábala entre tres opciones aleatorias.
5. En el partido, respondé cada evento con una de tres decisiones.
6. Mirá el resultado, la racha, los puntos y copiá tu placa textual compartible.

Cada decisión modifica estadísticas como ataque, defensa, mentalidad, cansancio, control y caos. El caos no es solo malo: aumenta la probabilidad de goles agónicos, VAR, penales, errores, rojas y salvadas heroicas.

## Cómo correrlo localmente

No requiere instalación, servidor ni dependencias.

```bash
open index.html
```

También podés hacer doble click sobre `index.html` desde el explorador de archivos. El juego funciona directamente con `file://` y guarda progreso en `localStorage`.

## Cómo hostearlo en Cloudflare Pages

1. Subí este repositorio a GitHub, GitLab o Bitbucket.
2. En Cloudflare Pages, creá un nuevo proyecto conectado al repo.
3. Configuración recomendada:
   - Framework preset: **None**
   - Build command: vacío
   - Output directory: `/` o vacío según la UI
4. Deploy.

## Cómo hostearlo en Netlify

1. Entrá a Netlify y elegí **Add new site**.
2. Conectá el repositorio o arrastrá la carpeta del proyecto.
3. Configuración recomendada:
   - Build command: vacío
   - Publish directory: `.`
4. Deploy.

## Cómo hostearlo en GitHub Pages

1. Subí los archivos a un repositorio de GitHub.
2. En **Settings → Pages**, elegí la rama principal.
3. Seleccioná la carpeta raíz del repositorio.
4. Guardá y esperá la URL pública.

## Estructura de archivos

```text
index.html   # Documento base, carga CSS y JavaScript
styles.css   # Estética mobile-first, marcador, tarjetas, animaciones y responsive
game.js      # Datos, estado, motor probabilístico, localStorage, audio y renderizado
README.md    # Guía de uso, hosting y extensión del MVP
```

## Cómo agregar eventos nuevos

Los eventos viven en `EVENT_TEMPLATES` dentro de `game.js`. Cada entrada incluye:

```js
[
  'id-unico',
  'Texto del evento.',
  'Contexto dramático.',
  ['Decisión A', { attack: 10, chaos: 8 }, 'Narrativa de la decisión.', 'risk'],
  ['Decisión B', { control: 12 }, 'Narrativa de la decisión.', 'safe'],
  ['Decisión C', { attack: 6, defense: 4 }, 'Narrativa de la decisión.', 'balanced']
]
```

Recomendaciones:

- Usar siempre tres decisiones.
- Mantener modificadores claros y visibles.
- Usar `risk`, `safe` o `balanced` para que el motor ajuste probabilidades.
- Evitar nombres oficiales, marcas, jugadores reales o selecciones reales.

## Cómo modificar equipos

Los equipos están en la constante `TEAMS` de `game.js`. Cada equipo tiene:

- `name`
- `colors`
- `attack`
- `defense`
- `mentality`
- `control`
- `chaos`

Ejemplo:

```js
{ name: 'Leones', colors: ['#ff9b26', '#111111'], attack: 86, defense: 68, mentality: 83, control: 62, chaos: 77 }
```

## Cómo modificar puntuación

La puntuación está centralizada en `SCORE_RULES` dentro de `game.js`:

```js
const SCORE_RULES = {
  win: 300,
  draw: 100,
  loss: 30,
  lateGoal: 150,
  comeback: 250,
  cleanSheet: 100,
  redWin: 200,
  penaltySave: 200,
  varFavor: 120,
  cupWin: 700,
  finalLoss: 200
};
```

Cambiar esos valores ajusta los puntos del resultado, momentos épicos y Copa express.

## Persistencia

El progreso se guarda en `localStorage` con:

- partidos jugados
- victorias, empates y derrotas
- racha actual y mejor racha
- puntos totales
- copas ganadas
- último equipo usado
- momentos épicos desbloqueados
- sonido activado/desactivado

El botón **Reset progreso** reinicia esos datos.

## Audio

El juego usa Web Audio API sin archivos externos para sonidos cortos de click, gol, error, final, VAR, penal y roja. Si el navegador bloquea audio hasta la primera interacción, el juego continúa sin romperse.

## Futuras mejoras sugeridas

- ranking online
- salas privadas
- modo amigos
- eventos diarios
- modo penales
- modo narrador
- placas compartibles como imagen
- PWA instalable
