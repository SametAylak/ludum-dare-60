// Hidden trios and the analog guests they invite onto the stage.

export const COMBOS = [
  { id: "boot", name: "BOOT SEQUENCE", parts: ["hdd", "floppy", "crt"],
    guests: ["telegraph", "radio"], colors: ["#64edff", "#fc8bc4"], message: "THE MACHINES ARE ALIVE",
    live: "LIVE FROM THE MOTHERBOARD", cues: { build: "POWER-ON SELF TEST", breath: "PRESS ANY KEY...", drop: "SYSTEM ONLINE", break: "SAFE MODE...", lift: "REBOOTING", peak: "ALL DRIVES SPINNING", finale: "TURBO BUTTON: ON", outro: "SHUTTING DOWN..." },
    lines: ["BEIGEBOX BIOS v4.51", "MEMORY TEST: 640K OK", "DETECTING IDE DRIVES... C: 420MB", "FLOPPY A: 1.44MB 3.5\"", "STARTING BEIGE-DOS...", "", "*** BONUS DISK: BOOT SEQUENCE ***"] },
  { id: "dial", name: "DIAL-UP NIGHTS", parts: ["modem", "speech", "pcspk"],
    guests: ["radio", "gramophone"], colors: ["#ff91d0", "#9b9dff"], message: "CONNECTED TO ANOTHER DIMENSION",
    live: "LIVE FROM THE NIGHT OWL BBS", cues: { build: "HANDSHAKING...", breath: "KSSSHHHH...", drop: "CARRIER DETECTED", break: "SOMEONE PICKED UP THE PHONE", lift: "REDIALING", peak: "56K OF PURE BLISS", finale: "UPLOADING TO THE STARS", outro: "NO CARRIER" },
    lines: ["ATZ", "OK", "ATDT 555-0199", "CONNECT 28800/ARQ", "WELCOME TO THE NIGHT OWL BBS", "YOU HAVE 1 NEW MESSAGE", "", "*** BONUS DISK: DIAL-UP NIGHTS ***"] },
  { id: "main", name: "MAINFRAME OPERA", parts: ["mainframe", "tape", "teletype"],
    guests: ["reel", "telegraph"], colors: ["#ffc16b", "#ff7aa8"], message: "OLD SOULS. NEW FREQUENCIES.",
    live: "LIVE FROM THE COMPUTER ROOM", cues: { build: "MOUNTING TAPE...", breath: "AWAITING OPERATOR...", drop: "THE BIG IRON SINGS", break: "CORE DUMP...", lift: "RESUBMIT JOB", peak: "2000 CARDS IN HARMONY", finale: "BRAVO! BRAVISSIMO!", outro: "END OF JOB" },
    lines: ["//JOB042  JOB (ACCT),'OPERA'", "//STEP1   EXEC PGM=SING", "READING 2000 CARDS...", "LINE PRINTER READY", "RETURN CODE 0000", "", "*** BONUS DISK: MAINFRAME OPERA ***"] },
  { id: "lan", name: "LAN PARTY", parts: ["cart", "kbd", "joystick"],
    guests: ["gramophone", "reel"], colors: ["#b5ff79", "#70dfff"], message: "EVERYBODY IN THE LOBBY",
    live: "LIVE FROM THE BASEMENT", cues: { build: "WAITING FOR PLAYERS", breath: "LOADING MAP...", drop: "FIGHT!", break: "LAG SPIKE...", lift: "RESPAWNING", peak: "MULTI KILL!", finale: "GG, EVERYBODY", outro: "RETURNING TO LOBBY" },
    lines: ["IPX NETWORK FOUND", "PLAYER 2 HAS JOINED", "PLAYER 3 HAS JOINED", "PING 12MS   FRAGLIMIT 20", "GO GO GO", "", "*** BONUS DISK: LAN PARTY ***"] },
  { id: "cosmic", name: "COSMIC TELEGRAPH", parts: ["teletype", "tube", "scope"],
    guests: ["telegraph", "gramophone"], colors: ["#b5ff79", "#d090ff"], message: "WE COME IN PEACE. AND FUNK.",
    live: "LIVE FROM THE ANALOG UNIVERSE", cues: { build: "TUNING THE ANTENNA", breath: "HOLD THAT THOUGHT...", drop: "WE HAVE CONTACT", break: "ONE MORE TIME...", lift: "HERE WE GO", peak: "EVERYBODY IN ORBIT", finale: "SEND IT TO THE STARS", outro: "BACK TO YOUR MIX" },
    lines: ["CQ CQ... IS ANYBODY OUT THERE?", "SIGNAL FOUND: ANDROMEDA / 1844", "ALIEN TELEGRAPH ONLINE", "LUNAR GRAMOPHONE SPINNING", "TRANSLATING MORSE INTO GROOVE", "... . -. -.. / ..-. ..- -. -.-", "EARTH, YOU HAVE A GREAT BEAT."] },
];
export const DISK_COLORS = COMBOS.map(c => c.colors[0]);
