const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// tokens
const TOKEN = process.env.TOKEN;
const CANAL_ID = "1460726960136130570";

client.on("ready", () => {
  console.log(`Bot conectado como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== CANAL_ID) return;

  const nuevoNombre = message.content.trim();

  // Validar formato
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

    // Borrar mensajes después de 3 segundos
    setTimeout(() => {
      message.delete().catch(() => {});
      confirmacion.delete().catch(() => {});
    }, 3000);

  } catch (error) {
    console.log(error);
    message.reply("❌ No pude cambiar tu nombre (revisa permisos)");
  }
});

// COMANDO STEALTH
if (message.content.startsWith("!ste ")) {
  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

  const texto = message.content.slice(5).trim(); // quita "!ste "

  if (!texto) return;

  await message.channel.send(texto);
  await message.delete();
}
});

client.login(TOKEN);


