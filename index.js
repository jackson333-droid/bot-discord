const {
  Client,
  GatewayIntentBits,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ================= VARIABLES =================
const TOKEN = process.env.TOKEN;

const CANAL_NOMBRE_ID = "1460726960136130570";

const CANALES_AYUDA = [
  "1433856546558971936",
  "1433917373152493660",
  "1456916096312545374"
];

// ================= ANTINUKE PRO =================
const TRUSTED_IDS = [
  "439605128186691584", // Charlie
  "1216928287410884682", // Andrew
  "1128192952875880448"  // Yeriel
];

// límites (muy agresivo)
const LIMITS = {
  ban: 2,
  kick: 2,
  channel: 2,
  role: 2,
  time: 10000 // 10 segundos
};

const actionTracker = new Map();
// ===============================================

// ================= READY =================
client.on("ready", () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

function isTrusted(userId, guild) {
  if (TRUSTED_IDS.includes(userId)) return true;
  if (guild.ownerId === userId) return true;
  return false;
}

function registerAction(userId, type) {
  if (!actionTracker.has(userId)) {
    actionTracker.set(userId, { ban: 0, kick: 0, channel: 0, role: 0 });
    setTimeout(() => actionTracker.delete(userId), LIMITS.time);
  }

  const data = actionTracker.get(userId);
  data[type]++;
  return data[type] >= LIMITS[type];
}

async function punish(guild, userId, reason) {
  try {
    const member = await guild.members.fetch(userId);

    // quitar todos los roles
    await member.roles.set([], "ANTINUKE PRO");

    // ban inmediato
    await guild.members.ban(userId, {
      reason: `ANTINUKE PRO: ${reason}`
    });
  } catch (e) {}
}

// ================= MENSAJES =================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const texto = message.content.toLowerCase();

  // ================= STEALTH =================
  if (message.content.startsWith("!ste ")) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    const msg = message.content.slice(5).trim();
    if (!msg) return;

    await message.delete().catch(() => {});
    await message.channel.send(msg);
    return;
  }

  // ================= CAMBIO DE NOMBRE =================
  if (message.channel.id === CANAL_NOMBRE_ID) {
    const nuevoNombre = message.content.trim();

    if (!nuevoNombre.includes("_")) {
      const aviso = await message.reply("❌ Usa el formato: Nombre_Apellido");
      setTimeout(() => aviso.delete().catch(() => {}), 5000);
      return;
    }

    try {
      await message.member.setNickname(nuevoNombre);
      const confirmacion = await message.reply(
        `✅ Tu nombre fue cambiado a **${nuevoNombre}**`
      );

      setTimeout(() => {
        message.delete().catch(() => {});
        confirmacion.delete().catch(() => {});
      }, 3000);
    } catch (err) {
      console.error(err);
      message.reply("❌ No pude cambiar tu nombre (revisa permisos)");
    }
    return;
  }

  // ================= RESPUESTAS AUTOMÁTICAS =================
  if (!CANALES_AYUDA.includes(message.channel.id)) return;

  // AYUDA
  if (texto === "ayuda" || texto === "help") {
    return message.reply(
      "🤖 Puedes preguntarme sobre:\n" +
      "• reglas\n• ip\n• servidor\n• admins\n" +
      "Escribe tu duda 👇"
    );
  }

  // REGLAS
  if (texto.includes("reglas") || texto.includes("normas")) {
    return message.reply("📜 Las reglas están en el canal #normativas");
  }

  // IP
  if (texto.includes("ip")) {
    return message.reply("🌐 IP del servidor: **PRÓXIMAMENTE**");
  }

  // ADMINS
  if (texto.includes("admin")) {
    return message.reply("🛡️ Los administradores te ayudan con reportes y problemas graves.");
  }

// SOLO RESPONDE SI PREGUNTAN EXPLÍCITAMENTE
if (texto.startsWith("?")) {
  return message.reply(
    "🤖 No entendí del todo, intenta reformular la pregunta o escribe `ayuda`"
  );
}
  //  ANTINUKE 

// BAN
client.on("guildBanAdd", async (ban) => {
  const guild = ban.guild;
  const logs = await guild.fetchAuditLogs({ type: 22, limit: 1 });
  const entry = logs.entries.first();
  if (!entry) return;

  const executor = entry.executor;
  if (!executor || isTrusted(executor.id, guild)) return;

  if (registerAction(executor.id, "ban")) {
    await punish(guild, executor.id, "BAN MASIVO");
  }
});

// KICK
client.on("guildMemberRemove", async (member) => {
  const guild = member.guild;
  const logs = await guild.fetchAuditLogs({ type: 20, limit: 1 });
  const entry = logs.entries.first();
  if (!entry) return;

  const executor = entry.executor;
  if (!executor || isTrusted(executor.id, guild)) return;

  if (registerAction(executor.id, "kick")) {
    await punish(guild, executor.id, "KICK MASIVO");
  }
});

// BORRADO DE CANALES
client.on("channelDelete", async (channel) => {
  const guild = channel.guild;
  const logs = await guild.fetchAuditLogs({ type: 12, limit: 1 });
  const entry = logs.entries.first();
  if (!entry) return;

  const executor = entry.executor;
  if (!executor || isTrusted(executor.id, guild)) return;

  if (registerAction(executor.id, "channel")) {
    await punish(guild, executor.id, "ELIMINACIÓN DE CANALES");
  }

  try {
    await channel.clone({ reason: "ANTINUKE PRO: Canal restaurado" });
  } catch (e) {}
});

// ROLES
client.on("roleDelete", async (role) => {
  const guild = role.guild;
  const logs = await guild.fetchAuditLogs({ type: 32, limit: 1 });
  const entry = logs.entries.first();
  if (!entry) return;

  const executor = entry.executor;
  if (!executor || isTrusted(executor.id, guild)) return;

  if (registerAction(executor.id, "role")) {
    await punish(guild, executor.id, "ELIMINACIÓN DE ROLES");
  }
});

client.on("roleCreate", async (role) => {
  if (!role.permissions.has(PermissionsBitField.Flags.Administrator)) return;

  const guild = role.guild;
  const logs = await guild.fetchAuditLogs({ type: 30, limit: 1 });
  const entry = logs.entries.first();
  if (!entry) return;

  const executor = entry.executor;
  if (!executor || isTrusted(executor.id, guild)) return;

  await role.delete("ANTINUKE PRO: Rol admin ilegal");
  await punish(guild, executor.id, "CREACIÓN DE ROL ADMIN");
});

client.login(TOKEN);



