const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { default: axios } = require("axios");
const { glob } = require("glob");
const CFonts = require("cfonts");
const ResponseLike = require("responselike");
const global_var = {};
global_var.tebak_gambar = {};
global_var.id_gambar = {};

// function download gambar
function dgambar(url) {
  return axios
    .get(url, {
      responseType: "arraybuffer",
    })
    .then((response) => Buffer.from(response.data, "binary").toString("base64"));
}

// C:\ffmpeg\bin
const client = new Client({
  puppeteer: {
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  },
  authStrategy: new LocalAuth(),
  ffmpegPath: "C:\\ffmpeg\\bin\\ffmpeg.exe",
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  CFonts.say("sbhanbot v.1|Connected!", {
    align: "center",
    font: "chrome",
    gradient: ["red", "yellow"],
  });
});

// pesan
client.on("message", async (msg) => {
  const contact = await msg.getContact();
  // for menu
  if (msg.body === ".menu") {
    msg.reply(
      "*List Command sbhanbot v.1* \n*|-> About* \n|-> .menu [untuk lihat list menu] \n|-> .about [tentang bot] \n|\n*|-> Admin* \n|-> .tag [tag semua, kecuali admin]\n|\n*|-> Games* \n|-> .tebak gambar [untuk main tebak gambar] \n|\n*|-> Kata-kata* \n|-> .kata bijak [random kata2 bijak] \n|-> .kata faktaunik [random fakta unik] \n|-> .kata pakboy [generate pantun pakboy] \n|\n*|-> Islami* \n|-> .ayat kursi [menampilkan ayat kursi]\n|-> .doa [generate doa] \n|\n*|-> Media* \n|-> .stiker [foto kasih caption .stiker] \n|-> .pinterest {link} [downloader pinterest] \n|\n*|-> Search* \n|-> .wiki : {query} [pencarian wikipedia]\n|\n*|-> Info Bot* \n|-> .info [info bot]"
    );
  } else if (msg.body === ".about") {
    msg.reply(
      "*About :* \nAlasan pengembang membuat bot ini adalah terinspirasi dari seseorang sekaligus ingin belajar akan hal baru. Tentunya bot ini bertujuan untuk hal yang bermanfaat dan bot ini akan selalu di update sampai pengembang bosan. \n\nDeveloped with ❤ by Subhan Fadilah \nGithub : https://github.com/sbhan9"
    );
  }

  // for game tebak gambar
  if (msg.body === ".tebak gambar") {
    msg.reply("_sedang menggenerate gambar..._");
    await axios.get("https://api.akuari.my.id/games/tebakgambar").then(function (resp) {
      global_var.data_gambar = resp.data;
    });

    const g = "id";
    global_var.tebak_gambar[global_var.data_gambar.img.split("/").pop().split(".")[0]] = global_var.data_gambar.jawaban.toLowerCase();
    const idGambar = (global_var.id_gambar[g] = global_var.data_gambar.img.split("/").pop().split(".")[0]);

    const gambar = await dgambar(global_var.data_gambar.img);
    const media = new MessageMedia("image/png", gambar);

    client.sendMessage(msg.from, media, {
      caption:
        `Haii @${contact.id.user}` +
        " silahkan menjawab dengan benar 😇\n\nID Gambar : " +
        global_var.data_gambar.img.split("/").pop().split(".")[0] +
        "\n\nUntuk menjawab jawaban gunakan perintah : .jawab idGambar : jawaban \n\nContoh : .jawab 123 : kucing garong \n\nDeveloped by Subhan Fadilah",
      mentions: [contact],
    });
  } else if (msg.body.indexOf(".jawab") !== -1) {
    var id = msg.body.split(" ")[1];
    try {
      var jawaban = msg.body.split(":")[1].replace(" ", "").toLowerCase();
    } catch (error) {
      msg.reply("ID Gambar tidak valid!");
      return;
    }
    if (global_var.tebak_gambar[id]) {
      if (jawaban == global_var.tebak_gambar[id]) {
        // balas jawaban benar
        msg.reply("Jawaban benar 👏👏👏");
      } else {
        //   balas salah
        msg.reply("Jawaban kurang tepat!");
      }
    } else {
      //   balas id tidak valid
      msg.reply("ID Gambar tidak valid!");
    }
  } else if (msg.body.indexOf(".nyerah") !== -1) {
    var id = msg.body.split(" ").pop();
    if (global_var.id_gambar.id) {
      if (id == global_var.id_gambar.id) {
        msg.reply("Anda Menyerah 😭 \nJawabannya adalah : " + global_var.data_gambar.jawaban);
      } else {
        msg.reply("ID Gambar tidak valid!");
      }
    } else {
      msg.reply("ID Gambar tidak valid!");
    }
  } else if (msg.body == ".soal") {
    msg.reply("_Masih dalam tahap pembuatan. 🙏_");
  }

  // kata kata
  if (msg.body.indexOf(".kata") !== -1) {
    const k = msg.body.split(" ").pop();
    if (k === "bijak") {
      // kata bijak
      axios.get("https://api.akuari.my.id/randomtext/katabijak").then(function (resp) {
        msg.reply('"' + resp.data.hasil.quotes + '"\n' + "- " + resp.data.hasil.author + " -");
      });
    } else if (k === "pakboy") {
      // kata pakboy
      axios.get("https://api.akuari.my.id/randomtext/pantunpakboy").then(function (resp) {
        msg.reply(resp.data.hasil.result);
      });
    } else if (k == "faktaunik") {
      axios.get("https://api.akuari.my.id/randomtext/faktaunik").then(function (resp) {
        msg.reply('Tahukah kamu "' + resp.data.hasil + '" \n- sbhanbot -');
      });
    } else {
      msg.reply("_Command tidak dapat di eksekusi._");
    }
  }

  // tag user group yang hanya bisa di lakukan oleh admin saja
  if (msg.body === ".tag") {
    try {
      const chat = await msg.getChat();
      let mentions = [];
      let userName = "";
      for (global_var.participant of chat.participants) {
        const contact = await client.getContactById(global_var.participant.id._serialized);
        if (global_var.participant.isAdmin == false) {
          mentions.push(contact);
          userName += `@${global_var.participant.id.user} `;
        }
      }

      if (contact.number) {
        function myD(data) {
          const nomor = contact.number;
          if (nomor == data.id.user && data.isAdmin == true) {
            chat.sendMessage(userName, { mentions });
          } else if (nomor == data.id.user && data.isAdmin == false) {
            msg.reply("_Command .tag hanya dapat dijalankan oleh admin saja._");
            return;
          }
        }
        chat.participants.forEach(myD);
      }
    } catch (error) {
      msg.reply("_Command .tag hanya dapat dijalankan di dalam grup._");
    }
  }

  // Islami
  if (msg.body === ".ayat kursi") {
    // ayat kursi
    axios.get("https://api.akuari.my.id/islami/ayatkursi").then(function (resp) {
      msg.reply(resp.data.result.arabic + "\n\n" + "_" + resp.data.result.latin + "_" + "\n\n" + "*Artinya :* " + '"' + resp.data.result.translation + '"' + "\n\n*Tafsir :* " + resp.data.result.tafsir);
    });
  } else if (msg.body === ".doa") {
    // doa
    axios.get("https://api.akuari.my.id/islami/doa").then(function (resp) {
      msg.reply("*" + resp.data.result.title + "* \n\n" + resp.data.result.arabic + "\n\n" + "_" + resp.data.result.latin + "_" + "\n\n" + "*Artinya :* " + '"' + resp.data.result.translation + '"');
    });
  }

  // Media stiker
  if (msg.body === ".stiker") {
    if (msg.hasMedia) {
      const media = await msg.downloadMedia();
      client.sendMessage(msg.from, media, { sendMediaAsSticker: true });
    }
  } else if (msg.body.indexOf(".pinterest") !== -1) {
    const link = msg.body.split(" ").pop();
    const pinterest = "https://api.akuari.my.id/downloader/pindl?link=" + link;
    await axios.get(pinterest).then(function (respon) {
      // code
      global_var.media = respon.data;
    });
    console.log(global_var.media.split("."));
    msg.reply("_Mohon maaf download file pinterest masih tahap pengembangan._");
  }

  // Search
  if (msg.body.indexOf(".wiki") !== -1) {
    const query = msg.body.split(":")[1].replace(" ", "");
    const api = "https://api.akuari.my.id/search/wiki?query=" + query;
    if (query) {
      await axios.get(api).then(function (respon) {
        global_var.thumb = respon.data.result[0].thumb;
        global_var.judul = respon.data.result[0].judul;
        global_var.wiki = respon.data.result[0].wiki;
      });

      if (global_var.judul == "Hasil pencarian") {
        msg.reply("_*" + query + "* Tidak terdaftar di Wikipedia._");
      } else {
        const thumb = await dgambar(global_var.thumb);
        const media = new MessageMedia("image/png", thumb);
        client.sendMessage(msg.from, media, { caption: "*" + global_var.judul + "* request dari @" + contact.id.user + " \n" + global_var.wiki, mentions: [contact] });
      }
    }
  }

  if (msg.body === ".bot off") {
    if (contact.number === "628999098812") {
      msg.reply("_bot akan dimatikan dalam 30 detik bos._");
      setTimeout(function () {
        process.exit();
      }, 30000);
    } else {
      msg.reply("_bot hanya bisa dimatikan oleh pengembang ya._");
    }
  }

  const chat = await msg.getChat();
  if (msg.body === ".info") {
    msg.reply("_Setelah pembuatan fitur download pinterest selesai maka bot tidak akan diupdate lagi. Apabila ingin belajar tentang bot atau ingin mengembangkan bot ini silahkan masukan Command : .unduh bot_ \n\n- by sbhan v.1 -");
  } else if (msg.body === ".unduh bot") {
    const linkUnduh = "";
    msg.reply(linkUnduh + "\n\nSilahkan unduh project bot sbhanbot v.1 di google drive \n\n*Tutorial Installasi* \n1. ");
  }
});

client.initialize();
