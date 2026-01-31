const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ChannelType,
  SlashCommandBuilder,
  REST,
  Routes,
  ButtonBuilder,
  ButtonStyle
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
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = "1433856545594278111";


const CANAL_NOMBRE_ID = "1460726960136130570";
const ADMIN_ROLE_ID = "1433857238602092604";
const CANAL_VIDEOS_ID = "1466834210500378864";
const OWNER_ID = "1216928287410884682";
const STAFF_ROLE_ID = "1433857238602092604";
const CATEGORY_ID = "1433937691325497406";
const LOG_CHANNEL_ID = "1467285599768805417";

// REGISTRAR /panel
const commands = [
  new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Mostrar panel de tickets")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("✅ Comando /panel registrado");
  } catch (err) {
    console.error("Error registrando comandos:", err);
  }
})();

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
client.on("clientReady", () => {
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
      .setTitle("🎬 NUEVO VIDEO DE LATAMGAMERS")
      .setDescription(
        `👉 **Míralo aquí:**\n${url}\n\nNo te lo pierdas, ve a darle apoyo 👀🔥`
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

// ================= INTERACCIONES (TICKETS) =================
client.on("interactionCreate", async interaction => {

  // ===== /panel (solo dueño) =====
  if (interaction.isChatInputCommand() && interaction.commandName === "panel") {

    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: "Solo el dueño puede usar este comando.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🎫 Tickets")
      .setDescription(
        "En este apartado encontrarás los siguientes tickets:\n\n" +
        "📌 Ayuda Administrativa\n" +
        "📌 Soporte Técnico\n" +
        "📌 Reportes\n" +
        "📌 Solicitud de Rol\n" +
        "📌 Facciones\n" +
        "📌 Apelar Sanción\n\n" +
        "Selecciona la categoría abajo 👇"
      )
      .setColor(0x8b0000);

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_categoria")
      .setPlaceholder("📂 Selecciona la categoría")
      .addOptions([
        { label: "Ayuda Administrativa", value: "Ayuda Administrativa" },
        { label: "Soporte Técnico", value: "Soporte Técnico" },
        { label: "Reportes", value: "Reportes" },
        { label: "Solicitud de Rol", value: "Solicitud de Rol" },
        { label: "Facciones", value: "Facciones" },
        { label: "Apelar Sanción", value: "Apelar Sanción" }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.deferReply({ ephemeral: true });
    await interaction.channel.send({ embeds: [embed], components: [row] });

    return interaction.editReply({ content: "✅ Panel enviado." });
  }

  // ===== CREAR TICKET =====
  if (interaction.isStringSelectMenu() && interaction.customId === "ticket_categoria") {

    await interaction.deferReply({ ephemeral: true });

    const categoria = interaction.values[0];

    const existing = interaction.guild.channels.cache.find(
     c => c.name === `ticket-${interaction.user.username}`
    );

    if (existing) {
      return interaction.editReply({
        content: "❌ Ya tienes un ticket abierto."
      });
    }

    // limpiar nombre categoría
    const baseName = categoria
      .toLowerCase()
      .replace(/ /g, "-")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    
    // contar tickets existentes
    const count = interaction.guild.channels.cache.filter(c =>
      c.name.startsWith(baseName)
    ).size + 1;
    
    const ticketNumber = String(count).padStart(3, "0");
    
    const channel = await interaction.guild.channels.create({
      name: `${baseName}-${ticketNumber}`,
      type: ChannelType.GuildText,
      parent: CATEGORY_ID,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages
          ]
        },
        {
          id: STAFF_ROLE_ID,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages
          ]
        }
      ]
    });

    const closeBtn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("cerrar_ticket")
        .setLabel("🔒 Cerrar Ticket")
        .setStyle(4)
    );

    await channel.send({
      content:
        `🎟️ Ticket creado\n👤 ${interaction.user}\n📂 ${categoria}`,
      components: [closeBtn]
    });

    const log = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (log) log.send(`🧾 Ticket abierto por ${interaction.user} | ${categoria}`);

    return interaction.editReply({ content: "✅ Ticket creado." });
  }

  // ===== CERRAR TICKET =====
  if (interaction.isButton() && interaction.customId === "cerrar_ticket") {

    if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
      return interaction.reply({
        content: "Solo staff puede cerrar tickets.",
        ephemeral: true
      });
    }

    const log = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (log) log.send(`🔒 Ticket cerrado por ${interaction.user}`);

    await interaction.reply("🔒 Cerrando ticket...");
    setTimeout(() => interaction.channel.delete(), 3000);
  }

});

client.login(TOKEN);



