import Fraction from "fraction.js/bigfraction";

// eslint-disable-next-line import/extensions
import { DiceRoller } from "~/lib/dice-roller-parser";



const averageDiceRoller = new DiceRoller({ alwaysAverage: true });
const critDiceRoller = new DiceRoller({ alwaysCrit: true });
const regularDiceRoller = new DiceRoller();
export const ZERO = new Fraction(0);
export const ONE = new Fraction(1);
export const NINE_FIVE = new Fraction(19, 20);
export const OH_FIVE = new Fraction(1, 20);
export type PMF = Map<number, Fraction>;

export interface Die {
    sides: number;
}
export interface FlatMod {
    number: number;
}

export interface DamageFeatures {
    greatWeaponFighting: boolean,
    elementalAdept: boolean,
}

export const zero_pmf = () => new Map([[0, ONE]]) as PMF;
export const clean_zeros = (pmf: PMF): PMF =>
    new Map([...pmf.entries()].filter(([_, v]) => !v.equals(ZERO)));
export const clean_jpm = (map: Map<string, PMF>) =>
    new Map([...map.entries()].filter(([_, v]) => v.size !== 0));
export interface globalValues {
    damage: string;
    attack: string;
}


export const weighted_mean_pmf = (pmf: PMF) =>
    [...pmf.entries()].reduce(
        (acc, [d, p]) => acc.add(new Fraction(d).mul(p)),
        ZERO
    );

export const dieMean = (die: Die) => (die.sides / 2) + 0.5;

export interface damagerFormValue {
    label: string;
    attack: string;
    attackCount: number;
    damage: string;
    key: string;
    advantage: string;
    damageOnFirstHit: string;
    damageOnMiss: string;
    critFailFaceCount: number;
    critFaceCount: number;
    gwmSS: boolean;
}

interface Flavoring<FlavorT> {
    _type?: FlavorT;
}

export type Flavor<T, FlavorT> = T & Flavoring<FlavorT>;



export type AC = Flavor<number, "AC">;
export type DC = Flavor<number, "DC">;

export enum ADVANTAGE {
    DISADVANTAGE = -1,
    NONE = 0,
    ADVANTAGE = 1,
    SUPERADVANTAGE = 2,
};
export interface HitMods {
    advantage: ADVANTAGE,
    lucky: boolean,
}


export type Prob = Flavor<number, "Prob">;
export interface DamageMetadata {
    damagePMFByAC: null;
    averageDamageByAC: Map<AC, number>;
    label: string;
}

// eslint-disable-next-line import/prefer-default-export
export const getEmptyDamager = (
    damagers: damagerFormValue[],
): damagerFormValue => ({
    label: "Example Attack",
    attack: "",
    damage: "1d6",
    damageOnFirstHit: "",
    damageOnMiss: "",
    attackCount: 1,
    key: (Math.max(...damagers.map((d) => Number(d.key)), -1) + 1).toString(),
    critFaceCount: 1,
    critFailFaceCount: 1,
    advantage: "0",
    gwmSS: false,
});

export interface DamageInfo {
    damage: string[];
    damageOnFirstHit: string;
    damageOnMiss: string;
    attack: string[];
    attackCount: number;
    critFaceCount: number;
    critFailFaceCount?: number;
    key?: string;
    label?: string;
    damageFeatures: DamageFeatures;
    hitMods: HitMods;
}
export const numberRange = (start: number, end: number): number[] =>
    new Array(end - start).fill(undefined).map((d, i) => i + start);

export const ACs = numberRange(1, 30 + 1) as AC[];
export interface DamagerFormulae {
    damage: Die[];
    attack: Die[];
}

export interface DamageResult {
    averageDamage: Fraction;
    hitProbMapByAC: Map<AC, PMF>;
    regularDamagePMF: PMF;
}
// eslint-disable-next-line import/prefer-default-export
export const computeDamageInfo = (damageInfo: DamageInfo) => damageInfo;




export interface WeightedPMFs {
    pmf: PMF;
    chance: Fraction;
    name?: string;
}
export const diceToPMF = (dice: Die): PMF => new Map(numberRange(1, dice.sides + 1).map((v) => [v, new Fraction(1, dice.sides)]));
export const flatModToPMF = (flatMod: FlatMod): PMF => new Map([[flatMod.number, ONE]]);
export const counterify = <T extends string | number | symbol>(arr: T[]) => arr.reduce((acc: Record<T, number>, curr: T) => (acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc), {} as Record<T, number>);
export const counterToPMF = <T extends string | number | symbol>(counter: Record<T, number>) => {
    const totalCount = Object.values<number>(counter).reduce((acc, n) => acc + n, 0);
    return new Map((Object.entries<number>(counter).map(([k, v]) => [Number(k), new Fraction(v).div(totalCount)])));
};
export const removePmfZeroes = (pmf: PMF): PMF =>
    new Map([...pmf.entries()].filter(([_, v]) => !v.equals(ZERO)));


export const convolvePMFs = (pmfX_: PMF, pmfY_: PMF, add: boolean) => {
    const pmfX = new Map([...pmfX_.entries()].sort());
    const pmfY = new Map([...pmfY_.entries()].sort());

    const absMin =
        Math.min(...pmfX.keys(), ...pmfY.keys()) -
        (add ? 0 : Math.max(...pmfY.keys()));

    const absMax = Math.max(...pmfX.keys()) + Math.max(...pmfY.keys());

    const R = numberRange(absMin, absMax + 1);

    const jointProbMap = clean_jpm(
        new Map(
            R.map((valX) => [
                valX.toString(),
                removePmfZeroes(
                    new Map(
                        R.map((valY) => [
                            valY,
                            (pmfX.get(valX) ?? ZERO).mul(pmfY.get(valY) ?? ZERO),
                        ])
                    )
                ),
            ])
        )
    );

    const pmf: PMF = new Map();

    [...jointProbMap.entries()].forEach(([x, xPMF]) => {
        [...xPMF.entries()].forEach(([y, prob]) => {
            const k = add ? Number(x) + Number(y) : Number(x) - Number(y);
            pmf.set(k, (pmf.get(k) ?? ZERO).add(prob));
        });
    });

    return pmf;
};


export const addPMFs = (pmfs: PMF[]) => pmfs.reduce((acc, curr) => convolvePMFs(acc, curr, true), zero_pmf());

export interface AttackBonuses {
    dice: Die[];
}




export const getAttackRollPMF = (fullAttackRoll: string): PMF => {
    if (/^[\dd+]+$/.test(fullAttackRoll)) {
        const dicePMFs = fullAttackRoll
            .split("+")
            .flatMap((diceString) => {
                const match = diceString.match(/^(?<count>\d*)((?<dice>d)(?<sides>\d+))?$/i);
                if (!match?.groups) {
                    return [];
                }
                const { dice, sides, count } = match.groups;
                if (dice === "d" && sides) {
                    return numberRange(0, Number(count ?? 1)).map(() => ({ sides: Number(sides?.trim()) } as Die)).map(diceToPMF);
                }
                return flatModToPMF({ number: Number(count) });

            });

        return addPMFs(dicePMFs);
    }
    const N = 10000;
    return new Map(
        Object.entries(
            [...Array(N)]
                .map((_) => regularDiceRoller.roll(fullAttackRoll).value)
                .reduce(
                    (acc, curr) => (acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc),
                    {} as Record<number, number>,
                ),
        ).map(([k, v]) => [Number(k), new Fraction(v).div(N)]),
    );

};


export const getDamagePMFForDie = (die: Die, { greatWeaponFighting, elementalAdept }: DamageFeatures): PMF => {
    const regDiceVals = numberRange(1, die.sides + 1);
    const eaDiceVals = regDiceVals.map((v) => Math.max(2, v));

    const diceValues = elementalAdept ? eaDiceVals : regDiceVals;

    if (greatWeaponFighting) {
        return counterToPMF(counterify(regDiceVals.map((v) => v <= 2 ? diceValues : numberRange(0, diceValues.length).map((_) => v)).flat()));
    } return counterToPMF(counterify(diceValues));
};



export const getDamageRollPMF = (fullDamageRoll: string, weaponDamage: boolean, damageFeatures: DamageFeatures, crit: boolean): PMF => {
    if (/^[\dd+]+$/.test(fullDamageRoll)) {
        const dicePMFs = fullDamageRoll
            .split("+")
            .flatMap((diceString) => {
                const match = diceString.match(/^(?<count>\d*)((?<dice>d)(?<sides>\d+))?$/i);
                if (!match?.groups) {
                    return [];
                }
                const { dice, sides, count } = match.groups;
                if (dice === "d" && sides) {
                    return numberRange(0, Number(count ?? 1)).map(() => ({ sides: Number(sides?.trim()) } as Die)).map((d) => {
                        if (weaponDamage) {
                            if (crit) {
                                return [getDamagePMFForDie(d, damageFeatures), getDamagePMFForDie(d, damageFeatures)];
                            }
                            return getDamagePMFForDie(d, damageFeatures);
                        }
                        return diceToPMF(d);

                    });
                }
                return flatModToPMF({ number: Number(count) });

            }).flat();

        return addPMFs(dicePMFs);
    }
    const N = 10000;
    return new Map(
        Object.entries(counterify(
            [...Array(N)]
                .map((_) => regularDiceRoller.roll(fullDamageRoll).value))

        ).map(([k, v]) => [Number(k), new Fraction(v).div(N)]),
    );

};


export const jointProbPMFs = (jpm_pmfs: {
    pmf: PMF;
    chance: Fraction;
    name?: string;
}[]) => {
    const pmf = new Map<number, Fraction>() as PMF;
    const keySet = new Set<number>([
        ...jpm_pmfs.map((jp) => [...jp.pmf.keys()]).flat(2),
    ]);

    [...keySet].forEach((k) =>
        pmf.set(
            k,
            jpm_pmfs.reduce(
                (acc, n) => acc.add((n.pmf.get(k) || ZERO).mul(n.chance)),
                ZERO
            )
        )
    );
    return pmf;
};


export const printPMF = (pmf: PMF, name = "") => {
    // eslint-disable-next-line no-console
    console.log(`${name}`);
    console.log(
        new Map(
            [...pmf.entries()]
                .sort(([kl, _vl], [kr, _vr]) => kl - kr)
                .map(([k, v]) => [k, new Fraction(v).valueOf().toFixed(6)])
        )
    );
    console.log(
        `${name}: SUM: ${[...pmf.values()].reduce((acc, n) => acc.add(n), ZERO).toString()}`
    );
};


export const printPMFRepr = (pmf: PMF) => {
    console.log(`,\nexpected: new Map([\n${[...pmf.entries()].sort(([k1, _v1], [k2, _v2]) => k1 - k2).map(([k, v]) => `[${k}, new Fraction(${v.n},${v.d})]`).join(",\n")}\n])`);
};




const pSave = (bonus: number, dc: AC): Prob => Math.min(1, Math.max(0, (21 - dc + bonus) / 20));

const pLucky = ({ p, hitMods }: { p: Fraction, hitMods: HitMods }) => {
    if (hitMods.lucky) {
        switch (hitMods.advantage) {
            case ADVANTAGE.SUPERADVANTAGE:
                return ((p.pow(2).mul(1200)).sub((p.mul(2340))).add(1141)).mul(p).div(8000);
            case ADVANTAGE.ADVANTAGE:
                return new Fraction(39, 400).mul(p).sub(p.pow(2).div(10));
            case ADVANTAGE.DISADVANTAGE:
                return p.pow(2).div(10);
            case ADVANTAGE.NONE:
                return p.div(20);
            // no default
        }
    }
    return ZERO;
};

const pHitBase = ({ p, hitMods }: { p: Fraction; hitMods: HitMods }) => {
    if (hitMods.advantage > 0) {
        return ONE.sub(ONE.sub(p).pow(hitMods.advantage + 1));
    } if (hitMods.advantage < 0) {
        return p.pow(Math.abs(hitMods.advantage) + 1);
    }
    return p;

};


export const factorHitMods = ({ pRaw, hitMods }: { pRaw: Fraction, hitMods: HitMods }) => pHitBase({ p: pRaw, hitMods }).add(pLucky({ p: pRaw, hitMods }));


const pHit = ({ bonus, ac, hitMods }: { bonus: number; ac: AC; hitMods: HitMods }) => {
    const pRaw = Math.min(0.95, Math.max(0.05, (21 - ac + bonus) / 20));
    return factorHitMods({ pRaw: new Fraction(pRaw), hitMods });
};




export const computeHitProbability = (fullAttackRoll: string, ac: AC, hitMods: HitMods) => {
    const attackRollPMF = getAttackRollPMF(fullAttackRoll);
    const fullPhit = [...attackRollPMF.entries()].map(([attackBonus, likelihood]) => likelihood.mul(pHit({ bonus: Number(attackBonus), ac, hitMods }))).reduce((a, b) => a.add(b), ZERO);
    return fullPhit;
};


export const computeHitMap = ({
    hitProbByAC,
    regularDamagePMF,
    critDamagePMF,
    missDamagePMF,
    damageInfo,
}: {
    hitProbByAC: Map<AC, Fraction>;
    regularDamagePMF: PMF;
    critDamagePMF: PMF;
    missDamagePMF: PMF;
    damageInfo: DamageInfo;
}) =>
    new Map(
        ACs.map((ac) => {
            const hitProb = hitProbByAC.get(ac)!;
            const critProb = pHit({
                bonus: 0,
                ac: 21 - damageInfo.critFaceCount,
                hitMods: damageInfo.hitMods,
            });
            const jpms = [
                { pmf: regularDamagePMF, chance: hitProb.sub(critProb) },
                { pmf: critDamagePMF, chance: critProb },
                { pmf: missDamagePMF, chance: ONE.sub(hitProb) },
            ];
            const singleDamage = jointProbPMFs(jpms);
            const output = addPMFs(numberRange(0, damageInfo.attackCount).map(_ => singleDamage))
            return [ac, output];
        }),
    );

export const getAverageDamage = (damagePMFByAC: Map<AC, PMF>, ac: AC) => {
    const pmf = damagePMFByAC.get(ac)!;
    return weighted_mean_pmf(pmf);
}

export const computeDamageResult = (damageInfo: DamageInfo): DamageResult => {
    const fullAttackRoll = damageInfo.attack.join("+");
    const hitProbByAC = new Map(ACs.map((ac) => [ac, computeHitProbability(fullAttackRoll, ac, damageInfo.hitMods)]));
    const regularDamagePMF = getDamageRollPMF(damageInfo.damage.join("+"), true, damageInfo.damageFeatures, false);
    const critDamagePMF = getDamageRollPMF(damageInfo.damage.join("+"), true, damageInfo.damageFeatures, true);
    const missDamagePMF = zero_pmf();

    return {
        hitProbMapByAC: computeHitMap({ hitProbByAC, regularDamagePMF, critDamagePMF, missDamagePMF, damageInfo }),
        averageDamage: weighted_mean_pmf(regularDamagePMF).mul(damageInfo.attackCount),
        regularDamagePMF,
    };
};



globalThis.onmessage = (e: MessageEvent<DamageInfo>) => {
    const damageInfo = e.data;
    const damageResult = computeDamageResult(damageInfo);
    globalThis.postMessage(damageResult);
};

