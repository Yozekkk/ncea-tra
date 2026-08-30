const ROOT = "/images/voxel";

export const SERVICE_ART = {
  plugins: [
    { src: `${ROOT}/minecraft-command-block.png`, role: "main" },
    { src: `${ROOT}/minecraft-redstone-torch.png`, role: "accent-a" },
    { src: `${ROOT}/minecraft-lever.png`, role: "accent-b" },
  ],
  modpacks: [
    { src: `${ROOT}/minecraft-chest.png`, role: "main" },
    { src: `${ROOT}/minecraft-compass.png`, role: "accent-a" },
  ],
  server: [
    { src: `${ROOT}/minecraft-crafter.png`, role: "main" },
    { src: `${ROOT}/minecraft-diamond-pickaxe.png`, role: "accent-a" },
  ],
  websites: [
    { src: `${ROOT}/minecraft-bookshelf.png`, role: "main" },
    { src: `${ROOT}/minecraft-book-and-quill.png`, role: "accent-a" },
  ],
  design: [
    { src: `${ROOT}/minecraft-enchanting-table.png`, role: "main" },
    { src: `${ROOT}/minecraft-enchanted-book.png`, role: "accent-a" },
  ],
  events: [
    { src: `${ROOT}/minecraft-oak-log.png`, role: "main" },
    { src: `${ROOT}/minecraft-diamond-axe.png`, role: "accent-a" },
    { src: `${ROOT}/minecraft-firework-rocket.png`, role: "accent-b" },
  ],
} as const;

export const SERVICE_MAIN_ASSETS = [
  SERVICE_ART.plugins[0].src,
  SERVICE_ART.modpacks[0].src,
  SERVICE_ART.server[0].src,
  SERVICE_ART.websites[0].src,
  SERVICE_ART.design[0].src,
  SERVICE_ART.events[0].src,
] as const;
