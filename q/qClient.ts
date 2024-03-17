const myWorker = new Worker("/workers/mathWorker.js");

import type { DamageResult } from '~/modules/damage/mathWorker.js';
import Fraction from '../app/lib/bigfraction/bigfraction.js';




myWorker.postMessage(damageArgs);

myWorker.onmessage = (e) => {
    const damageResult: DamageResult = e.data;
    console.log({ damageResult })
    let table = "<p>Raw Damage</p><table><tr><th>Damage</th><th>Chance</th><th>At Least</th><th>At Most</th></tr>";
    let atLeast = new Fraction(1);
    let atMost = new Fraction(0);
    [...damageResult.regularDamagePMF.entries()].forEach(([damage, prob]) => {
        table += `<tr><td>${damage}</td><td>${prob.toString(100)}</td><td>${atLeast.toString(100)}</td><td>${atMost.toString(100)}</td></tr > `;
        atLeast = atLeast.sub(prob);
        atMost = atMost.add(prob);
    });
    table += "</table>";
    document.getElementById("rawDamageContainer")!.innerHTML = table;
}

