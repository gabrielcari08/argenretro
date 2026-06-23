import type { Pick } from "@/types";

function pickName(picks: Pick[], slot: number, fallback: string): string {
  return picks.find((p) => p.slot === slot)?.name ?? fallback;
}

export const phaseOpeners = [
  "Se reanuda el juego tras la pausa.",
  "Vuelve el partido con todo por definir.",
  "El ritmo no se detiene en la cancha.",
];

export function matchStart(): string {
  return "¡Rueda la pelota! Comienza el partido.";
}

export function halfTime(): string {
  const variants = [
    "Final del primer tiempo.",
    "Se termina la primera mitad.",
    "Descanso. Todo por definir en el complemento.",
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

export function fullTime(): string {
  const variants = [
    "¡Final del partido!",
    "Se acaba el partido.",
    "No hay más tiempo. Termina el encuentro.",
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

export function userDominant(picks: Pick[]): string {
  const name = pickName(picks, 6, "El mediocampo");
  const variants = [
    `${name} maneja los tiempos del XI con categoría.`,
    "ARG XI impone su juego y domina la posesión.",
    `El equipo encuentra espacios por el sector de ${name}.`,
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

export function rivalDominant(rivalClub: string): string {
  const variants = [
    `${rivalClub} controla el ritmo del partido.`,
    `Cuesta salir jugando ante la presión de ${rivalClub}.`,
    `El rival maneja la pelota con paciencia.`,
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

export function tenseMoment(picks: Pick[]): string {
  const name = pickName(picks, 0, "El arquero");
  const variants = [
    "El partido se juega a alta intensidad.",
    "Mínimos detalles definen el partido.",
    `${name} se exige al máximo para mantener el arco en cero.`,
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

export function userAttacking(picks: Pick[]): string {
  const name = pickName(picks, 9, "El delantero");
  const variants = [
    `${name} avisa con un remate peligroso.`,
    "Gran jugada colectiva del XI que termina en las manos del arquero.",
    "Centro al área que no encuentra destino de gol.",
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

export function rivalAttacking(rivalClub: string, picks: Pick[]): string {
  const gk = pickName(picks, 0, "El arquero");
  const variants = [
    `${rivalClub} avisa con un remate desde afuera.`,
    `Córner peligroso para ${rivalClub}.`,
    `${gk} responde con una gran atajada.`,
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

export function userWinning(picks: Pick[]): string {
  const name = pickName(picks, 2, "La defensa");
  const variants = [
    "ARG XI defiende ordenadamente la ventaja.",
    "El equipo se repliega para cuidar el resultado.",
    `${name} y la defensa cierran espacios.`,
    "Contragolpe peligroso del XI buscando el tercero.",
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

export function userLosing(picks: Pick[]): string {
  const name = pickName(picks, 9, "El delantero");
  const variants = [
    "ARG XI busca el empate con insistencia.",
    `El equipo se vuelca al ataque con ${name} como referencia.`,
    "Quedan minutos para buscar la igualdad.",
    "Centros al área buscando a los delanteros del XI.",
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

export function tieLate(): string {
  const variants = [
    "Partido abierto, cualquiera puede ganarlo.",
    "Los dos equipos buscan el gol de la victoria.",
    "Emoción hasta el final. Nadie quiere los penales.",
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

export function extraTimeStart(): string {
  const variants = [
    "¡Tiempo extra! Se juegan 30 minutos más.",
    "Nadie quiere ir a penales. Todo se define en el alargue.",
    "Queda media hora para definir al ganador.",
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

export function extraTimeEnd(): string {
  const variants = [
    "Final del tiempo extra. Todo se define en penales.",
    "Se acaba el alargue. Llegamos a los penales.",
    "No hay gol en el tiempo extra. Vienen los penales.",
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

export function penaltyStart(): string {
  const variants = [
    "¡Comienza la tanda de penales!",
    "Penales. Cinco disparos para cada uno.",
    "Llegó el momento más tenso: los penales.",
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

export function penaltyWon(): string {
  const variants = [
    "¡ARGENRETRO gana por penales!",
    "¡Los penales son del XI! Victoria desde los doce pasos.",
    "¡Campeones por penales!",
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

export function penaltyLost(rivalClub: string): string {
  const variants = [
    `Se terminó. ${rivalClub} gana por penales.`,
    "Los penales no son lo nuestro. Eliminados.",
    "Duele, pero caemos por penales.",
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

export function etDominant(picks: Pick[]): string {
  const name = picks.find((p) => p.slot === 6)?.name ?? "El mediocampo";
  const variants = [
    `${name} no se rinde y empuja en el alargue.`,
    "ARG XI busca el gol de la victoria en tiempo extra.",
    "Las piernas pesan, pero el corazón manda.",
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}
