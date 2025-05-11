const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const ytSearch = require('yt-search');
const mime = require('mime-types');
const qrcode = require('qrcode-terminal');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const os = require('os');
ffmpeg.setFfmpegPath(ffmpegPath);

const TEMP_FOLDER = path.resolve('C:/Users/nobre/Pictures/meu-bot3-20250510T230617Z-1-001/meu-bot3/temporario');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox'
        ],
        defaultViewport: {
            width: 1280,
            height: 800
        }
    }
});

const GRUPOS_ALVO_IDS = [
    '120363417261522486@g.us',
    '120363401096340709@g.us',
    '559981042253-1593023248@g.us',
    '120363399451653696@g.us',
    '120363144241207265@g.us',
    '120363419887702797@g.us'
];

const SEU_NUMERO = '559984242052@c.us';

const IDS_PROTEGIDOS = [
    '559984242952@c.us',
    '559887200815@c.us'
];

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

const DOWNLOAD_DIR = 'C://Users//nobre//Pictures//meu-bot3-20250510T230617Z-1-001//meu-bot3//downloads';

client.on('ready', () => {
    console.log('✅ Bot está pronto!');
    console.log(`🌍 Navegador usado: ${client.puppeteerBrowser.version()}`);
});

client.on('message', async msg => {
    const chat = await msg.getChat();
    const message = msg.body;

    if (chat.isArchived) return;

    if (chat.isGroup) {
        console.log(`📛 Grupo: ${chat.name}`);
        console.log(`🆔 ID do grupo: ${chat.id._serialized}`);
    }

    if (!chat.isGroup || !GRUPOS_ALVO_IDS.includes(chat.id._serialized)) return;

    if (!chat.isGroup || !GRUPOS_ALVO_IDS.includes(chat.id._serialized)) return;

    const isBotAdmin = chat.participants.find(p => p.id._serialized === client.info.wid._serialized)?.isAdmin;
    const isUserAdmin = chat.participants.find(p => p.id._serialized === msg.from)?.isAdmin;

    if (!chat.isGroup) return;

    if (msg.body.startsWith('!ban') && msg.mentionedIds.length > 0) {
        if (!isUserAdmin) {
            return client.sendMessage(chat.id._serialized, '❌ Você precisa ser administrador para banir alguém.');
        }

        for (const targetId of msg.mentionedIds) {
            if (IDS_PROTEGIDOS.includes(targetId)) {
                await client.sendMessage(chat.id._serialized, '⚠️ Tentativa de banir membro protegido. Banindo o autor.');
                try {
                    await chat.removeParticipants([msg.author]);
                    console.log(`Autor ${msg.author} banido por tentar banir o protegido ${targetId}`);
                } catch (e) {
                    console.error(`❌ Falha ao remover o autor: ${e}`);
                }
                return;
            }

            try {
                await chat.removeParticipants([targetId]);
                await client.sendMessage(chat.id._serialized, `👢 Usuário removido: @${targetId.split('@')[0]}`, {
                    mentions: [targetId]
                });
            } catch (e) {
                await client.sendMessage(chat.id._serialized, `❌ Não consegui remover @${targetId.split('@')[0]}`);
            }
        }
    }

    if (message === '!ping') {
        console.log(`[Comando] !ping usado por ${msg.from}`);
        return client.sendMessage(msg.from, 'pong');
    }

    if (message.toLowerCase() === '!d6' || message === '!6') {
        const numero = Math.floor(Math.random() * 6) + 1;
        const caminhoAudio = path.resolve(`C:/Users/nobre/Pictures/meu-bot3-20250510T230617Z-1-001/meu-bot3/audios`);

        if (fs.existsSync(caminhoAudio)) {
            const media = MessageMedia.fromFilePath(caminhoAudio);
            await msg.reply(media);
        } else {
            await msg.reply(`🎲 Você rolou um d6 e tirou: ${numero}, mas o áudio não foi encontrado.`);
        }
    }

    if (message === '!menu') {
        return client.sendMessage(msg.from, ` 
🌟 Olá! Eu sou o BotZin, seu assistente digital no WhatsApp 🤖
📋 Aqui está o menu de comandos disponíveis:

🟢 !ping — Verifica se estou online
🎲 !d6 — Rola um dado de 6 lados e envia o áudio 🎙️
🖼️ !g — Envie uma imagem e eu transformo em figurinha 🔥
🔨 !ban @user — Remove um membro (somente para administradores)
➕ !add 55XXXXXXXXXX — Adiciona alguém ao grupo (apenas ADM)
🎵 !musica [nome ou link] — Baixo a música em MP3 pra você 🎧
🎬 !video [nome ou link] — Envio um vídeo com qualidade 🎥

❓ Dúvidas? Use o comando !ajuda
📡 BotZin sempre online para te ajudar!`);
    }

    if (message === '!tesla') {
        const imagePath = path.join('C:', 'Users', 'Guilherme', 'Desktop', 'Documentos', 'Python', 'figurinhas', 'Nikola.jpg');
        const image = MessageMedia.fromFilePath(imagePath);
        return client.sendMessage(msg.from, image, {
            sendMediaAsSticker: true,
            stickerAuthor: 'RyusakiBot',
            stickerName: 'Nikola'
        });
    }

    if (message === '!g') {
        let mediaMessage = msg;

        if (msg.hasQuotedMsg) {
            const quoted = await msg.getQuotedMessage();
            if (quoted.hasMedia) {
                mediaMessage = quoted;
            }
        }

        if (mediaMessage.hasMedia) {
            const media = await mediaMessage.downloadMedia();
            if (media) {
                await client.sendMessage(msg.from, media, {
                    sendMediaAsSticker: true,
                    stickerAuthor: 'RyusakiBot',
                    stickerName: 'Criado com !g'
                });
            } else {
                await client.sendMessage(msg.from, '⚠️ Não consegui baixar a imagem.');
            }
        } else {
            await client.sendMessage(msg.from, '❌ Envie ou responda uma imagem com o comando !g para criar a figurinha.');
        }
    }

    if (message === '!tagall') {
        const mentions = chat.participants.map(p => p.id._serialized);
        const texto = mentions.map(id => `@${id.split('@')[0]}`).join(' ');
        await chat.sendMessage(texto, { mentions });
    }

    if (message.startsWith('!add')) {
        if (!isBotAdmin) {
            return client.sendMessage(msg.from, '❌ Eu preciso ser admin pra adicionar alguém.');
        }

        const parts = message.split(' ');
        if (parts.length === 2) {
            const number = parts[1].replace(/\D/g, '');
            const userId = `${number}@c.us`;
            try {
                await chat.addParticipants([userId]);
                await client.sendMessage(msg.from, `✅ Adicionado: @${number}`, {
                    mentions: [userId]
                });
            } catch (e) {
                await client.sendMessage(msg.from, '❌ Erro ao adicionar. O número pode estar incorreto ou bloqueou o grupo.');
            }
        } else {
            client.sendMessage(msg.from, '❗ Use: `!add 5511999999999`');
        }
    }

    try {
        if (message.startsWith('!musica')) {
            await baixarMusica(msg);
        } else if (message.startsWith('!video')) {
            await baixarVideo(msg);
        }
    } catch (err) {
        console.error('Erro ao processar a mensagem:', err);
        try {
            await client.sendMessage(msg.from, '❌ Ocorreu um erro ao processar sua solicitação.');
        } catch (e) {
            console.error('Erro ao enviar mensagem de erro:', e);
        }
    }
});

client.initialize();

async function baixarMusica(msg) {
    const termo = msg.body.replace('!musica', '').trim();
    if (!termo) return client.sendMessage(msg.from, '❗ Envie o nome ou link da música.');

    let url = termo;
    let videoInfo = null;

    if (!termo.startsWith('http')) {
        const resultados = await ytSearch(termo);
        const video = resultados.videos[0];
        if (!video) return client.sendMessage(msg.from, '❌ Nenhum resultado encontrado.');
        url = video.url;
        videoInfo = video;
    } else {
        const resultados = await ytSearch(url);
        videoInfo = resultados.videos.find(v => v.url === url) || resultados.videos[0];
    }

    if (videoInfo) {
        const mensagemInfo = `📄 *Informações da música:*\n\n` +
            `🎶 *Título:* ${videoInfo.title}\n` +
            `👤 *Autor:* ${videoInfo.author.name}\n` +
            `⏱️ *Duração:* ${videoInfo.timestamp}\n` +
            `🔗 *URL:* ${videoInfo.url}`;

        await client.sendMessage(msg.from, mensagemInfo);
    }

    await client.sendMessage(msg.from, `🎵 Baixando música...`);

    const id = Date.now();
    const output = path.join(TEMP_FOLDER, `${id}-audio.%(ext)s`);

    const comando = `yt-dlp --cookies-from-browser firefox -x --audio-format mp3 --ffmpeg-location "${ffmpegPath}" -o "${output}" "${url}"`;

    exec(comando, { timeout: 120000, shell: true }, async (error, stdout, stderr) => {
        if (error) {
            console.error(stderr || error);
            return client.sendMessage(msg.from, '❌ Erro ao baixar a música. Talvez o vídeo exija login ou seja restrito por idade.');
        }

        const arquivo = encontrarArquivo(`${id}-audio`);
        if (!arquivo || !fs.existsSync(arquivo)) {
            return client.sendMessage(msg.from, '❌ Arquivo não encontrado.');
        }

        const media = MessageMedia.fromFilePath(arquivo);

        try {
            await client.sendMessage(msg.from, media);
        } catch (err) {
            console.error('Erro ao enviar áudio:', err);
            await client.sendMessage(msg.from, '❌ Erro ao enviar a música.');
        }

        fs.unlinkSync(arquivo);
    });
}

async function baixarVideo(msg) {
    const query = msg.body.replace('!video', '').trim();
    const isUrl = query.startsWith('http');
    let videoUrl = query;
    let info = null;

    if (!isUrl) {
        const search = await ytSearch(query);
        if (!search.videos.length) {
            await msg.reply('❌ Vídeo não encontrado.');
            return;
        }

        const video = search.videos[0];
        videoUrl = video.url;
        info = {
            title: video.title,
            author: video.author.name,
            duration: video.timestamp,
            url: video.url,
            thumbnail: video.thumbnail
        };
    }

    if (info) {
        const infoMsg =
`📄 Informações do vídeo:
🎵 Título: ${info.title}
👤 Autor: ${info.author}
⏱️ Duração: ${info.duration}
🔗 URL: ${info.url}`;
        await msg.reply(infoMsg);
    }

    const outputFile = path.join(TEMP_FOLDER, `video_${Date.now()}.mp4`);
    const comando = `yt-dlp --cookies-from-browser firefox -f mp4 -o "${outputFile}" "${videoUrl}"`;

    exec(comando, { timeout: 180000, shell: true }, async (error, stdout, stderr) => {
        if (error) {
            console.error(stderr || error);
            return msg.reply('❌ Erro ao baixar vídeo. Talvez exija login ou seja restrito.');
        }

        const media = MessageMedia.fromFilePath(outputFile);
        const mimeType = mime.lookup(outputFile) || 'video/mp4';

        await client.sendMessage(msg.from, media, {
            sendMediaAsDocument: true,
            mimetype: mimeType,
            filename: path.basename(outputFile)
        });

        console.log('✅ Vídeo enviado como documento com sucesso!');
        fs.unlinkSync(outputFile);
    });
}

function encontrarArquivo(prefixo) {
    const arquivos = fs.readdirSync(TEMP_FOLDER);
    const encontrado = arquivos.find(file => file.startsWith(prefixo));
    return encontrado ? path.join(TEMP_FOLDER, encontrado) : null;
}
