// The four bonus trios.

export const COMBOS = [
  { id: "boot", name: "BOOT SEQUENCE", parts: ["hdd", "floppy", "crt"],
    lines: ["BEIGEBOX BIOS v4.51", "MEMORY TEST: 640K OK", "DETECTING IDE DRIVES... C: 420MB", "FLOPPY A: 1.44MB 3.5\"", "STARTING BEIGE-DOS...", "", "*** BONUS DISK: BOOT SEQUENCE ***"] },
  { id: "dial", name: "DIAL-UP NIGHTS", parts: ["modem", "speech", "pcspk"],
    lines: ["ATZ", "OK", "ATDT 555-0199", "CONNECT 28800/ARQ", "WELCOME TO THE NIGHT OWL BBS", "YOU HAVE 1 NEW MESSAGE", "", "*** BONUS DISK: DIAL-UP NIGHTS ***"] },
  { id: "main", name: "MAINFRAME OPERA", parts: ["mainframe", "tape", "teletype"],
    lines: ["//JOB042  JOB (ACCT),'OPERA'", "//STEP1   EXEC PGM=SING", "READING 2000 CARDS...", "LINE PRINTER READY", "RETURN CODE 0000", "", "*** BONUS DISK: MAINFRAME OPERA ***"] },
  { id: "lan", name: "LAN PARTY", parts: ["cart", "kbd", "joystick"],
    lines: ["IPX NETWORK FOUND", "PLAYER 2 HAS JOINED", "PLAYER 3 HAS JOINED", "PING 12MS   FRAGLIMIT 20", "GO GO GO", "", "*** BONUS DISK: LAN PARTY ***"] },
];
export const DISK_COLORS = ["var(--c-beat)", "var(--c-fx)", "var(--c-mel)", "var(--c-voc)"];
