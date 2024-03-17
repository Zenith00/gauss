const myWorker = new Worker("/workers/mathWorker.js");

import Fraction from '../app/lib/bigfraction/bigfraction.js';




myWorker.postMessage(damageArgs);

myWorker.onmessage = (e) => {
    const damageResult = e.data;
    console.log({ damageResult })
    let table = "<p>Raw Damage</p><table><tr><th>Damage</th><th>Chance</th><th>At Least</th><th>At Most</th></tr>";
    let atLeast = new Fraction(1);
    let atMost = new Fraction(0);
    [...damageResult.regularDamagePMF.entries()].forEach(([damage, prob]) => {
        table += `<tr><td>${damage}</td><td>${prob}</td><td>${atLeast}</td><td>${atMost}</td></tr>`;
        atLeast = atLeast.sub(prob);
        atMost = atMost.add(prob);
    });
    table += "</table>";
    document.getElementById("table").replaceWith(table)
}

