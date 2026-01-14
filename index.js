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

  // --- SALUDOS ---
  if (texto.match(/\b(hola|hey|buenas|hello|ola)\b/)) {
    return message.reply("👋 ¡Hola! ¿En qué puedo ayudarte?");
  }

  // --- AYUDA GENERAL ---
  if (texto === "ayuda" || texto === "help") {
    return message.reply(
      "🤖 Puedes preguntarme sobre:\n" +
      "• registro\n• reglas\n• ip\n• comandos\n• problemas\n• discord\n• samp\n• admin\n• bots\n• ia\n\n" +
      "Escribe tu duda 👇"
    );
  }

  // --- REGISTRO ---
  if (texto.includes("registr")) {
    return message.reply(
      "🧾 Para registrarte en el servidor usa:\n" +
      "`/registrar Nombre_Apellido`\n" +
      "Ejemplo: `/registrar Juan_Perez`"
    );
  }

  // --- LOGIN ---
  if (texto.includes("login") || texto.includes("contraseña")) {
    return message.reply(
      "🔐 Si tienes problemas de login:\n" +
      "• Revisa mayúsculas\n• No compartas tu clave\n• Si falló, abre un ticket"
    );
  }

  // --- ESTADO DEL SERVIDOR ---
if (
  texto.includes("abrio") ||
  texto.includes("abrió") ||
  texto.includes("abierto") ||
  texto.includes("online") ||
  texto.includes("servidor")
) {
  return message.reply(
    "🟢 El estado del servidor se anuncia en #anuncios.\n" +
    "Si no hay aviso reciente, aún está cerrado."
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

  // --- SAMP ---
  if (texto.includes("samp")) {
    return message.reply(
      "🚗 SA-MP:\n" +
      "• Versión: 0.3.7\n• Usa nombre realista\n• Respeta el rol"
    );
  }

  // --- COMANDOS ---
  if (texto.includes("comandos")) {
    return message.reply(
      "⌨️ Comandos básicos:\n" +
      "• /ayuda\n• /reportar\n• /estadisticas\n• /admins"
    );
  }

  // --- BUGS ---
  if (texto.includes("bug") || texto.includes("error")) {
    return message.reply(
      "🐞 Si encontraste un bug:\n" +
      "• explica qué pasó\n• manda captura\n• abre ticket"
    );
  }

  // --- DISCORD ---
  if (texto.includes("discord")) {
    return message.reply(
      "💬 Discord sirve para:\n" +
      "• soporte\n• avisos\n• reportes\n• comunidad"
    );
  }

  // --- IA / BOT ---
  if (
    texto.includes("ia") ||
    texto.includes("inteligencia artificial") ||
    texto.includes("bot piensa")
  ) {
    return message.reply(
      "🤖 No soy una IA real, pero respondo de forma inteligente usando palabras clave 😎"
    );
  }

  // --- BOT ---
  if (texto.includes("bot")) {
    return message.reply(
      "🤖 Soy el bot del servidor.\n" +
      "Puedo responder dudas, ayudar y mantener orden."
    );
  }

  // --- PROBLEMAS ---
  if (texto.includes("problema") || texto.includes("ayuden")) {
    return message.reply(
      "🆘 Describe tu problema con detalle y te ayudaré."
    );
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



