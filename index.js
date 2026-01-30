const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  EmbedBuilder
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ================= CONFIG =================
const TOKEN = process.env.TOKEN;

// CANAL PARA CAMBIO DE NOMBRE
const CANAL_NOMBRE_ID = "1460726960136130570";
const CANAL_VIDEOS_ID = "1466834210500378864";

// IDS DE CONFIANZA
const TRUSTED_IDS = [
  "439605128186691584",
  "1216928287410884682",
  "1128192952875880448"
];

// LIMITES ANTINUKE
const LIMITS = {
  ban: 2,
  kick: 2,
  channel: 2,
  role: 2,
  time: 10000
};

const actionTracker = new Map();

// ================= READY =================
client.on("ready", () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

// ================= FUNCIONES =================
function isTrusted(userId, guild) {
  return TRUSTED_IDS.includes(userId) || guild.ownerId === userId;
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
    await member.roles.set([], "ANTINUKE PRO");
    await guild.members.ban(userId, {
      reason: `ANTINUKE PRO: ${reason}`
    });
  } catch {}
}

// ================= MENSAJES =================
client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;

  // ===== STEALTH =====
  if (message.content.startsWith("!ste ")) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    const msg = message.content.slice(5).trim();
    if (!msg) return;

    await message.delete().catch(() => {});
    await message.channel.send(msg);
    return;
  }

  // ===== CAMBIO DE NOMBRE =====
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
    } catch {
      message.reply("❌ No pude cambiar tu nombre (permisos)");
    }
    return;
  }
  // ===== AUTO VIDEO EMBED=====
  if (message.channel.id === CANAL_VIDEOS_ID) {

    // solo admins
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await message.delete().catch(() => {});
      return;
    }

    const url = message.content.trim();

    // detectar cualquier link
    const linkRegex = /(https?:\/\/[^\s]+)/i;
    if (!linkRegex.test(url)) {
      await message.delete().catch(() => {});
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x8b0000) // rojo oscuro
      .setTitle("🎬 NUEVO VIDEO")
      .setDescription(
        `👉 **Míralo aquí:**\n${url}\n\nNo te lo pierdas 👀🔥`
      )
      .setFooter({
        text: `Subido por ${message.author.username}`
      })
      .setTimestamp();

    await message.delete().catch(() => {});
    const msg = await message.channel.send({ embeds: [embed] });

    // reacciones automáticas
    await msg.react("❤️");
    await msg.react("🔥");
    await msg.react("👀");

    return;
  }

  // ===== COMANDO IP =====
  if (message.content.toLowerCase() === "!ip") {
    return message.reply("🌐 IP del servidor: **144.217.174.212:1167**");
  }
});

// ================= ANTINUKE =================

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
  } catch {}
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

// ================= ANTI BOT INVITE =================
client.on("guildMemberAdd", async (member) => {
  if (!member.user.bot) return;

  const guild = member.guild;

  try {
    const logs = await guild.fetchAuditLogs({ type: 28, limit: 1 });
    const entry = logs.entries.first();
    if (!entry) return;

    const executor = entry.executor;
    if (!executor || isTrusted(executor.id, guild)) return;

    await guild.members.ban(member.id, {
      reason: "ANTINUKE PRO: Bot invitado sin autorización"
    });

    await guild.members.ban(executor.id, {
      reason: "ANTINUKE PRO: Invitó bot sin permiso"
    });
  } catch (err) {
    console.error("Error AntiBot:", err);
  }
});

client.login(TOKEN);


