import express from "express";
import * as MW from "app/modules/damage/mathWorker.js";
import { getAverageDamage } from "app/modules/damage/mathWorker.js";
const app = express();
const PORT = 10025;

// async def gen_embed(
//     title: str = "zeax",
//     og_type: str = "zeax:default",
//     url: str = "http://x.ze.ax",
//     image_url: str = None,
//     image_size: ty.Optional[ty.Tuple[int, int]] = None,
//     description: str = "",
//     audio_url: str = None,
//     video_url: str = None
// ) -> web.Response:
//  head = f"<head>"
//  body = f"<body>"
//  if description and len(description) > 200:
//     async with clientSession.post("https://h.ze.ax/documents", data=description) as resp:
//        description = (await resp.json(content_type=None))["key"]

//  head += (f"<meta property='og:title' content='{title}' />\n"
//           f"<meta property='og:type' content='{og_type}' />\n"
//           f"<meta property='og:url' content='{url}' />\n")
//  if image_url:
//     head += (f"<meta property='og:image:type' content='image/jpeg'/>\n"
//              f"<meta property='og:image' content='{image_url}' />\n"
//              f"<meta property='twitter:image' content='{image_url}' />\n"
//              f"<meta property='twitter:card' content='summary_large_image'>")
//     body += f"<img src='{image_url}'/>"
//     if image_size:
//        head += (f"<meta property='og:image:width' content='{image_size[0]}'/>\n"
//                 f"<meta property='og:image:height' content='{image_size[1]}' />\n")
//  if description:
//     head += f"<meta property='og:description' content='{description}' />\n"
//  if audio_url:
//     head += f"<meta property='og:audio' content='{audio_url}' />\n"
//  if video_url:
//     head += f"<meta property='og:video' content='{video_url}' />\n"
//  head += "</head>"
//  body += "</body>"
//  return web.Response(text=head + body, content_type="text/html")

const gen_embed = async ({
    title = "q",
    og_type = "q:default",
    url = "http://q.cephalon.xyz",
    image_url,
    image_size,
    description = "",
    audio_url,
    video_url,
}: {
    title?: string;
    og_type?: string;
    url?: string;
    image_url?: string;
    image_size?: [number, number];
    description?: string;
    audio_url?: string;
    video_url?: string;
} = {}) => {
    let head = "<head>";
    let body = "<body>";

    head += `<meta property='og:title' content='${title}' />\n`;
    head += `<meta property='og:type' content='${og_type}' />\n`;
    head += `<meta property='og:url' content='${url}' />\n`;
    if (image_url) {
        head += `<meta property='og:image:type' content='image/jpeg'/>\n`;
        head += `<meta property='og:image' content='${image_url}' />\n`;
        head += `<meta property='twitter:image' content='${image_url}' />\n`;
        head += `<meta property='twitter:card' content='summary_large_image'>`;
        body += `<img src='${image_url}'/>`;
        if (image_size) {
            head += `<meta property='og:image:width' content='${image_size[0]}'/>\n`;
            head += `<meta property='og:image:height' content='${image_size[1]}' />\n`;
        }
    }
    if (description) {
        head += `<meta property='og:description' content='${description}' />\n`;
    }
    if (audio_url) {
        head += `<meta property='og:audio' content='${audio_url}' />\n`;
    }
    if (video_url) {
        head += `<meta property='og:video' content='${video_url}' />\n`;
    }
    head += "</head>";
    body += "</body>";
    return head + body;
};

app.get("/dmg", async (req, res) => {
    const ac = req.query.ac?.toString();
    const dmg = req.query.dmg?.toString();
    const hitbonus = req.query.hitbonus?.toString();

    const adv = req.query.adv?.toString();
    if (!ac || !dmg) {
        res.status(400).send("ac and dmg are required");
        return;
    }
    const damageResult = MW.computeDamageResult({
        damage: [dmg],
        damageOnFirstHit: "",
        damageOnMiss: "",
        attack: hitbonus ? [hitbonus] : [],
        attackCount: 1,
        critFaceCount: 0,
        damageFeatures: {
            greatWeaponFighting: false,
            elementalAdept: false,
        },
        hitMods: {
            advantage: adv ? parseInt(adv) : 0,
            lucky: false,
        },
    });
    res.send(
        await gen_embed({
            description: `ac: ${ac}\ndmg:${dmg}\nhitbonus:${hitbonus}\ndmg:${damageResult.averageDamage
                }\ndmg against ac: ${getAverageDamage(
                    damageResult.hitProbMapByAC,
                    parseInt(ac),
                )}`,
        }),
    );
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
