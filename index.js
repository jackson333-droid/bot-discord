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

// ================= READY =================
client.on("ready", () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

// ================= MENSAJES =================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const texto = message.content.toLowerCase();

  // ================= STEALTH =================
  if (message.content.startsWith("!ste ")) {
    if (
      !message.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) return;

    const msg = message.content.slice(5).trim();
    if (!msg) return;

    await message.delete().catch(() => {});
    await message.channel.send(msg);
    return;
  }

// ================= RESPUESTAS AUTOMÁTICAS TIPO IA =================
if (CANALES_AYUDA.includes(message.channel.id)) {

  }

  // --- AYUDA GENERAL ---
  if (texto === "ayuda" || texto === "help") {
    return message.reply(
      "🤖 Puedes preguntarme sobre:\n" +
      "• reglas\n• ip\n" +
      "Escribe tu duda 👇"
    );
  }

  // --- REGLAS ---
  if (texto.includes("reglas") || texto.includes("normas")) {
    return message.reply("📜 Las reglas están en el canal #normativas");
  }

  // --- IP ---
  if (texto.includes("ip")) {
    return message.reply("🌐 IP del servidor: **PRÓXIMAMENTE**");
  }
  
  // --- NO ENTIENDE ---
  if (texto.length > 1) {
    return message.reply(
      "🤔 No entendí del todo, intenta explicarlo mejor o escribe `ayuda`"
    );
  }
}

  // ================= CAMBIO DE NOMBRE =================
  if (message.channel.id !== CANAL_NOMBRE_ID) return;

  const nuevoNombre = message.content.trim();

  if (!nuevoNombre.includes("_")) {
    const aviso = await message.reply(
      "❌ Usa el formato: Nombre_Apellido"
    );
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
});

client.login(TOKEN);




