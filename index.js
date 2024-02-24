const {
  default: makeWASocket,
  useMultiFileAuthState,
  Browsers,
  makeInMemoryStore,
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const { serialize } = require("./lib/serialize");
const { Message, Image, Sticker } = require("./lib/Base");
const pino = require("pino");
const path = require("path");
const events = require("./lib/event");
const got = require("got");
const config = require("./config");
const { PluginDB } = require("./lib/database/plugins");
const Greetings = require("./lib/Greetings");
const { MakeSession } = require("./lib/session");
const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

require("events").EventEmitter.defaultMaxListeners = 500;
      
if (!fs.existsSync("./lib/session/creds.json")) {
  MakeSession(config.SESSION_ID, "./lib/session/creds.json").then(
    console.log("Vesrion : " + require("./package.json").version)
  );
}
fs.readdirSync("./lib/database/").forEach((plugin) => {
  if (path.extname(plugin).toLowerCase() == ".js") {
    require("./lib/database/" + plugin);
  }
});

async function Abhiy() {
  console.log("Syncing Database");
  await config.DATABASE.sync();

  const { state, saveCreds } = await useMultiFileAuthState(
  "./lib/session" ,
    pino({ level: "silent" })
  );
  let conn = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: true,

    browser: Browsers.macOS("Desktop"),
    downloadHistory: false,
    syncFullHistory: false,
  });
  store.bind(conn.ev);
  //store.readFromFile("./lib/afiya.json");
  setInterval(() => {
    store.writeToFile("./lib/store_db.json");
    console.log("saved store");
  }, 30 * 60 * 1000);

  conn.ev.on("connection.update", async (s) => {
    const { connection, lastDisconnect } = s;
    if (connection === "connecting") {
      console.log("Ezra");
      console.log("𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗶𝗻𝗴 𝗘𝘇𝗿𝗮𝗮𝗮𝗮𝗵𝗵 々");
    }

    if (
      connection === "close" &&
      lastDisconnect &&
      lastDisconnect.error &&
      lastDisconnect.error.output.statusCode != 401
    ) {
      console.log(lastDisconnect.error.output.payload);
      Abhiy();
    }

    if (connection === "open") {
    
      console.log("〄 𝗥𝗲𝗮𝗱𝗶𝗻𝗴 𝗦𝗲𝘀𝘀𝗶𝗼𝗻 𝗜’𝗱 〄");
      console.log("𝗜𝗻𝘀𝘁𝗮𝗹𝗹𝗶𝗻𝗴 𝗣𝗹𝘂𝗴𝗶𝗻𝘀🧩...");

      let plugins = await PluginDB.findAll();
      plugins.map(async (plugin) => {
        if (!fs.existsSync("./plugins/" + plugin.dataValues.name + ".js")) {
          console.log(plugin.dataValues.name);
          var response = await got(plugin.dataValues.url);
          if (response.statusCode == 200) {
            fs.writeFileSync(
              "./plugins/" + plugin.dataValues.name + ".js",
              response.body
            );
            require("./plugins/" + plugin.dataValues.name + ".js");
          }
        }
      });
      console.log(" 𝗦𝗲𝘀𝘀𝗶𝗼𝗻 𝗜’𝗱 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱🔗");

      fs.readdirSync("./plugins").forEach((plugin) => {
        if (path.extname(plugin).toLowerCase() == ".js") {
          require("./plugins/" + plugin);
        }
      });
      console.log(" 𝗘𝘇𝗿𝗮-𝗫𝗗 𝗜𝘀 𝗦𝘁𝗮𝗿𝘁𝗲𝗱🔋");
      let str = `〄  𝑬𝒁𝑹𝑨 𝑿𝑫 𝑺𝑻𝑨𝑹𝑻𝑬𝑫  〄 \n\n\n✘ 𝗩𝗘𝗥𝗦𝗜𝗢𝗡 : *_${require("./package.json").version }_* \n✘ 𝗣𝗟𝗨𝗚𝗜𝗡𝗦 : *_${events.commands.length}_* \n✘ 𝗠𝗢𝗗𝗘 : *_${config.WORK_TYPE}_* \n✘ 𝗦𝗨𝗗𝗢  : *_${config.SUDO}_*`;
      conn.sendMessage(conn.user.id, { text: str });
     try {
        conn.ev.on("creds.update", saveCreds);

        conn.ev.on("group-participants.update", async (data) => {
          Greetings(data, conn);
        });
        conn.ev.on("messages.upsert", async (m) => {
          if (m.type !== "notify") return;
          let ms = m.messages[0];
          let msg = await serialize(JSON.parse(JSON.stringify(ms)), conn);
          if (!msg.message) return;
          let text_msg = msg.body;
          if (text_msg && config.LOGS)
            console.log(
              `At : ${
                msg.from.endsWith("@g.us")
                  ? (await conn.groupMetadata(msg.from)).subject
                  : msg.from
              }\nFrom : ${msg.sender}\nMessage:${text_msg}`
            );

          events.commands.map(async (command) => {
            if (
              command.fromMe &&
              !config.SUDO.split(",").includes(
                msg.sender.split("@")[0] || !msg.isSelf
              )
            )
              return;
            let comman;
            if (text_msg) {
              comman = text_msg.trim().split(/ +/)[0];
              msg.prefix = new RegExp(config.HANDLERS).test(text_msg)
                ? text_msg.split("").shift()
                : ",";
            }
            if (command.pattern && command.pattern.test(comman)) {
              var match;
              try {
                match = text_msg.replace(new RegExp(comman, "i"), "").trim();
              } catch {
                match = false;
              }
              whats = new Message(conn, msg, ms);
              command.function(whats, match, msg, conn);
            } else if (text_msg && command.on === "text") {
              whats = new Message(conn, msg, ms);
              command.function(whats, text_msg, msg, conn, m);
            } else if (
              (command.on === "image" || command.on === "photo") &&
              msg.type === "imageMessage"
            ) {
              whats = new Image(conn, msg, ms);
              command.function(whats, text_msg, msg, conn, m, ms);
            } else if (
              command.on === "sticker" &&
              msg.type === "stickerMessage"
            ) {
              whats = new Sticker(conn, msg, ms);
              command.function(whats, msg, conn, m, ms);
            }
          });
        });
      } catch (e) {
        console.log(e.stack + "\n\n\n\n\n" + JSON.stringify(msg));
      }
    }
  });
  process.on("uncaughtException", async (err) => {
    let error = err.message;
       
   await console.log(err);
 await conn.sendMessage(conn.user.id, { text: error });
    
  });
}
setTimeout(() => {
  Abhiy();
}, 3000);
