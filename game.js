'use strict';

// 90+ mantiene datos, motor y render separados para que sumar eventos sea directo.
const STORAGE_KEY = 'noventa_mas_stats_v1';
const app = document.querySelector('#app');
const toast = document.querySelector('#toast');

const TEAMS = [
  { name: 'Albicelestes', colors: ['#90ddff', '#ffffff'], attack: 78, defense: 70, mentality: 88, control: 82, chaos: 58 },
  { name: 'Verdes', colors: ['#16c172', '#f3f16b'], attack: 82, defense: 66, mentality: 76, control: 73, chaos: 72 },
  { name: 'Rojos', colors: ['#e92f55', '#ffcf3f'], attack: 84, defense: 63, mentality: 79, control: 68, chaos: 80 },
  { name: 'Azules', colors: ['#2d6cff', '#b9d7ff'], attack: 70, defense: 84, mentality: 74, control: 79, chaos: 52 },
  { name: 'Cóndores', colors: ['#2e3547', '#f4f4f4'], attack: 72, defense: 82, mentality: 86, control: 67, chaos: 61 },
  { name: 'Leones', colors: ['#ff9b26', '#111111'], attack: 86, defense: 68, mentality: 83, control: 62, chaos: 77 },
  { name: 'Samuráis', colors: ['#e9eefb', '#e1223f'], attack: 74, defense: 76, mentality: 82, control: 86, chaos: 48 },
  { name: 'Águilas', colors: ['#0b2347', '#d8a72d'], attack: 76, defense: 74, mentality: 78, control: 71, chaos: 69 },
];

const CABALAS = [
  { name: 'No mirar el penal', mods: { mentality: 12, chaos: 14 }, note: 'Sube la fe, sube el temblor.' },
  { name: 'Cambiar de camiseta', mods: { attack: 5, chaos: 10 }, note: 'La pilcha nueva pide desorden.' },
  { name: 'Tocar pasto', mods: { control: 10, chaos: -8 }, note: 'Cable a tierra en medio del incendio.' },
  { name: 'Sentarse en el mismo lugar', mods: { defense: 8, mentality: 8 }, note: 'Orden místico, espalda firme.' },
  { name: 'Insultar al televisor', mods: { attack: 10, chaos: 18 }, note: 'Catarsis pura. Puede salir cualquier cosa.' },
  { name: 'Mandar audio de fe', mods: { mentality: 15, control: -5 }, note: 'El grupo cree, pero se apura.' },
  { name: 'No decir la palabra final', mods: { defense: 7, chaos: -4 }, note: 'Nadie mufa. Nadie respira.' },
  { name: 'Agarrar la taza de siempre', mods: { control: 8, mentality: 5 }, note: 'Pulso caliente, cabeza fría.' },
  { name: 'Besar la camiseta', mods: { mentality: 13, attack: 4 }, note: 'Mística en la tela.' },
  { name: 'Poner la misma canción', mods: { attack: 7, control: 6 }, note: 'Ritmo conocido para el último baile.' },
  { name: 'Apagar la luz del living', mods: { defense: 5, chaos: 12 }, note: 'Oscuridad, nervio y dientes apretados.' },
  { name: 'Mirar de reojo', mods: { mentality: 7, chaos: 7, control: 3 }, note: 'No enfrentás al destino: lo espiás.' },
];

const EMOTIONS = [
  'El partido está roto.', 'Tu equipo empuja con lo último.', 'El rival hace tiempo.',
  'Se juega más con el corazón que con la cabeza.', 'El estadio está insoportable.',
  'Cada pelota parece la última.', 'Tu equipo necesita una decisión valiente.', 'El caos está servido.'
];

const SCORE_RULES = { win: 300, draw: 100, loss: 30, lateGoal: 150, comeback: 250, cleanSheet: 100, redWin: 200, penaltySave: 200, varFavor: 120, cupWin: 700, finalLoss: 200 };
const EPICS = ['Gol al 90+5', 'Remontada imposible', 'Penal atajado', 'Con uno menos', 'VAR salvador', 'Copa levantada', 'Mística total', 'Partido horrendo ganado igual'];
const CUP_ROUNDS = ['Grupo partido 1', 'Grupo partido 2', 'Semifinal', 'Final'];

const EVENT_TEMPLATES = [
  ['corner-902', 'Tenés un córner en el 90+2.', 'El área parece una olla popular de camisetas y codazos.', ['Mandar todos al área', { attack: 18, defense: -12, chaos: 18, fatigue: 8 }, 'Mandaste todos al área y dejaste espacios atrás.', 'risk'], ['Jugar corto', { control: 15, attack: 6, chaos: -6 }, 'Tu equipo ganó control, pero perdió sorpresa.', 'safe'], ['Centro al primer palo', { attack: 12, chaos: 8 }, 'Buscaste el golpe corto antes de que tiemble todo.', 'balanced']],
  ['rival-atras', 'El rival se mete atrás.', 'Dos líneas hundidas, un arquero que tarda siglos.', ['Quemar las naves', { attack: 16, defense: -10, chaos: 14 }, 'Fuiste con todo y el fondo quedó mano a mano con el miedo.', 'risk'], ['Moverla de lado a lado', { control: 14, attack: 5, fatigue: 4 }, 'Bajaste pulsaciones para encontrar el hueco.', 'safe'], ['Tirar centros picantes', { attack: 11, chaos: 10 }, 'La pelota empezó a llover en el área.', 'balanced']],
  ['nueve-fundido', 'Tu 9 está fundido.', 'Camina como si tuviera arena en los botines.', ['Dejarlo por mística', { mentality: 10, fatigue: 8, chaos: 8 }, 'Confiaste en el apellido que no existe, pero pesa.', 'risk'], ['Meter suplente fresco', { attack: 7, fatigue: -10, control: 4 }, 'Piernas nuevas para atacar el último metro.', 'balanced'], ['Pedirle que aguante de espaldas', { control: 10, attack: -2, defense: 4 }, 'Enfriaste el trámite con oficio.', 'safe']],
  ['adiciona-seis', 'El árbitro adiciona 6 minutos.', 'El cartel brilla como una amenaza y una promesa.', ['Celebrar la vida', { mentality: 12, attack: 8, chaos: 8 }, 'Tu banco sintió que todavía hay película.', 'balanced'], ['Ordenar cabeza fría', { control: 12, defense: 7, chaos: -6 }, 'El mensaje fue claro: que no los coma la ansiedad.', 'safe'], ['Protestar el reloj', { chaos: 15, mentality: -4 }, 'El banco prendió fuego el ambiente.', 'risk']],
  ['var-mano', 'VAR revisa una mano.', 'Nadie sabe si rezar, insultar o esconderse abajo de la mesa.', ['Presionar al cuarto árbitro', { chaos: 16, mentality: 5 }, 'Subió el caos: puede pasar cualquier cosa.', 'risk'], ['Calmar al equipo', { control: 10, mentality: 8, chaos: -4 }, 'La mentalidad alta sostuvo al equipo en el peor momento.', 'safe'], ['Preparar al pateador', { attack: 8, mentality: 10 }, 'El posible penal ya tenía dueño.', 'balanced']],
  ['hinchada-empuja', 'La hinchada empieza a empujar.', 'El estadio late como tambor en la nuca.', ['Subir líneas', { attack: 13, defense: -6, mentality: 8, fatigue: 5 }, 'La tribuna llevó al equipo diez metros adelante.', 'risk'], ['Pedir paciencia', { control: 13, chaos: -6 }, 'Bajaste el ritmo y enfriaste el partido.', 'safe'], ['Buscar al capitán', { mentality: 12, control: 4 }, 'La pelota fue al que no se esconde.', 'balanced']],
  ['mano-a-mano-arquero', 'Tu arquero queda mano a mano.', 'Se congeló el tiempo y se escuchó un “nooo” colectivo.', ['Achicar como loco', { defense: 10, chaos: 12, mentality: 5 }, 'El arquero fue grande y el arco chico.', 'risk'], ['Esperar hasta último segundo', { control: 8, defense: 8, chaos: -3 }, 'Leyó la jugada con hielo en las venas.', 'safe'], ['Reventarla si hay rebote', { defense: 12, control: -5 }, 'Primero vivir, después explicar.', 'balanced']],
  ['espacios-rival', 'El rival deja espacios.', 'Se abrieron pasillos donde antes había patadas.', ['Contra directa', { attack: 15, control: -5, chaos: 12 }, 'Oliste sangre y saliste disparado.', 'risk'], ['Pase seguro entre líneas', { control: 12, attack: 7 }, 'Elegiste precisión antes que vértigo.', 'safe'], ['Cambio de frente', { attack: 10, chaos: 5, fatigue: 3 }, 'La cancha se inclinó de golpe.', 'balanced']],
  ['capitan-calma', 'Tu capitán pide calma.', 'Señala la sien mientras todos quieren patear desde su casa.', ['Obedecer al capitán', { control: 15, mentality: 8, chaos: -8 }, 'Tu equipo ganó control, pero perdió sorpresa.', 'safe'], ['Ignorarlo y acelerar', { attack: 12, chaos: 13, fatigue: 5 }, 'La ansiedad tomó el volante.', 'risk'], ['Pedir una jugada preparada', { control: 8, attack: 9 }, 'El pizarrón apareció entre los gritos.', 'balanced']],
  ['tiro-libre', 'Hay tiro libre cerca del área.', 'La barrera transpira, el arquero acomoda fantasmas.', ['Patear al arco', { attack: 14, chaos: 9 }, 'Fuiste por tapa de diario.', 'balanced'], ['Jugada ensayada', { control: 12, attack: 8, chaos: -3 }, 'La pelota salió con libreto.', 'safe'], ['Centro pasado', { attack: 11, chaos: 12, defense: -3 }, 'Cargaste el segundo palo con fe y desorden.', 'risk']],
  ['lateral-amarilla', 'Tu lateral está amonestado.', 'El extremo rival lo encara como si oliera sangre.', ['Cambiarlo ya', { defense: 9, fatigue: -6, control: 4 }, 'Cortaste el incendio antes de la roja.', 'safe'], ['Que siga fuerte', { defense: 6, mentality: 8, chaos: 10 }, 'Le pediste carácter al borde del abismo.', 'risk'], ['Darle ayuda del volante', { defense: 10, attack: -4, control: 5 }, 'Cerraste la banda, resignando salida.', 'balanced']],
  ['delantero-rival', 'El rival mete un delantero más.', 'Te tiraron otro problema al área.', ['Responder con presión', { attack: 10, defense: -4, chaos: 9 }, 'No aceptaste retroceder.', 'risk'], ['Cerrar con cinco atrás', { defense: 15, attack: -7, chaos: -4 }, 'Blindaste el área y bancaste los silbidos.', 'safe'], ['Guardar un cambio ofensivo', { mentality: 7, attack: 5, fatigue: -3 }, 'Quedó una bala para el final.', 'balanced']],
  ['ultima-pelota', 'Última pelota del partido.', 'Hasta el relator está parado.', ['Al área sin mirar', { attack: 17, defense: -10, chaos: 18 }, 'La tiraste donde viven los milagros.', 'risk'], ['Asegurar el empate', { defense: 12, control: 10, attack: -7 }, 'Elegiste sobrevivir antes que ser estatua.', 'safe'], ['Buscar rebote frontal', { attack: 12, chaos: 9 }, 'La segunda jugada quedó como plan secreto.', 'balanced']],
  ['pierde-paciencia', 'Tu equipo pierde la paciencia.', 'Dos pases mal y empiezan los murmullos internos.', ['Gritar desde el banco', { mentality: 10, chaos: 8 }, 'Metiste presencia de DT en pleno temblor.', 'balanced'], ['Pedir diez pases', { control: 16, attack: -4, chaos: -9 }, 'Bajaste el ritmo y enfriaste el partido.', 'safe'], ['Partir el equipo', { attack: 14, defense: -12, chaos: 15 }, 'Todo o nada, sin zona media.', 'risk']],
  ['rival-tiempo', 'El rival hace tiempo.', 'Cada saque de arco dura una mudanza.', ['Presionar al árbitro', { chaos: 12, mentality: 5 }, 'El banco explotó y contagió urgencia.', 'risk'], ['Robar rápido y jugar', { attack: 9, control: 8, fatigue: 4 }, 'Convertiste bronca en pelota.', 'balanced'], ['No entrar en la trampa', { mentality: 10, control: 9, chaos: -7 }, 'El equipo no mordió el anzuelo.', 'safe']],
  ['dividida-mitad', 'Pelota dividida en mitad de cancha.', 'El que gana esta pelota gana diez segundos de alma.', ['Ir fuerte', { mentality: 9, chaos: 12, defense: 4 }, 'Ganaste presencia, compraste riesgo.', 'risk'], ['Esperar segunda jugada', { control: 10, defense: 6 }, 'Ordenaste la caza del rebote.', 'safe'], ['Saltar líneas', { attack: 11, control: -3, chaos: 7 }, 'La pelota viajó sin pedir permiso.', 'balanced']],
  ['centro-pasado', 'Centro pasado al segundo palo.', 'La pelota cae con nieve y destino.', ['Atacar con el lateral', { attack: 13, defense: -6, fatigue: 4 }, 'El lateral llegó como delantero clandestino.', 'risk'], ['Bajarla al medio', { control: 9, attack: 10, chaos: 4 }, 'Buscaste una pausa en plena estampida.', 'balanced'], ['Cuidar el rebote', { defense: 10, control: 5, attack: -3 }, 'Pensaste en la contra antes que en la foto.', 'safe']],
  ['error-salida', 'Error en salida.', 'Un pase al medio que envejeció pésimo.', ['Falta táctica', { defense: 8, chaos: 14, mentality: -3 }, 'Cortaste con barro y rezos.', 'risk'], ['Replegar urgente', { defense: 14, fatigue: 5, control: -4 }, 'Todos corrieron hacia su arco como bomberos.', 'balanced'], ['Confiar en el arquero', { mentality: 8, defense: 6, chaos: 6 }, 'La última línea pidió silencio.', 'safe']],
  ['contra-3v2', 'Contraataque 3 contra 2.', 'Tres camisetas rivales vienen con hambre.', ['Salir a cortar', { defense: 8, chaos: 13 }, 'El central eligió cuchillo entre dientes.', 'risk'], ['Temporizar', { control: 10, defense: 9, fatigue: 3 }, 'Compraste segundos de oro.', 'safe'], ['Cerrar pase al medio', { defense: 12, control: 3 }, 'Obligaste al rival a pensar rápido.', 'balanced']],
  ['penal-dudoso', 'Penal dudoso.', 'El árbitro señaló y medio estadio dejó de existir.', ['Arquero a intimidar', { mentality: 12, chaos: 12, defense: 5 }, 'El arquero caminó enorme hacia la pelota.', 'risk'], ['Estudiar al pateador', { control: 12, defense: 7, chaos: -3 }, 'Leíste el cuerpo, no la tribuna.', 'safe'], ['Protesta medida', { chaos: 8, mentality: 6 }, 'Buscaste enfriar sin regalar roja.', 'balanced']],
  ['suplente-pide', 'Tu suplente pide entrar.', 'Te mira fijo como quien trae un capítulo nuevo.', ['Meterlo de héroe', { attack: 12, mentality: 8, fatigue: -8, chaos: 6 }, 'El banco creyó en el guion imposible.', 'balanced'], ['No tocar nada', { control: 8, mentality: 5 }, 'La estructura se mantuvo por convicción.', 'safe'], ['Doble cambio ofensivo', { attack: 16, defense: -8, chaos: 13, fatigue: -5 }, 'Quemaste los papeles y los cambios.', 'risk']],
  ['lluvia', 'Se viene una lluvia tremenda.', 'La pelota empieza a patinar como jabón.', ['Pelotazos al área', { attack: 10, chaos: 15, control: -8 }, 'Con lluvia, cada rebote es una moneda al aire.', 'risk'], ['Pases cortos', { control: 14, attack: -2, chaos: -5 }, 'Elegiste suela y paciencia.', 'safe'], ['Remates de lejos', { attack: 9, chaos: 9 }, 'Le apuntaste al pique traicionero.', 'balanced']],
  ['publico-silba', 'El público silba cada pase.', 'La ansiedad baja desde la tribuna como granizo.', ['Pedir personalidad', { mentality: 14, control: 5 }, 'La mentalidad alta sostuvo al equipo en el peor momento.', 'safe'], ['Acelerar para callarlos', { attack: 10, chaos: 12, fatigue: 4 }, 'La bronca se volvió vértigo.', 'risk'], ['Cambiar de banda', { control: 8, attack: 7 }, 'Sacaste la pelota de la zona caliente.', 'balanced']],
  ['arquero-inseguro', 'El arquero rival está inseguro.', 'No agarra una pelota: las negocia.', ['Llenarlo de centros', { attack: 14, chaos: 12 }, 'Fuiste directo a su duda.', 'risk'], ['Rematar bajo', { attack: 10, control: 5 }, 'Buscaste el error sin regalarte.', 'balanced'], ['Tocar hasta entrar', { control: 13, attack: 4, chaos: -4 }, 'La paciencia también lastima.', 'safe']],
  ['equipo-partido', 'Tu equipo está partido.', 'Hay un océano entre volantes y delanteros.', ['Jugar largo', { attack: 11, control: -8, chaos: 11 }, 'Aceptaste el desorden como idioma.', 'risk'], ['Juntar líneas', { control: 12, defense: 8, attack: -4 }, 'Cosiste el equipo con gritos.', 'safe'], ['Soltar un volante', { attack: 9, defense: -5, control: 6 }, 'Buscaste conexión sin perder todo.', 'balanced']],
  ['rival-duerme', 'El rival pide calma y duerme el partido.', 'Te esconden la pelota como si fuera un secreto de familia.', ['Presión alta', { attack: 12, defense: -5, fatigue: 6, chaos: 8 }, 'Fuiste a robar la siesta rival.', 'risk'], ['Bloque medio', { defense: 9, control: 8 }, 'No te partiste por desesperación.', 'safe'], ['Falta inteligente', { defense: 6, chaos: 8, mentality: 4 }, 'Cortaste el ritmo sin pedir disculpas.', 'balanced']],
  ['enganche-pide', 'Tu enganche pide la pelota.', 'Levanta la mano como si tuviera un mapa.', ['Dársela siempre', { control: 11, attack: 9, fatigue: 3 }, 'La pelota encontró dueño.', 'balanced'], ['Usarlo de señuelo', { attack: 12, chaos: 7 }, 'El rival mordió el anzuelo elegante.', 'risk'], ['Cuidarlo de la marca', { control: 8, defense: 4, chaos: -3 }, 'No lo mandaste a la carnicería.', 'safe']],
  ['rebote-medialuna', 'Hay rebote en la medialuna.', 'La pelota quedó pidiendo una volea inmortal.', ['Pegarle de primera', { attack: 15, chaos: 12 }, 'No pensaste: le pegaste a la historia.', 'risk'], ['Abrir a un costado', { control: 12, attack: 6, chaos: -4 }, 'Elegiste un pase más cuando todos gritaban.', 'safe'], ['Amagar y filtrar', { attack: 10, control: 8, chaos: 5 }, 'Metiste pausa de potrero.', 'balanced']],
  ['central-renguea', 'Tu central queda rengueando.', 'Corre con una pierna y orgullo.', ['Cambiarlo', { defense: 10, fatigue: -7, control: 4 }, 'Sacaste el problema antes de que fuera tragedia.', 'safe'], ['Dejarlo por arriba', { defense: 6, mentality: 10, chaos: 8 }, 'El tipo se quedó defendiendo con el alma.', 'risk'], ['Protegerlo con doble marca', { defense: 12, attack: -5 }, 'El equipo tapó la herida.', 'balanced']],
  ['arbitro-reloj', 'El árbitro mira el reloj.', 'Ese gesto dolió más que un remate al travesaño.', ['Último empujón', { attack: 14, fatigue: 6, chaos: 10 }, 'Todos entendieron que queda una bala.', 'risk'], ['No rifarla', { control: 12, mentality: 6, chaos: -5 }, 'La cabeza fría peleó contra el reloj.', 'safe'], ['Pedir pelota parada', { attack: 8, chaos: 6, control: 4 }, 'Buscaste una falta como quien busca oxígeno.', 'balanced']],
  ['estadio-abajo', 'El estadio se viene abajo.', 'El ruido tapa indicaciones, pensamientos y promesas.', ['Señas simples', { control: 8, mentality: 8 }, 'Reduciste el plan a dos gestos y fe.', 'safe'], ['Aprovechar la locura', { attack: 12, chaos: 14 }, 'Te subiste a la ola sin cinturón.', 'risk'], ['Cantar con la tribuna', { mentality: 13, fatigue: -2, chaos: 5 }, 'El cansancio se olvidó por un minuto.', 'balanced']],
  ['alcanzapelotas', 'Un alcanzapelotas tarda en devolverla.', 'La picardía ajena te roba segundos de vida.', ['Explotar contra todos', { chaos: 15, mentality: -2 }, 'La escena prendió fuego el banco.', 'risk'], ['Pedir otra pelota', { control: 9, mentality: 6 }, 'Solución rápida, bronca guardada.', 'safe'], ['Usar el enojo', { attack: 9, chaos: 7 }, 'La furia salió por la banda.', 'balanced']],
  ['pelotazo-rival', 'El rival tira un pelotazo largo.', 'Una pelota fea, alta y llena de malas noticias.', ['Achicar defensa', { defense: 8, chaos: 10 }, 'La línea salió como resorte.', 'risk'], ['Cubrir espalda', { defense: 13, control: 5 }, 'No compraste el engaño del pelotazo.', 'safe'], ['Ganar segunda pelota', { mentality: 8, defense: 7, fatigue: 3 }, 'El rebote fue una final dentro de la final.', 'balanced']],
  ['arquero-sube', 'Tu arquero quiere subir al córner.', 'Te mira desde mitad de cancha preguntando si hay permiso.', ['Que suba', { attack: 16, defense: -16, chaos: 20, mentality: 6 }, 'Mandaste al arquero al área y quemaste la cordura.', 'risk'], ['Que se quede', { defense: 12, control: 6, chaos: -5 }, 'Elegiste no tentar al meme.', 'safe'], ['Solo si es la última', { attack: 9, defense: -6, chaos: 10 }, 'Guardaste la locura para el segundo exacto.', 'balanced']],
  ['tiempo-otra', 'El rival empieza a hacer tiempo.', 'Ahora también se atan cordones imaginarios.', ['Presión de banco', { chaos: 10, mentality: 6 }, 'El banco rugió como platea popular.', 'balanced'], ['Robar sin falta', { control: 9, defense: 7 }, 'La paciencia evitó regalar una pausa.', 'safe'], ['Ir al choque', { defense: 5, attack: 7, chaos: 13 }, 'El partido entró en modo barro.', 'risk']],
  ['tumulto', 'Se arma un tumulto cerca del banco.', 'Empujones, dedos en alto y un auxiliar que corre raro.', ['Separar a todos', { mentality: 9, control: 8, chaos: -6 }, 'No dejaste que el quilombo jugara por vos.', 'safe'], ['Meter presión', { chaos: 15, mentality: 5 }, 'La temperatura subió diez grados.', 'risk'], ['Hablarle al árbitro', { control: 6, chaos: 5, defense: 4 }, 'Intentaste convertir caos en decisión.', 'balanced']],
  ['cartel-cuarto', 'El cuarto árbitro levanta el cartel.', 'Los números parecen escritos por un enemigo personal.', ['Acelerar cambios', { fatigue: -6, attack: 7, chaos: 5 }, 'Moviste el banco sin nostalgia.', 'balanced'], ['Gritar orden final', { defense: 7, mentality: 8, control: 5 }, 'Todos escucharon el plan de supervivencia.', 'safe'], ['Atacar sin mirar', { attack: 14, defense: -9, chaos: 14 }, 'El cartel fue nafta.', 'risk']],
  ['toca-de-mas', 'Tu equipo toca de más.', 'La jugada pide cuchillo, pero aparecen moños.', ['Pedir remate', { attack: 11, chaos: 6 }, 'Basta de decorar: al arco.', 'balanced'], ['Seguir madurando', { control: 14, attack: 3, chaos: -6 }, 'La jugada se cocinó lento.', 'safe'], ['Tirar pared imposible', { attack: 13, control: -3, chaos: 11 }, 'Probaste una locura de baldosa.', 'risk']],
  ['volante-roja', 'Tu volante está al borde de la roja.', 'Una falta más y mira el final desde el túnel.', ['Sacarlo urgente', { defense: 6, fatigue: -5, chaos: -6 }, 'Evitaste jugar con fuego y fósforos.', 'safe'], ['Pedirle que muerda igual', { defense: 9, mentality: 8, chaos: 13 }, 'Le diste permiso para caminar la cornisa.', 'risk'], ['Cambiarle la zona', { control: 8, defense: 5 }, 'Lo sacaste del foco sin romper el equipo.', 'balanced']],
  ['falta-tonta', 'Hay una falta tonta en tres cuartos.', 'Regalaste una pelota quieta donde duele.', ['Marcar mixto', { defense: 10, control: 4 }, 'Cada uno tuvo marca y responsabilidad.', 'safe'], ['Línea alta', { defense: 6, chaos: 12 }, 'Jugaste al milímetro con el alma en la boca.', 'risk'], ['Poner todos en el área', { defense: 13, attack: -5, fatigue: 3 }, 'Defendiste con multitud.', 'balanced']],
  ['rival-pierde-marca', 'El rival pierde la marca.', 'Uno tuyo aparece solo por atrás de todos.', ['Meter pase filtrado', { attack: 14, control: 5 }, 'Viste el hueco antes que la TV.', 'balanced'], ['Centro fuerte', { attack: 11, chaos: 8 }, 'La pelota cruzó el área como alarma.', 'risk'], ['Pisar y asegurar', { control: 12, chaos: -5 }, 'No dejaste que la ansiedad decidiera.', 'safe']],
  ['extremo-mano', 'Tu extremo queda mano a mano.', 'Tiene campo, piernas y una duda gigante.', ['Encarar al área', { attack: 15, chaos: 9, fatigue: 4 }, 'Le pediste gambeta de poster.', 'risk'], ['Tocar atrás', { control: 12, attack: 4, chaos: -5 }, 'La jugada siguió respirando.', 'safe'], ['Centro rasante', { attack: 12, chaos: 7 }, 'Buscaste el desvío venenoso.', 'balanced']],
  ['nueve-centro', 'El nueve pide centro.', 'Levanta los brazos como si ya hubiera ganado de arriba.', ['Centro a la cabeza', { attack: 13, chaos: 8 }, 'La pelota fue directo al choque de destinos.', 'balanced'], ['Amagar centro y entrar', { attack: 11, control: 6, chaos: 6 }, 'Engañaste al área entera.', 'risk'], ['Tocar al borde', { control: 11, attack: 5, chaos: -4 }, 'Elegiste segunda ola.', 'safe']],
  ['duda-atacar-cuidar', 'Tu equipo duda entre atacar o cuidar el empate.', 'El empate sirve, pero la gloria llama desde la otra punta.', ['Ir por todo', { attack: 15, defense: -10, chaos: 12 }, 'La gloria le ganó a la calculadora.', 'risk'], ['Cuidar el punto', { defense: 12, control: 10, attack: -8 }, 'El resultado se volvió prioridad.', 'safe'], ['Atacar con orden', { attack: 8, defense: 4, control: 8 }, 'Buscaste premio sin regalar la billetera.', 'balanced']],
  ['rival-mal-parado', 'El rival queda mal parado.', 'Dos defensores miran para lados distintos.', ['Pase vertical ya', { attack: 15, control: -3, chaos: 8 }, 'Atacaste antes de que se acomoden.', 'risk'], ['Sumar gente', { attack: 10, fatigue: 5, control: 6 }, 'Llegaron camisetas como una avalancha.', 'balanced'], ['Guardar posesión', { control: 13, defense: 4, chaos: -5 }, 'Preferiste no convertir ventaja en boomerang.', 'safe']],
  ['pelota-picando', 'La pelota queda picando en el área.', 'Nadie la domina. Todos la sueñan.', ['Romper el arco', { attack: 16, chaos: 12 }, 'Le pegaste con todo el barrio encima.', 'risk'], ['Empujarla suave', { attack: 10, control: 7 }, 'La sutileza apareció en la carnicería.', 'balanced'], ['Pedir penal', { chaos: 11, mentality: 5 }, 'La protesta también jugó su partido.', 'risk']],
  ['arquero-saca-rapido', 'Tu arquero saca rápido.', 'El rival volvió caminando y hay campo libre.', ['Contra con tres pases', { attack: 14, fatigue: 5, chaos: 7 }, 'El saque fue una puñalada larga.', 'risk'], ['Salir por abajo', { control: 13, attack: 4 }, 'Convertiste apuro en claridad.', 'safe'], ['Buscar al nueve', { attack: 9, chaos: 8 }, 'La pelota fue al duelo de siempre.', 'balanced']],
  ['silbido-publico', 'Se escucha el silbido del público.', 'No se sabe si es al árbitro, al rival o a la vida.', ['Alimentar la presión', { attack: 10, mentality: 8, chaos: 8 }, 'El ruido se volvió combustible.', 'balanced'], ['Aislar al equipo', { mentality: 10, control: 8, chaos: -6 }, 'Cerraste la puerta al murmullo.', 'safe'], ['Responder con pierna fuerte', { defense: 6, chaos: 14 }, 'El partido olió a tarjeta.', 'risk']],
  ['pierna-fuerte', 'El rival mete pierna fuerte.', 'Te quieren sacar del partido a patadas.', ['No arrugar', { mentality: 12, defense: 5, chaos: 10 }, 'Contestaste presencia con presencia.', 'risk'], ['Hacer correr la pelota', { control: 14, attack: 5, chaos: -5 }, 'La pelota viajó más rápido que la patada.', 'safe'], ['Buscar la falta', { attack: 7, chaos: 9, control: 4 }, 'Convertiste golpes en pelota parada.', 'balanced']],
  ['ultimo-tiro-libre', 'Último tiro libre del partido.', 'Una barrera, un arco y millones de cábalas invisibles.', ['Al ángulo', { attack: 16, chaos: 13, mentality: 5 }, 'Pediste una obra de arte en el peor momento.', 'risk'], ['Centro venenoso', { attack: 12, chaos: 10 }, 'La mandaste a la zona donde nadie duerme.', 'balanced'], ['Jugada preparada corta', { control: 13, attack: 8, chaos: -4 }, 'Intentaste ganar con pizarrón y sangre fría.', 'safe']],
];

const EVENTS = EVENT_TEMPLATES.map(([id, text, context, a, b, c]) => ({
  id, text, context,
  decisions: [a, b, c].map(([label, mods, note, risk]) => ({ label, mods, note, risk }))
}));

let state = {
  screen: 'menu', mode: 'quick', selectedTeam: null, cabalaChoices: [], currentMatch: null,
  lastResult: null, cup: null, soundEnabled: true, audio: null, progress: defaultProgress()
};

function defaultProgress() {
  return { played: 0, wins: 0, draws: 0, losses: 0, streak: 0, bestStreak: 0, totalPoints: 0, cups: 0, lastTeam: '—', epics: [] };
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === 'object') {
      state.progress = { ...defaultProgress(), ...saved, epics: Array.isArray(saved.epics) ? saved.epics : [] };
      state.soundEnabled = saved.soundEnabled !== false;
    }
  } catch (error) {
    console.warn('No se pudo cargar progreso, se reinicia.', error);
  }
}

function saveProgress() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state.progress, soundEnabled: state.soundEnabled })); }
  catch (error) { showToast('No se pudo guardar progreso.'); console.warn(error); }
}

function initAudio() {
  if (state.audio) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  try { state.audio = new AudioCtx(); } catch (error) { console.warn('Audio bloqueado.', error); }
}

function playSound(type = 'click') {
  if (!state.soundEnabled) return;
  initAudio();
  const ctx = state.audio;
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  const profiles = {
    click: [420, 0.04, 'square'], goal: [740, 0.25, 'sawtooth'], error: [120, 0.18, 'triangle'], final: [260, 0.35, 'sine'], var: [520, 0.22, 'square'], penal: [610, 0.18, 'triangle'], roja: [180, 0.24, 'sawtooth']
  };
  const [freq, duration, wave] = profiles[type] || profiles.click;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = wave; osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + duration);
}

function h(strings, ...values) { return strings.map((s, i) => `${s}${values[i] ?? ''}`).join(''); }
function clamp(n, min = 0, max = 100) { return Math.max(min, Math.min(max, Math.round(n))); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function signed(n) { return n > 0 ? `+${n}` : `${n}`; }
function esc(value) { return String(value).replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch])); }

function statRows(stats, compact = false) {
  const labels = { attack: 'Ataque', defense: 'Defensa', mentality: 'Mentalidad', fatigue: 'Cansancio', control: 'Control', chaos: 'Caos' };
  return Object.entries(labels).filter(([key]) => key in stats).map(([key, label]) => h`
    <div class="stat-row ${compact ? 'compact' : ''}"><span>${label}</span><div class="bar"><div class="fill" style="width:${clamp(stats[key])}%"></div></div><b>${clamp(stats[key])}</b></div>
  `).join('');
}

function modsText(mods) { return Object.entries(mods).map(([k, v]) => `${k} ${signed(v)}`).join(' · '); }
function badge(team) { return `<span class="badge" style="background:linear-gradient(135deg,${team.colors[0]} 0 48%,${team.colors[1]} 49% 100%)"></span>`; }

function setScreen(html, screenClass = '') {
  app.className = `app ${screenClass}`;
  app.innerHTML = html;
}

function renderMenu() {
  state.screen = 'menu';
  setScreen(h`
    <section class="screen hero card">
      <p class="kicker">Mundialito ficticio · sin marcas oficiales</p>
      <h1 class="logo">90<span class="plus">+</span></h1>
      <p class="subtitle">Decisiones rápidas. Goles agónicos. Caos mundialista.</p>
      <div class="menu-grid">
        <button class="btn primary" data-action="start" data-mode="quick">Partido rápido</button>
        <button class="btn green" data-action="start" data-mode="cup">Copa express</button>
        <button class="btn" data-action="streak">Mi racha</button>
        <button class="btn ghost" data-action="sound">Sonido: ${state.soundEnabled ? 'ON' : 'OFF'}</button>
        <button class="btn danger" data-action="reset">Reset progreso</button>
      </div>
      <p class="small">Sos DT en el minuto 90. Tocá rápido. Bancate las consecuencias.</p>
    </section>
  `);
}

function renderTeamSelect(mode = state.mode) {
  state.mode = mode;
  setScreen(h`
    <section class="screen card">
      <div class="topbar"><div><p class="kicker">${mode === 'cup' ? 'Copa express' : 'Partido rápido'}</p><h2 class="title">Elegí equipo</h2></div><button class="btn ghost" data-action="menu">Menú</button></div>
      <div class="teams-grid">
        ${TEAMS.map(team => h`<button class="team-card" data-action="team" data-team="${team.name}"><div class="team-name"><span>${team.name}</span>${badge(team)}</div>${statRows(team)}</button>`).join('')}
      </div>
    </section>
  `);
}

function renderCabala() {
  state.cabalaChoices = shuffle(CABALAS).slice(0, 3);
  setScreen(h`
    <section class="screen card">
      <div class="topbar"><div><p class="kicker">Antes de salir</p><h2 class="title">Elegí cábala</h2><p class="small">Tres opciones. Una sola superstición. Cero garantías.</p></div></div>
      <div class="cabala-grid">
        ${state.cabalaChoices.map((cabala, index) => h`<button class="cabala-card" data-action="cabala" data-index="${index}"><h3>${cabala.name}</h3><p>${cabala.note}</p><p class="small">${modsText(cabala.mods)}</p></button>`).join('')}
      </div>
    </section>
  `);
}

function createRival() {
  const base = pick(TEAMS.filter(team => team.name !== state.selectedTeam.name));
  const drift = () => Math.floor(Math.random() * 17) - 8;
  return { ...base, attack: clamp(base.attack + drift()), defense: clamp(base.defense + drift()), mentality: clamp(base.mentality + drift()), control: clamp(base.control + drift()), chaos: clamp(base.chaos + drift()), fatigue: 28 + Math.floor(Math.random() * 18), score: 0 };
}

function createMatch(cabala) {
  const starts = [[0, 0], [1, 0], [0, 1], [1, 1]];
  const [playerScore, rivalScore] = pick(starts);
  const player = { ...state.selectedTeam, fatigue: 24 + Math.floor(Math.random() * 12), score: playerScore };
  applyMods(player, cabala.mods);
  const eventCount = 6 + Math.floor(Math.random() * 4);
  const minute = 80 + Math.floor(Math.random() * 6);
  return {
    cabala, player, rival: createRival(), minute, startScore: [playerScore, rivalScore], eventCount,
    eventIndex: 0, events: shuffle(EVENTS).slice(0, eventCount), currentEvent: null, consequence: 'Respirá hondo. Arranca tu partido en el incendio.',
    keyDecision: '—', keyMoment: 'Todavía no explotó nada', flags: { lateGoal: false, comeback: false, cleanSheet: rivalScore === 0, red: false, penaltySave: false, varFavor: false, uglyWin: false }, animation: ''
  };
}

function startMatch(cabala) {
  state.currentMatch = createMatch(cabala);
  state.currentMatch.currentEvent = state.currentMatch.events[0];
  renderMatch();
}

function applyMods(target, mods) { Object.entries(mods).forEach(([key, value]) => { target[key] = clamp((target[key] ?? 0) + value, key === 'fatigue' ? 0 : 0, key === 'fatigue' ? 100 : 110); }); }
function scoreDiff(match = state.currentMatch) { return match.player.score - match.rival.score; }
function minuteLabel(minute) { return minute <= 90 ? `${minute}'` : `90+${minute - 90}'`; }

function renderMatch() {
  const m = state.currentMatch;
  const event = m.currentEvent;
  setScreen(h`
    <section class="screen match-shell ${m.animation}">
      <div class="scoreboard">
        <div class="team-label">${m.player.name}</div>
        <div><div class="score">${m.player.score}-${m.rival.score}</div><div class="minute">${minuteLabel(m.minute)}</div></div>
        <div class="team-label right">${m.rival.name}</div>
      </div>
      <div class="emotion">${pick(EMOTIONS)} · Jugada ${m.eventIndex + 1}/${m.eventCount}</div>
      <div class="compact-stats card">${statRows(m.player, true)}</div>
      <article class="event-card card">
        <h2 class="event-title">${event.text}</h2>
        <p class="context">${event.context}</p>
        <p class="consequence">${m.consequence}</p>
      </article>
      <div class="decision-grid">
        ${event.decisions.map((decision, index) => h`<button class="btn" data-action="decision" data-index="${index}">${decision.label}<br><span class="small">${modsText(decision.mods)}</span></button>`).join('')}
      </div>
    </section>
  `, 'match-screen');
  m.animation = '';
}

function resolveDecision(index) {
  const m = state.currentMatch;
  const decision = m.currentEvent.decisions[index];
  playSound('click');
  m.keyDecision = decision.label;
  applyMods(m.player, decision.mods);
  m.player.fatigue = clamp(m.player.fatigue + 3 + (decision.risk === 'risk' ? 4 : 1));
  m.rival.fatigue = clamp(m.rival.fatigue + 2 + Math.floor(m.player.chaos / 35));
  m.minute += 1 + Math.floor(Math.random() * 3) + (m.eventIndex > m.eventCount - 3 ? 1 : 0);
  const consequence = calculateConsequence(decision);
  applyConsequence(consequence, decision);
  m.eventIndex += 1;
  if (m.eventIndex >= m.eventCount || m.minute >= 98) return finishMatch();
  m.currentEvent = m.events[m.eventIndex];
  renderMatch();
}

function calculateConsequence(decision) {
  const m = state.currentMatch;
  const diff = scoreDiff(m);
  const urgency = m.minute >= 90 ? 10 : 0;
  const chasing = diff < 0 ? 12 : diff === 0 ? 5 : -6;
  const risk = decision.risk === 'risk' ? 12 : decision.risk === 'safe' ? -8 : 3;
  const attackEdge = m.player.attack - m.rival.defense;
  const defenseEdge = m.player.defense - m.rival.attack;
  const chaos = (m.player.chaos + m.rival.chaos) / 2;
  const fatiguePain = m.player.fatigue - m.rival.fatigue;
  const ourThreat = 34 + attackEdge * 0.42 + m.player.mentality * 0.12 + m.player.control * 0.08 - m.player.fatigue * 0.18 + urgency + chasing + risk;
  const rivalThreat = 20 - defenseEdge * 0.45 + m.rival.attack * 0.11 + fatiguePain * 0.22 + chaos * 0.14 + (risk > 8 ? 10 : 0) + (diff > 0 ? 8 : 0);
  const extreme = chaos * 0.32 + urgency + Math.abs(diff) * 3 + (decision.risk === 'risk' ? 16 : 0);
  const roll = Math.random() * 100;

  if (roll < Math.max(5, ourThreat * 0.13)) return 'goal';
  if (roll < Math.max(9, ourThreat * 0.20)) return 'shot';
  if (roll < Math.max(14, ourThreat * 0.28)) return 'danger';
  if (roll > 100 - Math.max(4, rivalThreat * 0.11)) return 'rivalGoal';
  if (roll > 100 - Math.max(8, rivalThreat * 0.18)) return 'counter';
  const extremeRoll = Math.random() * 100;
  if (extremeRoll < extreme * 0.12) return 'penalty';
  if (extremeRoll < extreme * 0.22) return 'var';
  if (extremeRoll < extreme * 0.30) return 'red';
  if (extremeRoll < extreme * 0.38) return 'injury';
  if (extremeRoll < extreme * 0.48) return 'save';
  if (m.player.control > 75 && Math.random() < 0.35) return 'control';
  return pick(['nothing', 'corner', 'error', 'control']);
}

function applyConsequence(type, decision) {
  const m = state.currentMatch;
  const messages = [];
  let sound = 'click';
  let animation = '';
  if (decision.note) messages.push(decision.note);
  if (m.player.chaos > 78) messages.push('Subió el caos: puede pasar cualquier cosa.');
  if (m.player.mentality > 88) messages.push('La mentalidad alta sostuvo al equipo en el peor momento.');
  const late = m.minute >= 90;
  switch (type) {
    case 'goal':
      m.player.score += 1; sound = 'goal'; animation = 'flash-goal';
      m.keyMoment = late ? `Gol agónico al ${minuteLabel(m.minute)}` : 'Gol que cambió el partido';
      if (late) m.flags.lateGoal = true;
      if (m.startScore[0] < m.startScore[1] && m.player.score > m.rival.score) m.flags.comeback = true;
      messages.push(`¡GOL! Entró con sufrimiento al ${minuteLabel(m.minute)}.`); break;
    case 'rivalGoal':
      m.rival.score += 1; sound = 'error'; animation = 'flash-error'; m.keyMoment = 'Gol rival en una puñalada';
      messages.push('Gol rival. La espalda quedó pagando y el silencio fue tremendo.'); break;
    case 'penalty':
      sound = 'penal'; animation = 'flash-var';
      if (Math.random() + m.player.mentality / 220 > 0.58) { m.player.score += 1; m.keyMoment = 'Penal convertido bajo fuego'; messages.push('Penal para vos. Lo patearon con el barrio encima y fue gol.'); }
      else { m.flags.penaltySave = true; m.keyMoment = 'Penal atajado'; messages.push('¡Penal atajado! El arquero se agrandó como monumento.'); }
      break;
    case 'var':
      sound = 'var'; animation = 'flash-var';
      if (Math.random() + m.player.control / 250 > 0.55) { m.flags.varFavor = true; m.keyMoment = 'VAR salvador'; messages.push('VAR salvador: anularon una del rival y respiraste de nuevo.'); }
      else { m.keyMoment = 'Gol anulado por VAR'; messages.push('VAR cruel: te apagaron el grito y quedó todo hirviendo.'); }
      break;
    case 'red':
      sound = 'roja'; animation = 'flash-error'; m.flags.red = true; applyMods(m.player, { defense: -8, control: -8, chaos: 12, mentality: -5 });
      m.keyMoment = 'Roja en pleno incendio'; messages.push('Roja. Ahora el partido se juega con un pulmón menos.'); break;
    case 'injury':
      animation = 'flash-error'; applyMods(m.player, { fatigue: 12, attack: -4, defense: -4 });
      m.keyMoment = 'Lesión inoportuna'; messages.push('Lesión. El cansancio se metió en la táctica.'); break;
    case 'save':
      sound = 'penal'; animation = 'flash-var'; m.keyMoment = 'Atajadón heroico'; messages.push('Atajadón. Una mano imposible sostuvo la fe.'); break;
    case 'shot': m.keyMoment = 'Tiro al arco con veneno'; messages.push('Tiro al arco. El arquero dio rebote y nadie pudo empujarla.'); break;
    case 'danger': messages.push('Llegada peligrosa. Faltó una uña para que explote todo.'); break;
    case 'counter': applyMods(m.player, { defense: -4, fatigue: 4 }); messages.push('Contra letal del rival. Zafaste, pero dejaste marcas de uñas en el asiento.'); break;
    case 'corner': messages.push('Córner ganado. El área vuelve a llenarse de fantasmas.'); break;
    case 'error': animation = 'flash-error'; applyMods(m.player, { control: -5, chaos: 6 }); messages.push('Error defensivo. No fue gol porque el fútbol también perdona.'); break;
    case 'control': applyMods(m.player, { control: 4, chaos: -3 }); messages.push('Dominio sin profundidad. Mandás vos, pero el arco sigue lejos.'); break;
    default: messages.push('Nada grave. Se consumen segundos que pesan una tonelada.');
  }
  m.consequence = messages.join(' ');
  m.animation = animation;
  playSound(sound);
}

function finishMatch() {
  const m = state.currentMatch;
  m.flags.cleanSheet = m.rival.score === 0;
  const outcome = m.player.score > m.rival.score ? 'win' : m.player.score === m.rival.score ? 'draw' : 'loss';
  m.keyMoment = outcome === 'draw' && m.keyMoment === 'Todavía no explotó nada' ? 'Final dramático sin dueño' : m.keyMoment;
  const points = calculatePoints(outcome, m);
  const epics = unlockEpics(outcome, m);
  updateProgress(outcome, points, epics);
  state.lastResult = { outcome, points, epics, summary: createSummary(outcome, points), cupNote: handleCupAfterMatch(outcome, points) };
  playSound('final');
  renderResult();
}

function calculatePoints(outcome, m) {
  let points = SCORE_RULES[outcome === 'win' ? 'win' : outcome === 'draw' ? 'draw' : 'loss'];
  if (m.flags.lateGoal) points += SCORE_RULES.lateGoal;
  if (m.flags.comeback) points += SCORE_RULES.comeback;
  if (m.flags.cleanSheet) points += SCORE_RULES.cleanSheet;
  if (m.flags.red && outcome === 'win') points += SCORE_RULES.redWin;
  if (m.flags.penaltySave) points += SCORE_RULES.penaltySave;
  if (m.flags.varFavor) points += SCORE_RULES.varFavor;
  return points;
}

function unlockEpics(outcome, m) {
  const epics = [];
  if (m.flags.lateGoal && m.minute >= 95) epics.push('Gol al 90+5');
  if (m.flags.comeback) epics.push('Remontada imposible');
  if (m.flags.penaltySave) epics.push('Penal atajado');
  if (m.flags.red && outcome === 'win') epics.push('Con uno menos');
  if (m.flags.varFavor) epics.push('VAR salvador');
  if (outcome === 'win' && m.player.control < 45 && m.player.chaos > 82) epics.push('Partido horrendo ganado igual');
  if (outcome === 'win' && m.player.mentality + m.player.chaos > 175) epics.push('Mística total');
  return epics;
}

function updateProgress(outcome, points, epics) {
  const p = state.progress;
  p.played += 1; p.totalPoints += points; p.lastTeam = state.selectedTeam.name;
  if (outcome === 'win') { p.wins += 1; p.streak += 1; p.bestStreak = Math.max(p.bestStreak, p.streak); }
  else if (outcome === 'draw') { p.draws += 1; p.streak = 0; }
  else { p.losses += 1; p.streak = 0; }
  epics.forEach(epic => { if (!p.epics.includes(epic)) p.epics.push(epic); });
  saveProgress();
}

function handleCupAfterMatch(outcome, basePoints) {
  if (state.mode !== 'cup' || !state.cup) return '';
  const cup = state.cup;
  const round = CUP_ROUNDS[cup.roundIndex];
  cup.results.push({ round, outcome });
  if (round.startsWith('Grupo')) {
    cup.groupPoints += outcome === 'win' ? 3 : outcome === 'draw' ? 1 : 0;
    cup.roundIndex += 1;
    if (cup.roundIndex === 2 && cup.groupPoints === 0) return 'La copa terminó en grupos. Ni la cábala quiso mirar.';
    return 'Seguís en carrera en la Copa express.';
  }
  if (round === 'Semifinal') {
    if (outcome === 'loss') { cup.finished = true; return 'La semifinal te dejó afuera. Duele, pero no mancha.'; }
    cup.roundIndex += 1; return 'Ganaste la semi. Queda la Final.';
  }
  if (round === 'Final') {
    cup.finished = true;
    if (outcome === 'win') {
      state.progress.cups += 1; state.progress.totalPoints += SCORE_RULES.cupWin;
      if (!state.progress.epics.includes('Copa levantada')) state.progress.epics.push('Copa levantada');
      saveProgress(); return 'Levantaste la copa en el 90+. +700 puntos.';
    }
    if (outcome === 'loss') { state.progress.totalPoints += SCORE_RULES.finalLoss; saveProgress(); return 'Te quedaste en la puerta. +200 puntos por finalista.'; }
    return 'Empate con mística: la copa se define para vos por temple interno.';
  }
  return `Puntos del partido: ${basePoints}`;
}

function createSummary(outcome) {
  const m = state.currentMatch;
  const verb = outcome === 'win' ? 'Ganaste' : outcome === 'draw' ? 'Empataste' : 'Perdiste';
  const mystic = clamp((m.player.mentality * 0.45) + (m.player.chaos * 0.35) + (m.player.control * 0.2));
  return `90+\n${verb} ${m.player.score}-${m.rival.score} al ${minuteLabel(m.minute)}.\nDecisión clave: ${m.keyDecision}.\nMomento clave: ${m.keyMoment}.\nNivel de mística: ${mystic}%.`;
}

function renderResult() {
  const m = state.currentMatch;
  const r = state.lastResult;
  const label = r.outcome === 'win' ? 'Ganaste' : r.outcome === 'draw' ? 'Empataste' : 'Perdiste';
  setScreen(h`
    <section class="screen card">
      <div class="topbar"><div><p class="kicker">Final del partido</p><h2 class="title">${label} ${m.player.score}-${m.rival.score}</h2><p class="small">${r.cupNote}</p></div></div>
      <div class="result-grid">
        <div class="stat-card"><b>Momento clave</b><p>${m.keyMoment}</p></div>
        <div class="stat-card"><b>Decisión clave</b><p>${m.keyDecision}</p></div>
        <div class="stat-card"><b>Puntos</b><p>+${r.points}</p></div>
      </div>
      <p class="small">Racha actual: <b>${state.progress.streak}</b> · Mejor racha: <b>${state.progress.bestStreak}</b></p>
      <div class="plate" id="sharePlate">${esc(r.summary)}</div>
      <div class="pill-row">${r.epics.map(epic => `<span class="pill">${epic}</span>`).join('') || '<span class="pill">Sin épica desbloqueada, pero con sufrimiento.</span>'}</div>
      <div class="action-grid">
        <button class="btn green" data-action="copy">Copiar resumen</button>
        ${cupNextButton()}
        <button class="btn ghost" data-action="menu">Volver al menú</button>
      </div>
    </section>
  `);
}

function cupNextButton() {
  if (state.mode !== 'cup' || !state.cup || state.cup.finished || state.cup.roundIndex >= CUP_ROUNDS.length) return '<button class="btn primary" data-action="play-again">Jugar otra vez</button>';
  return `<button class="btn primary" data-action="next-cup">Siguiente: ${CUP_ROUNDS[state.cup.roundIndex]}</button>`;
}

function renderStreak() {
  const p = state.progress;
  setScreen(h`
    <section class="screen card">
      <div class="topbar"><div><p class="kicker">LocalStorage FC</p><h2 class="title">Mi racha</h2></div><button class="btn ghost" data-action="menu">Menú</button></div>
      <div class="stats-grid">
        ${[
          ['Partidos jugados', p.played], ['Victorias', p.wins], ['Empates', p.draws], ['Derrotas', p.losses], ['Racha actual', p.streak], ['Mejor racha', p.bestStreak], ['Puntos totales', p.totalPoints], ['Copas ganadas', p.cups], ['Último equipo', p.lastTeam]
        ].map(([k, v]) => `<div class="stat-card"><b>${k}</b><p>${v}</p></div>`).join('')}
      </div>
      <h3>Momentos épicos desbloqueados</h3>
      <div class="pill-row">${EPICS.map(epic => `<span class="pill">${p.epics.includes(epic) ? '🏆 ' : '🔒 '}${epic}</span>`).join('')}</div>
    </section>
  `);
}

function startFlow(mode) {
  state.mode = mode;
  state.cup = mode === 'cup' ? { roundIndex: 0, groupPoints: 0, results: [], finished: false } : null;
  renderTeamSelect(mode);
}

function startNextCupMatch() {
  if (state.cup?.finished) return renderMenu();
  state.cabalaChoices = shuffle(CABALAS).slice(0, 3);
  renderCabala();
}

async function copySummary() {
  const text = state.lastResult?.summary || '';
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
    else {
      const area = document.createElement('textarea'); area.value = text; document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove();
    }
    showToast('Resumen copiado. Pegalo y gritá.' );
  } catch (error) { showToast('No se pudo copiar.'); console.warn(error); }
}

function resetProgress() {
  state.progress = defaultProgress();
  saveProgress();
  showToast('Progreso reseteado. Borrón y pelota nueva.');
  renderMenu();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

app.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  initAudio();
  const action = button.dataset.action;
  if (!['decision', 'copy'].includes(action)) playSound('click');
  if (action === 'start') startFlow(button.dataset.mode);
  if (action === 'menu') renderMenu();
  if (action === 'streak') renderStreak();
  if (action === 'sound') { state.soundEnabled = !state.soundEnabled; saveProgress(); renderMenu(); }
  if (action === 'reset') resetProgress();
  if (action === 'team') { state.selectedTeam = TEAMS.find(team => team.name === button.dataset.team); renderCabala(); }
  if (action === 'cabala') startMatch(state.cabalaChoices[Number(button.dataset.index)]);
  if (action === 'decision') resolveDecision(Number(button.dataset.index));
  if (action === 'copy') copySummary();
  if (action === 'play-again') startFlow(state.mode === 'cup' ? 'cup' : 'quick');
  if (action === 'next-cup') startNextCupMatch();
});

loadProgress();
renderMenu();
