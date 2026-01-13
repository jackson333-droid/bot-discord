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

// VARIABLES
const TOKEN = process.env.TOKEN;
const CANAL_NOMBRE_ID = "1460726960136130570"; // nombre_apellido
const CANAL_AYUDA_ID = "ID_DEL_CANAL_AYUDA"; // <-- CAMBIA ESTO

client.on("ready", () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const texto = message.content.toLowerCase();

  /* =========================
     COMANDO STEALTH
     ========================= */
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

  /* =========================
     ASISTENTE AUTOMÁTICO
     ========================= */
  if (message.channel.id === CANAL_AYUDA_ID) {

    // REGISTRO
    if (texto.includes("registr")) {
      return message.reply(
        "📌 Para registrarte entra al SA-MP y usa:\n`/registrar Nombre_Apellido`"
      );
    }

    // LOGIN
    if (
      texto.includes("no puedo entrar") ||
      texto.includes("contraseña") ||
      texto.includes("login")
    ) {
      return message.reply(
        "🔐 Revisa tu contraseña. Si la olvidaste, contacta a un admin."
      );
    }

    // IP
    if (texto.includes("ip")) {
      return message.reply(
        "🌐 IP del servidor: **Proximamente**"
      );
    }

    // NOMBRE RP
    if (
      texto.includes("nombre") ||
      texto.includes("apellido") ||
      texto.includes("nick")
    ) {
      return message.reply(
        "🧾 El nombre debe ser formato RP:\n`Nombre_Apellido`"
      );
    }

    // NORMAS
    if (
      texto.includes("normas") ||
      texto.includes("regla")
      texto.includes("reglas")
    ) {
      return message.reply(
        "📜 Revisa el canal #normativas antes de jugar."
      );
    }

    // REPORTES
    if (
      texto.includes("report") ||
      texto.includes("denunciar")
    ) {
      return message.reply(
        "🚨 Usa /report dentro del juego o abre ticket en Discord."
      );
    }

    // AYUDA GENERAL
    if (
      texto.includes("ayuda") ||
      texto.includes("help")
    ) {
      return message.reply(
        "❓ Explica mejor tu duda y el bot o un staff te ayudará."
      );
    }
  }

  /* =========================
     CAMBIO DE NOMBRE
     ========================= */
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
    message.reply("❌ No pude cambiar tu nombre");
  }
});

client.login(TOKEN);

