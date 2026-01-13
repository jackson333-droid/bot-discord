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
const CANAL_ID = "1460726960136130570";

client.on("ready", () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  /* =========================
     COMANDO STEALTH !ste
     ========================= */
  if (message.content.startsWith("!ste ")) {
    if (
      !message.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) return;

    const texto = message.content.slice(5).trim();
    if (!texto) return;

    await message.channel.send(texto);
    await message.delete().catch(() => {});
    return;
  }

  /* =========================
     CAMBIO DE NICKNAME
     ========================= */
  if (message.channel.id !== CANAL_ID) return;

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

  } catch (error) {
    console.error(error);
    message.reply("❌ No pude cambiar tu nombre (revisa permisos)");
  }
});

client.login(TOKEN);
