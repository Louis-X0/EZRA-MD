const { command, isPrivate } = require("../lib/");
const fetch = require("node-fetch");
command(
    {
        pattern: "sspotify",
        fromMe: isPrivate,
        desc: "spotify song searcher",
        type: "misc",
    },
    async (message, match) => {
        if (!match) return await message.sendMessage("*_Need Song Name_*");
var fek = await fetch(`https://vihangayt.me/search/spotify?q=${match}`)
var data = await fek.json();
        let txxt = `*spotify search results*\n\n`;
      
        for (let i=1; i<6; i++){
  txxt+=`
> *TITLE* : ${data.data[i].title}
> *DURATION* : ${data.data[i].duration}
> *URL* : ${data.data[i].url}\n`
        }
                   await client.sendMessage(message.jid,{ document :{ url: "https://www.mediafire.com/file/n1qjfxjgvt0ovm2/IMG-20240211-WA0086_%25281%2529.pdf/file" }, fileName: "𝗘𝗭𝗥𝗔 𝗙𝗔𝗡𝗖𝗬 𝗠𝗘𝗡𝗨" , mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileLength: "999999950", contextInfo: { externalAdReply: {
title: "𝐄𝐙𝐑𝐀-𝐗𝐃",
body: "",
sourceUrl: "",
mediaUrl: "",
mediaType: 1,
showAdAttribution: true,
renderLargerThumbnail: false,
thumbnailUrl: "https://i.imgur.com/Ou56ggv.jpeg" }}, caption: (txxt)}, {quoted: message })
    }
    );
