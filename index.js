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

  // ================= AYUDA AUTOMÁTICA =================
  if (CANALES_AYUDA.includes(message.channel.id)) {

    if (texto.includes("registr")) {
      return message.reply(
        "📌 Para registrarte entra al SA-MP y usa:\n`/registrar Nombre_Apellido`"
      );
    }

    if (
      texto.includes("login") ||
      texto.includes("contraseña") ||
      texto.includes("no puedo entrar")
    ) {
      return message.reply(
        "🔐 Si olvidaste tu contraseña, contacta a un administrador."
      );
    }

    if (texto.includes("ip")) {
      return message.reply(
        "🌐 IP del servidor: **PRÓXIMAMENTE**"
      );
    }

    if (
      texto.includes("nombre") ||
      texto.includes("apellido") ||
      texto.includes("nick")
    ) {
      return message.reply(
        "🧾 El nombre RP debe ser:\n`Nombre_Apellido`"
      );
    }

    if (
      texto.includes("normas") ||
      texto.includes("reglas")
    ) {
      return message.reply(
        "📜 Revisa el canal #normativas antes de jugar."
      );
    }

    if (
      texto.includes("report") ||
      texto.includes("denunciar")
    ) {
      return message.reply(
        "🚨 Usa `/report` dentro del juego o abre un ticket."
      );
    }

    if (
      texto === "ayuda" ||
      texto === "help"
    ) {
      return message.reply(
        "❓ Escribe tu duda y el bot o un staff te ayudará."
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
