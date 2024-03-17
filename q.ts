import express from "express";
import * as MW from "app/modules/damage/mathWorker.js";
import { getAverageDamage } from "app/modules/damage/mathWorker.js";
const app = express();
const PORT = 10022;

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
    body_extra = "",
}: {
    title?: string;
    og_type?: string;
    url?: string;
    image_url?: string;
    image_size?: [number, number];
    description?: string;
    audio_url?: string;
    video_url?: string;
    body_extra?: string;
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
        body += `<p>${description.replaceAll("\n", "<br>")}</p>\n`;
        body += `<p>${body_extra.replaceAll("\n", "<br>")}</p>\n`;
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
    const ac = req.query.ac?.toString() ?? "10";
    const dmg = req.query.dmg?.toString();
    const count = req.query.count?.toString();
    const hitbonus = req.query.hitbonus?.toString();
    const critFaces = req.query.critFaces?.toString();
    const gwf = req.query.gwf?.toString();

    const adv = req.query.adv?.toString();
    if (!dmg) {
        res.status(400).send("ac and dmg are required");
        return;
    }

    const damageArgs = {
        damage: [dmg],
        damageOnFirstHit: "",
        damageOnMiss: "",
        attack: hitbonus ? [hitbonus] : ["0"],
        attackCount: count ? parseInt(count) : 1,
        critFaceCount: critFaces ? parseInt(critFaces) : 1,
        damageFeatures: {
            greatWeaponFighting: !!gwf,
            elementalAdept: false,
        },
        hitMods: {
            advantage: adv ? parseInt(adv) : 0,
            lucky: false,
        },
    }

    console.log(JSON.stringify(damageArgs, null, 2))
    const damageResult = MW.computeDamageResult(damageArgs);
    let table = "<table><tr><th>Damage</th><th>Chance</th><th>At Least</th><th>At Most</th></tr>";
    let atLeast = MW.ONE;
    let atMost = MW.ZERO;
    [...damageResult.regularDamagePMF.entries()].forEach(([damage, prob]) => {
        table += `<tr><td>${damage}</td><td>${prob}</td><td>${atLeast}</td><td>${atMost}</td></tr>`;
        atLeast = atLeast.sub(prob);
        atMost = atMost.add(prob);
    });

    table += "</table>";

    res.send(
        await gen_embed({
            description: `<b>AC:</b> ${ac}\n<b>Raw Damage:</b>  ${dmg}\n<b>Hit Bonus:</b>  ${hitbonus || 0}\n<b>Average Base Damage:</b>  ${damageResult.averageDamage
                }\nAverage Damage Against AC: ${getAverageDamage(
                    damageResult.hitProbMapByAC,
                    parseInt(ac),
                ).round(2)}`,
            body_extra: table,
        }),
    );
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
