import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Check, ChevronRight, Dice5, Download, RotateCcw, Share2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import stadiumImage from "@/assets/estadio-leyendas.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "El Dado de las Leyendas | Armá tu once" },
      { name: "description", content: "Tirá el dado, elegí leyendas de 32 clubes históricos y armá tu once ideal del fútbol argentino." },
      { property: "og:title", content: "El Dado de las Leyendas" },
      { property: "og:description", content: "¿Qué once te toca? Tirá el dado y elegí tus once leyendas." },
    ],
  }),
  component: Index,
});

type Team = { name: string; short: string; colors: string; players: string[] };
type Pick = { player: string; team: string; short: string; position: string };

const teams: Team[] = [
  { name: "River Plate", short: "CARP", colors: "from-accent to-card", players: ["Ángel Labruna", "Enzo Francescoli", "Norberto Alonso", "Amadeo Carrizo", "Ariel Ortega", "Marcelo Gallardo"] },
  { name: "Boca Juniors", short: "CABJ", colors: "from-secondary to-card", players: ["Juan R. Riquelme", "Martín Palermo", "Roberto Cherro", "Antonio Rattín", "Hugo Gatti", "Sebastián Battaglia"] },
  { name: "Independiente", short: "CAI", colors: "from-destructive to-card", players: ["Ricardo Bochini", "Arsenio Erico", "José Pastoriza", "Miguel Santoro", "Daniel Bertoni", "Jorge Burruchaga"] },
  { name: "Racing Club", short: "RAC", colors: "from-secondary to-card", players: ["Diego Milito", "Juan José Pizzuti", "Ubaldo Fillol", "Rubén Paz", "Roberto Perfumo", "Lisandro López"] },
  { name: "San Lorenzo", short: "CASLA", colors: "from-secondary to-destructive", players: ["José Sanfilippo", "Héctor Scotta", "Leandro Romagnoli", "René Pontoni", "Victorio Cocco", "Sergio Villar"] },
  { name: "Huracán", short: "CAH", colors: "from-muted to-card", players: ["René Houseman", "Carlos Babington", "Miguel Brindisi", "Herminio Masantonio", "Ringo Bonavena", "Alfio Basile"] },
  { name: "Vélez Sarsfield", short: "CAVS", colors: "from-muted to-secondary", players: ["Carlos Bianchi", "José L. Chilavert", "Omar Asad", "Victorio Spinetto", "Christian Bassedas", "Fabián Cubero"] },
  { name: "Argentinos Juniors", short: "AAAJ", colors: "from-destructive to-card", players: ["Diego Maradona", "Claudio Borghi", "Sergio Batista", "José Pékerman", "Fernando Redondo", "Juan Pablo Sorín"] },
  { name: "Estudiantes LP", short: "EDELP", colors: "from-destructive to-muted", players: ["Juan S. Verón", "Carlos Bilardo", "Juan R. Verón", "Mariano Andújar", "Alejandro Sabella", "José L. Brown"] },
  { name: "Gimnasia LP", short: "GELP", colors: "from-secondary to-muted", players: ["Guillermo Barros Schelotto", "Timoteo Griguol", "José Minella", "Carlos Carrió", "Pedro Troglio", "Jorge San Esteban"] },
  { name: "Newell's Old Boys", short: "NOB", colors: "from-destructive to-card", players: ["Marcelo Bielsa", "Gerardo Martino", "Maxi Rodríguez", "Gabriel Batistuta", "Jorge Valdano", "Américo Gallego"] },
  { name: "Rosario Central", short: "CARC", colors: "from-secondary to-primary", players: ["Mario Kempes", "Aldo Poy", "Ángel Di María", "Edgardo Bauza", "Omar Palma", "Kily González"] },
  { name: "Talleres", short: "CAT", colors: "from-secondary to-muted", players: ["Daniel Willington", "Luis Galván", "José Valencia", "Miguel Oviedo", "Javier Pastore", "Ángel Labruna"] },
  { name: "Belgrano", short: "CAB", colors: "from-secondary to-card", players: ["Juan C. Olave", "Luis Artime", "Tomás Cuellar", "César Pereyra", "Pablo Chavarría", "Guillermo Farré"] },
  { name: "Instituto", short: "IACC", colors: "from-destructive to-muted", players: ["Mario Kempes", "Osvaldo Ardiles", "Paulo Dybala", "Hugo Curioni", "Diego Klimowicz", "Ramón Ábila"] },
  { name: "Atlético Tucumán", short: "CATU", colors: "from-secondary to-muted", players: ["Luis Rodríguez", "Ricardo Villa", "Miguel Brandán", "Cristian Lucchetti", "José Fierro", "Fernando Zampedri"] },
  { name: "San Martín Tucumán", short: "SMT", colors: "from-destructive to-muted", players: ["Jacinto Eusebio Roldán", "Miguel Sánchez", "Lito Espeche", "Santo Guarnaccia", "Carlos Morales", "Federico Lussenhoff"] },
  { name: "Colón", short: "CAC", colors: "from-destructive to-card", players: ["Esteban Fuertes", "José Vignatti", "Adrián Marini", "Hugo Ibarra", "Pulga Rodríguez", "Facundo Garcés"] },
  { name: "Unión", short: "CAU", colors: "from-destructive to-muted", players: ["Leopoldo Luque", "Nery Pumpido", "Víctor Bottaniz", "Fernando Alí", "Cristian González", "Lautaro Acosta"] },
  { name: "Banfield", short: "CABF", colors: "from-accent to-muted", players: ["Javier Sanguinetti", "Julio C. Falcioni", "James Rodríguez", "Darío Cvitanich", "Eliseo Mouriño", "José Sand"] },
  { name: "Lanús", short: "CAL", colors: "from-destructive to-card", players: ["José Sand", "Héctor Cúper", "Lautaro Acosta", "Diego Valeri", "Ramón Cabrero", "Luis Zubeldía"] },
  { name: "Ferro Carril Oeste", short: "FCO", colors: "from-accent to-card", players: ["Carlos Griguol", "Héctor Cúper", "Oscar Garré", "Alberto Márcico", "Gerónimo Saccardi", "Juampi Carrizo"] },
  { name: "Chacarita Juniors", short: "CACh", colors: "from-destructive to-card", players: ["Ángel Marcos", "Carlos María García Cambón", "Horacio Neumann", "Victorio Spinetto", "Isaac López", "Jorge Ribolzi"] },
  { name: "Atlanta", short: "CAAt", colors: "from-primary to-secondary", players: ["Osvaldo Zubeldía", "Luis Artime", "Hugo Gatti", "Carlos Timoteo Griguol", "Néstor Errea", "Juan Gómez Voglino"] },
  { name: "Quilmes", short: "QAC", colors: "from-muted to-secondary", players: ["José Yudica", "Omar Gómez", "Miguel López", "Walter Benítez", "Rodrigo Braña", "Sergio Martínez"] },
  { name: "Arsenal", short: "ARS", colors: "from-secondary to-destructive", players: ["Jorge Burruchaga", "Gustavo Alfaro", "Carlos Ruiz", "Alejandro Limia", "Martín Andrizzi", "Luciano Leguizamón"] },
  { name: "Defensa y Justicia", short: "DYJ", colors: "from-primary to-accent", players: ["Hernán Crespo", "Sebastián Beccacece", "Nicolás Fernández", "Ezequiel Unsain", "Adonis Frías", "Enzo Fernández"] },
  { name: "Godoy Cruz", short: "GCT", colors: "from-secondary to-muted", players: ["Santiago García", "Daniel Oldrá", "Rodrigo Rey", "David Ramírez", "Nicolás Sánchez", "Martín Ojeda"] },
  { name: "Patronato", short: "CAP", colors: "from-destructive to-card", players: ["Sebastián Bértoli", "Walter Andrade", "Marcelo Fuentes", "Matías Quiroga", "Gabriel Graciani", "Carlos Quintana"] },
  { name: "Tigre", short: "CATI", colors: "from-secondary to-destructive", players: ["Bernabé Ferreyra", "Diego Castaño", "Martín Galmarini", "Lucas Menossi", "Carlos Luna", "Mateo Retegui"] },
  { name: "Platense", short: "CAPL", colors: "from-card to-muted", players: ["Vicente Sayago", "Carlos Bianchi", "Julio Cozzi", "Daniel Vega", "Marcelo Espina", "David Trezeguet"] },
  { name: "All Boys", short: "CAAB", colors: "from-muted to-card", players: ["José Santos Romero", "Pepe Romero", "Carlos Tevez", "Nicolás Cambiasso", "Jonathan Calleri", "Agustín Torassa"] },
];

const positions = ["Arquero", "Lateral derecho", "Central derecho", "Central izquierdo", "Lateral izquierdo", "Volante central", "Interior derecho", "Interior izquierdo", "Extremo derecho", "Delantero", "Extremo izquierdo"];
const fieldSpots = ["top-[86%] left-1/2", "top-[67%] left-[79%]", "top-[72%] left-[60%]", "top-[72%] left-[40%]", "top-[67%] left-[21%]", "top-[51%] left-1/2", "top-[43%] left-[73%]", "top-[43%] left-[27%]", "top-[23%] left-[78%]", "top-[13%] left-1/2", "top-[23%] left-[22%]"];

function Index() {
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [rolling, setRolling] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const completed = picks.length === positions.length;

  const roll = () => {
    if (rolling || completed) return;
    setRolling(true);
    window.setTimeout(() => {
      setCurrentTeam(teams[Math.floor(Math.random() * teams.length)]);
      setRolling(false);
    }, 700);
  };

  const choose = (player: string) => {
    if (!currentTeam || picks.some((pick) => pick.player === player)) return;
    setPicks((value) => [...value, { player, team: currentTeam.name, short: currentTeam.short, position: positions[value.length] }]);
    setCurrentTeam(null);
  };

  const reset = () => { setPicks([]); setCurrentTeam(null); };

  const download = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200; canvas.height = 1200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#123d2a"; ctx.fillRect(0, 0, 1200, 1200);
    ctx.strokeStyle = "#d8d2ad"; ctx.lineWidth = 6; ctx.strokeRect(80, 170, 1040, 940);
    ctx.beginPath(); ctx.moveTo(80, 640); ctx.lineTo(1120, 640); ctx.stroke();
    ctx.beginPath(); ctx.arc(600, 640, 120, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#e9b84b"; ctx.textAlign = "center"; ctx.font = "74px sans-serif"; ctx.fillText("EL DADO DE LAS LEYENDAS", 600, 105);
    const coords = [[600,1040],[900,850],[700,900],[500,900],[300,850],[600,690],[850,570],[350,570],[900,350],[600,270],[300,350]];
    picks.forEach((pick, index) => { const [x,y] = coords[index]; ctx.fillStyle = "#efe9d2"; ctx.beginPath(); ctx.arc(x,y,46,0,Math.PI*2); ctx.fill(); ctx.fillStyle="#102d22"; ctx.font="bold 24px sans-serif"; ctx.fillText(pick.short,x,y+8); ctx.fillStyle="#efe9d2"; ctx.font="bold 22px sans-serif"; ctx.fillText(pick.player,x,y+82); });
    const link = document.createElement("a"); link.download = "mi-once-de-leyendas.png"; link.href = canvas.toDataURL("image/png"); link.click();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <img src={stadiumImage} alt="Estadio argentino iluminado al atardecer" width={1536} height={1024} className="fixed inset-0 h-full w-full object-cover opacity-25" />
      <div className="fixed inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-8">
        <header className="flex items-center justify-between border-b border-border pb-5">
          <div className="flex items-center gap-3"><Shield className="size-8 text-primary" /><div><p className="display-type text-2xl tracking-wide">El Dado de las Leyendas</p><p className="text-[10px] font-bold uppercase tracking-[.3em] text-muted-foreground">Fútbol argentino</p></div></div>
          <Button variant="stadium" size="sm" onClick={reset}><RotateCcw /> Reiniciar</Button>
        </header>

        {!completed ? (
          <section className="grid min-h-[calc(100vh-110px)] items-center gap-10 py-10 lg:grid-cols-[.8fr_1.2fr]">
            <div className="animate-rise">
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[.28em] text-secondary">Elección {picks.length + 1} de 11</p>
              <h1 className="display-type max-w-xl text-6xl leading-[.9] tracking-wide sm:text-8xl">Tu equipo.<br/><span className="text-primary">Tu historia.</span></h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">El azar elige el club. Vos elegís la leyenda que ocupará el puesto de <strong className="text-foreground">{positions[picks.length]}</strong>.</p>
              <div className="mt-8 flex flex-wrap gap-2">{positions.map((position, index) => <span key={position} className={`grid size-8 place-items-center rounded-full border text-xs font-bold ${index < picks.length ? "border-primary bg-primary text-primary-foreground" : index === picks.length ? "border-secondary text-secondary" : "border-border text-muted-foreground"}`}>{index < picks.length ? <Check className="size-3"/> : index + 1}</span>)}</div>
            </div>

            <div className="flex min-h-[540px] items-center justify-center">
              {!currentTeam ? (
                <div className="text-center">
                  <button aria-label="Lanzar el dado" onClick={roll} disabled={rolling} className="group mx-auto grid size-52 cursor-pointer place-items-center rounded-[2.5rem] border border-primary/30 bg-card/70 shadow-[var(--shadow-gold)] backdrop-blur-xl transition-transform hover:-translate-y-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50 disabled:pointer-events-none sm:size-64">
                    <Dice5 className={`size-28 text-primary sm:size-36 ${rolling ? "animate-dice" : "transition-transform group-hover:rotate-12"}`} strokeWidth={1.4}/>
                  </button>
                  <Button variant="legend" size="xl" onClick={roll} disabled={rolling} className="mt-8">{rolling ? "El destino decide…" : "Lanzar el dado"}<ChevronRight /></Button>
                  <p className="mt-4 text-xs uppercase tracking-[.2em] text-muted-foreground">32 clubes · cientos de leyendas</p>
                </div>
              ) : (
                <div className="animate-rise w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card/85 shadow-2xl backdrop-blur-xl">
                  <div className={`bg-gradient-to-br ${currentTeam.colors} p-8 sm:p-10`}><p className="text-xs font-bold uppercase tracking-[.25em] text-foreground/70">El dado eligió</p><div className="mt-3 flex items-end justify-between gap-4"><h2 className="display-type text-5xl tracking-wide sm:text-7xl">{currentTeam.name}</h2><span className="rounded-full border border-foreground/20 px-4 py-2 text-xs font-extrabold">{currentTeam.short}</span></div></div>
                  <div className="p-6 sm:p-8"><p className="mb-5 text-sm font-bold">Elegí una leyenda para <span className="text-primary">{positions[picks.length]}</span></p><div className="grid gap-3 sm:grid-cols-2">{currentTeam.players.map((player) => { const used = picks.some((pick) => pick.player === player); return <Button key={player} variant="stadium" size="lg" disabled={used} onClick={() => choose(player)} className="h-auto justify-between py-4 text-left"><span>{player}{used && <small className="ml-2 text-muted-foreground">Ya elegido</small>}</span><ChevronRight /></Button>; })}</div><Button variant="ghost" onClick={roll} className="mt-5 w-full text-muted-foreground"><Dice5/> Tirar otro club</Button></div>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="animate-rise py-10 text-center">
            <p className="text-xs font-extrabold uppercase tracking-[.28em] text-primary">La formación está completa</p><h1 className="display-type mt-2 text-6xl tracking-wide sm:text-8xl">Once para la eternidad</h1>
            <div ref={resultRef} className="relative mx-auto mt-8 aspect-[4/5] max-w-2xl overflow-hidden rounded-[2rem] border-2 border-pitch-line bg-pitch shadow-2xl">
              <div className="absolute inset-6 border-2 border-pitch-line"><div className="absolute left-0 right-0 top-1/2 border-t-2 border-pitch-line"/><div className="absolute left-1/2 top-1/2 aspect-square w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-pitch-line"/><div className="absolute left-1/2 top-0 h-24 w-52 -translate-x-1/2 border-x-2 border-b-2 border-pitch-line"/><div className="absolute bottom-0 left-1/2 h-24 w-52 -translate-x-1/2 border-x-2 border-t-2 border-pitch-line"/></div>
              {picks.map((pick, index) => <div key={pick.player} className={`absolute ${fieldSpots[index]} z-10 w-28 -translate-x-1/2 -translate-y-1/2 text-center sm:w-36`}><div className="mx-auto grid size-12 place-items-center rounded-full border-2 border-primary bg-foreground text-xs font-black text-background shadow-lg sm:size-14">{pick.short}</div><p className="mt-1 rounded bg-background/75 px-1 py-1 text-[10px] font-extrabold leading-tight backdrop-blur sm:text-xs">{pick.player}</p></div>)}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3"><Button variant="legend" size="lg" onClick={download}><Download/> Descargar imagen</Button><Button variant="stadium" size="lg" onClick={() => navigator.share?.({ title: "Mi once de leyendas", text: "Armé mi once ideal en El Dado de las Leyendas", url: window.location.href })}><Share2/> Compartir</Button><Button variant="ghost" size="lg" onClick={reset}><RotateCcw/> Jugar de nuevo</Button></div>
          </section>
        )}
      </div>
    </main>
  );
}
