"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // app/lib/bigfraction/bigfraction.js
  var require_bigfraction = __commonJS({
    "app/lib/bigfraction/bigfraction.js"(exports, module) {
      "use strict";
      (function(root) {
        "use strict";
        if (typeof BigInt === "undefined")
          BigInt = function(n) {
            if (isNaN(n))
              throw new Error("");
            return n;
          };
        const C_ONE = BigInt(1);
        const C_ZERO = BigInt(0);
        const C_TEN = BigInt(10);
        const C_TWO = BigInt(2);
        const C_FIVE = BigInt(5);
        const MAX_CYCLE_LEN = 2e3;
        const P = {
          "s": C_ONE,
          "n": C_ZERO,
          "d": C_ONE
        };
        function assign(n, s) {
          try {
            n = BigInt(n);
          } catch (e) {
            throw InvalidParameter();
          }
          return n * s;
        }
        function newFraction(n, d) {
          if (d === C_ZERO) {
            throw DivisionByZero();
          }
          const f = Object.create(Fraction2.prototype);
          f["s"] = n < C_ZERO ? -C_ONE : C_ONE;
          n = n < C_ZERO ? -n : n;
          const a = gcd(n, d);
          f["n"] = n / a;
          f["d"] = d / a;
          return f;
        }
        function factorize(num) {
          const factors = {};
          let n = num;
          let i = C_TWO;
          let s = C_FIVE - C_ONE;
          while (s <= n) {
            while (n % i === C_ZERO) {
              n /= i;
              factors[i] = (factors[i] || C_ZERO) + C_ONE;
            }
            s += C_ONE + C_TWO * i++;
          }
          if (n !== num) {
            if (n > 1)
              factors[n] = (factors[n] || C_ZERO) + C_ONE;
          } else {
            factors[num] = (factors[num] || C_ZERO) + C_ONE;
          }
          return factors;
        }
        const parse2 = function(p1, p2) {
          let n = C_ZERO, d = C_ONE, s = C_ONE;
          if (p1 === void 0 || p1 === null) {
          } else if (p2 !== void 0) {
            n = BigInt(p1);
            d = BigInt(p2);
            s = n * d;
            if (n % C_ONE !== C_ZERO || d % C_ONE !== C_ZERO) {
              throw NonIntegerParameter();
            }
          } else if (typeof p1 === "object") {
            if ("d" in p1 && "n" in p1) {
              n = BigInt(p1["n"]);
              d = BigInt(p1["d"]);
              if ("s" in p1)
                n *= BigInt(p1["s"]);
            } else if (0 in p1) {
              n = BigInt(p1[0]);
              if (1 in p1)
                d = BigInt(p1[1]);
            } else if (p1 instanceof BigInt) {
              n = BigInt(p1);
            } else {
              throw InvalidParameter();
            }
            s = n * d;
          } else if (typeof p1 === "bigint") {
            n = p1;
            s = p1;
            d = C_ONE;
          } else if (typeof p1 === "number") {
            if (isNaN(p1)) {
              throw InvalidParameter();
            }
            if (p1 < 0) {
              s = -C_ONE;
              p1 = -p1;
            }
            if (p1 % 1 === 0) {
              n = BigInt(p1);
            } else if (p1 > 0) {
              let z = 1;
              let A = 0, B = 1;
              let C = 1, D = 1;
              let N = 1e7;
              if (p1 >= 1) {
                z = 10 ** Math.floor(1 + Math.log10(p1));
                p1 /= z;
              }
              while (B <= N && D <= N) {
                let M = (A + C) / (B + D);
                if (p1 === M) {
                  if (B + D <= N) {
                    n = A + C;
                    d = B + D;
                  } else if (D > B) {
                    n = C;
                    d = D;
                  } else {
                    n = A;
                    d = B;
                  }
                  break;
                } else {
                  if (p1 > M) {
                    A += C;
                    B += D;
                  } else {
                    C += A;
                    D += B;
                  }
                  if (B > N) {
                    n = C;
                    d = D;
                  } else {
                    n = A;
                    d = B;
                  }
                }
              }
              n = BigInt(n) * BigInt(z);
              d = BigInt(d);
            }
          } else if (typeof p1 === "string") {
            let ndx = 0;
            let v = C_ZERO, w = C_ZERO, x = C_ZERO, y = C_ONE, z = C_ONE;
            let match = p1.match(/\d+|./g);
            if (match === null)
              throw InvalidParameter();
            if (match[ndx] === "-") {
              s = -C_ONE;
              ndx++;
            } else if (match[ndx] === "+") {
              ndx++;
            }
            if (match.length === ndx + 1) {
              w = assign(match[ndx++], s);
            } else if (match[ndx + 1] === "." || match[ndx] === ".") {
              if (match[ndx] !== ".") {
                v = assign(match[ndx++], s);
              }
              ndx++;
              if (ndx + 1 === match.length || match[ndx + 1] === "(" && match[ndx + 3] === ")" || match[ndx + 1] === "'" && match[ndx + 3] === "'") {
                w = assign(match[ndx], s);
                y = C_TEN ** BigInt(match[ndx].length);
                ndx++;
              }
              if (match[ndx] === "(" && match[ndx + 2] === ")" || match[ndx] === "'" && match[ndx + 2] === "'") {
                x = assign(match[ndx + 1], s);
                z = C_TEN ** BigInt(match[ndx + 1].length) - C_ONE;
                ndx += 3;
              }
            } else if (match[ndx + 1] === "/" || match[ndx + 1] === ":") {
              w = assign(match[ndx], s);
              y = assign(match[ndx + 2], C_ONE);
              ndx += 3;
            } else if (match[ndx + 3] === "/" && match[ndx + 1] === " ") {
              v = assign(match[ndx], s);
              w = assign(match[ndx + 2], s);
              y = assign(match[ndx + 4], C_ONE);
              ndx += 5;
            }
            if (match.length <= ndx) {
              d = y * z;
              s = /* void */
              n = x + d * v + z * w;
            } else {
              throw InvalidParameter();
            }
          } else {
            throw InvalidParameter();
          }
          if (d === C_ZERO) {
            throw DivisionByZero();
          }
          P["s"] = s < C_ZERO ? -C_ONE : C_ONE;
          P["n"] = n < C_ZERO ? -n : n;
          P["d"] = d < C_ZERO ? -d : d;
        };
        function modpow(b, e, m) {
          let r = C_ONE;
          for (; e > C_ZERO; b = b * b % m, e >>= C_ONE) {
            if (e & C_ONE) {
              r = r * b % m;
            }
          }
          return r;
        }
        function cycleLen(n, d) {
          for (; d % C_TWO === C_ZERO; d /= C_TWO) {
          }
          for (; d % C_FIVE === C_ZERO; d /= C_FIVE) {
          }
          if (d === C_ONE)
            return C_ZERO;
          let rem = C_TEN % d;
          let t = 1;
          for (; rem !== C_ONE; t++) {
            rem = rem * C_TEN % d;
            if (t > MAX_CYCLE_LEN)
              return C_ZERO;
          }
          return BigInt(t);
        }
        function cycleStart(n, d, len) {
          let rem1 = C_ONE;
          let rem2 = modpow(C_TEN, len, d);
          for (let t = 0; t < 300; t++) {
            if (rem1 === rem2)
              return BigInt(t);
            rem1 = rem1 * C_TEN % d;
            rem2 = rem2 * C_TEN % d;
          }
          return 0;
        }
        function gcd(a, b) {
          if (!a)
            return b;
          if (!b)
            return a;
          while (1) {
            a %= b;
            if (!a)
              return b;
            b %= a;
            if (!b)
              return a;
          }
        }
        function Fraction2(a, b) {
          parse2(a, b);
          if (this instanceof Fraction2) {
            a = gcd(P["d"], P["n"]);
            this["s"] = P["s"];
            this["n"] = P["n"] / a;
            this["d"] = P["d"] / a;
          } else {
            return newFraction(P["s"] * P["n"], P["d"]);
          }
        }
        var DivisionByZero = function() {
          return new Error("Division by Zero");
        };
        var InvalidParameter = function() {
          return new Error("Invalid argument");
        };
        var NonIntegerParameter = function() {
          return new Error("Parameters must be integer");
        };
        Fraction2.prototype = {
          "s": C_ONE,
          "n": C_ZERO,
          "d": C_ONE,
          /**
           * Calculates the absolute value
           *
           * Ex: new Fraction(-4).abs() => 4
           **/
          "abs": function() {
            return newFraction(this["n"], this["d"]);
          },
          /**
           * Inverts the sign of the current fraction
           *
           * Ex: new Fraction(-4).neg() => 4
           **/
          "neg": function() {
            return newFraction(-this["s"] * this["n"], this["d"]);
          },
          /**
           * Adds two rational numbers
           *
           * Ex: new Fraction({n: 2, d: 3}).add("14.9") => 467 / 30
           **/
          "add": function(a, b) {
            parse2(a, b);
            return newFraction(
              this["s"] * this["n"] * P["d"] + P["s"] * this["d"] * P["n"],
              this["d"] * P["d"]
            );
          },
          /**
           * Subtracts two rational numbers
           *
           * Ex: new Fraction({n: 2, d: 3}).add("14.9") => -427 / 30
           **/
          "sub": function(a, b) {
            parse2(a, b);
            return newFraction(
              this["s"] * this["n"] * P["d"] - P["s"] * this["d"] * P["n"],
              this["d"] * P["d"]
            );
          },
          /**
           * Multiplies two rational numbers
           *
           * Ex: new Fraction("-17.(345)").mul(3) => 5776 / 111
           **/
          "mul": function(a, b) {
            parse2(a, b);
            return newFraction(
              this["s"] * P["s"] * this["n"] * P["n"],
              this["d"] * P["d"]
            );
          },
          /**
           * Divides two rational numbers
           *
           * Ex: new Fraction("-17.(345)").inverse().div(3)
           **/
          "div": function(a, b) {
            parse2(a, b);
            return newFraction(
              this["s"] * P["s"] * this["n"] * P["d"],
              this["d"] * P["n"]
            );
          },
          /**
           * Clones the actual object
           *
           * Ex: new Fraction("-17.(345)").clone()
           **/
          "clone": function() {
            return newFraction(this["s"] * this["n"], this["d"]);
          },
          /**
           * Calculates the modulo of two rational numbers - a more precise fmod
           *
           * Ex: new Fraction('4.(3)').mod([7, 8]) => (13/3) % (7/8) = (5/6)
           **/
          "mod": function(a, b) {
            if (a === void 0) {
              return newFraction(this["s"] * this["n"] % this["d"], C_ONE);
            }
            parse2(a, b);
            if (0 === P["n"] && 0 === this["d"]) {
              throw DivisionByZero();
            }
            return newFraction(
              this["s"] * (P["d"] * this["n"]) % (P["n"] * this["d"]),
              P["d"] * this["d"]
            );
          },
          /**
           * Calculates the fractional gcd of two rational numbers
           *
           * Ex: new Fraction(5,8).gcd(3,7) => 1/56
           */
          "gcd": function(a, b) {
            parse2(a, b);
            return newFraction(gcd(P["n"], this["n"]) * gcd(P["d"], this["d"]), P["d"] * this["d"]);
          },
          /**
           * Calculates the fractional lcm of two rational numbers
           *
           * Ex: new Fraction(5,8).lcm(3,7) => 15
           */
          "lcm": function(a, b) {
            parse2(a, b);
            if (P["n"] === C_ZERO && this["n"] === C_ZERO) {
              return newFraction(C_ZERO, C_ONE);
            }
            return newFraction(P["n"] * this["n"], gcd(P["n"], this["n"]) * gcd(P["d"], this["d"]));
          },
          /**
           * Gets the inverse of the fraction, means numerator and denominator are exchanged
           *
           * Ex: new Fraction([-3, 4]).inverse() => -4 / 3
           **/
          "inverse": function() {
            return newFraction(this["s"] * this["d"], this["n"]);
          },
          /**
           * Calculates the fraction to some integer exponent
           *
           * Ex: new Fraction(-1,2).pow(-3) => -8
           */
          "pow": function(a, b) {
            parse2(a, b);
            if (P["d"] === C_ONE) {
              if (P["s"] < C_ZERO) {
                return newFraction((this["s"] * this["d"]) ** P["n"], this["n"] ** P["n"]);
              } else {
                return newFraction((this["s"] * this["n"]) ** P["n"], this["d"] ** P["n"]);
              }
            }
            if (this["s"] < C_ZERO)
              return null;
            let N = factorize(this["n"]);
            let D = factorize(this["d"]);
            let n = C_ONE;
            let d = C_ONE;
            for (let k in N) {
              if (k === "1")
                continue;
              if (k === "0") {
                n = C_ZERO;
                break;
              }
              N[k] *= P["n"];
              if (N[k] % P["d"] === C_ZERO) {
                N[k] /= P["d"];
              } else
                return null;
              n *= BigInt(k) ** N[k];
            }
            for (let k in D) {
              if (k === "1")
                continue;
              D[k] *= P["n"];
              if (D[k] % P["d"] === C_ZERO) {
                D[k] /= P["d"];
              } else
                return null;
              d *= BigInt(k) ** D[k];
            }
            if (P["s"] < C_ZERO) {
              return newFraction(d, n);
            }
            return newFraction(n, d);
          },
          /**
           * Check if two rational numbers are the same
           *
           * Ex: new Fraction(19.6).equals([98, 5]);
           **/
          "equals": function(a, b) {
            parse2(a, b);
            return this["s"] * this["n"] * P["d"] === P["s"] * P["n"] * this["d"];
          },
          /**
           * Check if two rational numbers are the same
           *
           * Ex: new Fraction(19.6).equals([98, 5]);
           **/
          "compare": function(a, b) {
            parse2(a, b);
            let t = this["s"] * this["n"] * P["d"] - P["s"] * P["n"] * this["d"];
            return (C_ZERO < t) - (t < C_ZERO);
          },
          /**
           * Calculates the ceil of a rational number
           *
           * Ex: new Fraction('4.(3)').ceil() => (5 / 1)
           **/
          "ceil": function(places) {
            places = C_TEN ** BigInt(places || 0);
            return newFraction(
              this["s"] * places * this["n"] / this["d"] + (places * this["n"] % this["d"] > C_ZERO && this["s"] >= C_ZERO ? C_ONE : C_ZERO),
              places
            );
          },
          /**
           * Calculates the floor of a rational number
           *
           * Ex: new Fraction('4.(3)').floor() => (4 / 1)
           **/
          "floor": function(places) {
            places = C_TEN ** BigInt(places || 0);
            return newFraction(
              this["s"] * places * this["n"] / this["d"] - (places * this["n"] % this["d"] > C_ZERO && this["s"] < C_ZERO ? C_ONE : C_ZERO),
              places
            );
          },
          /**
           * Rounds a rational numbers
           *
           * Ex: new Fraction('4.(3)').round() => (4 / 1)
           **/
          "round": function(places) {
            places = C_TEN ** BigInt(places || 0);
            return newFraction(
              this["s"] * places * this["n"] / this["d"] + this["s"] * ((this["s"] >= C_ZERO ? C_ONE : C_ZERO) + C_TWO * (places * this["n"] % this["d"]) > this["d"] ? C_ONE : C_ZERO),
              places
            );
          },
          /**
           * Check if two rational numbers are divisible
           *
           * Ex: new Fraction(19.6).divisible(1.5);
           */
          "divisible": function(a, b) {
            parse2(a, b);
            return !(!(P["n"] * this["d"]) || this["n"] * P["d"] % (P["n"] * this["d"]));
          },
          /**
           * Returns a decimal representation of the fraction
           *
           * Ex: new Fraction("100.'91823'").valueOf() => 100.91823918239183
           **/
          "valueOf": function() {
            return Number(this["s"] * this["n"]) / Number(this["d"]);
          },
          /**
           * Creates a string representation of a fraction with all digits
           *
           * Ex: new Fraction("100.'91823'").toString() => "100.(91823)"
           **/
          "toString": function(dec) {
            let N = this["n"];
            let D = this["d"];
            function trunc(x) {
              return typeof x === "bigint" ? x : Math.floor(x);
            }
            dec = dec || 15;
            let cycLen = cycleLen(N, D);
            let cycOff = cycleStart(N, D, cycLen);
            let str = this["s"] < C_ZERO ? "-" : "";
            str += trunc(N / D);
            N %= D;
            N *= C_TEN;
            if (N)
              str += ".";
            if (cycLen) {
              for (let i = cycOff; i--; ) {
                str += trunc(N / D);
                N %= D;
                N *= C_TEN;
              }
              str += "(";
              for (let i = cycLen; i--; ) {
                str += trunc(N / D);
                N %= D;
                N *= C_TEN;
              }
              str += ")";
            } else {
              for (let i = dec; N && i--; ) {
                str += trunc(N / D);
                N %= D;
                N *= C_TEN;
              }
            }
            return str;
          },
          /**
           * Returns a string-fraction representation of a Fraction object
           *
           * Ex: new Fraction("1.'3'").toFraction() => "4 1/3"
           **/
          "toFraction": function(excludeWhole) {
            let n = this["n"];
            let d = this["d"];
            let str = this["s"] < C_ZERO ? "-" : "";
            if (d === C_ONE) {
              str += n;
            } else {
              let whole = n / d;
              if (excludeWhole && whole > C_ZERO) {
                str += whole;
                str += " ";
                n %= d;
              }
              str += n;
              str += "/";
              str += d;
            }
            return str;
          },
          /**
           * Returns a latex representation of a Fraction object
           *
           * Ex: new Fraction("1.'3'").toLatex() => "\frac{4}{3}"
           **/
          "toLatex": function(excludeWhole) {
            let n = this["n"];
            let d = this["d"];
            let str = this["s"] < C_ZERO ? "-" : "";
            if (d === C_ONE) {
              str += n;
            } else {
              let whole = n / d;
              if (excludeWhole && whole > C_ZERO) {
                str += whole;
                n %= d;
              }
              str += "\\frac{";
              str += n;
              str += "}{";
              str += d;
              str += "}";
            }
            return str;
          },
          /**
           * Returns an array of continued fraction elements
           *
           * Ex: new Fraction("7/8").toContinued() => [0,1,7]
           */
          "toContinued": function() {
            let a = this["n"];
            let b = this["d"];
            let res = [];
            do {
              res.push(a / b);
              let t = a % b;
              a = b;
              b = t;
            } while (a !== C_ONE);
            return res;
          },
          "simplify": function(eps) {
            eps = eps || 1e-3;
            const thisABS = this["abs"]();
            const cont = thisABS["toContinued"]();
            for (let i = 1; i < cont.length; i++) {
              let s = newFraction(cont[i - 1], C_ONE);
              for (let k = i - 2; k >= 0; k--) {
                s = s["inverse"]()["add"](cont[k]);
              }
              if (Math.abs(s["sub"](thisABS).valueOf()) < eps) {
                return s["mul"](this["s"]);
              }
            }
            return this;
          }
        };
        if (typeof define === "function" && define["amd"]) {
          define([], function() {
            return Fraction2;
          });
        } else if (typeof exports === "object") {
          Object.defineProperty(exports, "__esModule", { "value": true });
          Fraction2["default"] = Fraction2;
          Fraction2["Fraction"] = Fraction2;
          module["exports"] = Fraction2;
        } else {
          root["Fraction"] = Fraction2;
        }
      })(exports);
    }
  });

  // app/modules/damage/mathWorker.ts
  var import_bigfraction = __toESM(require_bigfraction());

  // app/lib/dice-roller-parser/diceroll.js
  function peg$subclass(child, parent) {
    function ctor() {
      this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }
  function peg$SyntaxError(message, expected, found, location) {
    this.message = message;
    this.expected = expected;
    this.found = found;
    this.location = location;
    this.name = "SyntaxError";
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, peg$SyntaxError);
    }
  }
  peg$subclass(peg$SyntaxError, Error);
  peg$SyntaxError.buildMessage = function(expected, found) {
    var DESCRIBE_EXPECTATION_FNS = {
      literal: function(expectation) {
        return '"' + literalEscape(expectation.text) + '"';
      },
      "class": function(expectation) {
        var escapedParts = "", i;
        for (i = 0; i < expectation.parts.length; i++) {
          escapedParts += expectation.parts[i] instanceof Array ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1]) : classEscape(expectation.parts[i]);
        }
        return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
      },
      any: function(expectation) {
        return "any character";
      },
      end: function(expectation) {
        return "end of input";
      },
      other: function(expectation) {
        return expectation.description;
      }
    };
    function hex(ch) {
      return ch.charCodeAt(0).toString(16).toUpperCase();
    }
    function literalEscape(s) {
      return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
        return "\\x0" + hex(ch);
      }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
        return "\\x" + hex(ch);
      });
    }
    function classEscape(s) {
      return s.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
        return "\\x0" + hex(ch);
      }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
        return "\\x" + hex(ch);
      });
    }
    function describeExpectation(expectation) {
      return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
    }
    function describeExpected(expected2) {
      var descriptions = new Array(expected2.length), i, j;
      for (i = 0; i < expected2.length; i++) {
        descriptions[i] = describeExpectation(expected2[i]);
      }
      descriptions.sort();
      if (descriptions.length > 0) {
        for (i = 1, j = 1; i < descriptions.length; i++) {
          if (descriptions[i - 1] !== descriptions[i]) {
            descriptions[j] = descriptions[i];
            j++;
          }
        }
        descriptions.length = j;
      }
      switch (descriptions.length) {
        case 1:
          return descriptions[0];
        case 2:
          return descriptions[0] + " or " + descriptions[1];
        default:
          return descriptions.slice(0, -1).join(", ") + ", or " + descriptions[descriptions.length - 1];
      }
    }
    function describeFound(found2) {
      return found2 ? '"' + literalEscape(found2) + '"' : "end of input";
    }
    return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
  };
  function peg$parse(input, options) {
    options = options !== void 0 ? options : {};
    var peg$FAILED = {}, peg$startRuleFunctions = { start: peg$parsestart }, peg$startRuleFunction = peg$parsestart, peg$c0 = peg$anyExpectation(), peg$c1 = function(expr, label) {
      expr.root = true;
      if (label) {
        expr.label = label.join("");
      }
      return expr;
    }, peg$c2 = "[[", peg$c3 = peg$literalExpectation("[[", false), peg$c4 = "]]", peg$c5 = peg$literalExpectation("]]", false), peg$c6 = function(expr) {
      return {
        type: "inline",
        expr
      };
    }, peg$c7 = function(roll, label) {
      if (label) {
        roll.label = label;
      }
      return roll;
    }, peg$c8 = function(group, mods, label) {
      if (mods.length > 0) {
        group.mods = (group.mods || []).concat(mods);
      }
      if (label) {
        group.label = label;
      }
      return group;
    }, peg$c9 = ">", peg$c10 = peg$literalExpectation(">", false), peg$c11 = "<", peg$c12 = peg$literalExpectation("<", false), peg$c13 = "=", peg$c14 = peg$literalExpectation("=", false), peg$c15 = function(mod, expr) {
      return {
        type: "success",
        mod,
        expr
      };
    }, peg$c16 = "f", peg$c17 = peg$literalExpectation("f", false), peg$c18 = function(mod, expr) {
      return {
        type: "failure",
        mod,
        expr
      };
    }, peg$c19 = "cs", peg$c20 = peg$literalExpectation("cs", false), peg$c21 = function(mod, expr) {
      return {
        type: "crit",
        mod,
        expr
      };
    }, peg$c22 = "cf", peg$c23 = peg$literalExpectation("cf", false), peg$c24 = function(mod, expr) {
      return {
        type: "critfail",
        mod,
        expr
      };
    }, peg$c25 = function(mod, expr) {
      return {
        mod,
        expr
      };
    }, peg$c26 = "m", peg$c27 = peg$literalExpectation("m", false), peg$c28 = "t", peg$c29 = peg$literalExpectation("t", false), peg$c30 = function(count, min, target) {
      const match = {
        type: "match",
        min: min || { type: "number", value: 2 },
        count: !!count
      };
      if (target) {
        match.mod = target.mod;
        match.expr = target.expr;
      }
      return match;
    }, peg$c31 = "k", peg$c32 = peg$literalExpectation("k", false), peg$c33 = "l", peg$c34 = peg$literalExpectation("l", false), peg$c35 = "h", peg$c36 = peg$literalExpectation("h", false), peg$c37 = function(highlow, expr) {
      return {
        type: "keep",
        highlow,
        expr: expr || defaultExpression
      };
    }, peg$c38 = "d", peg$c39 = peg$literalExpectation("d", false), peg$c40 = function(highlow, expr) {
      return {
        type: "drop",
        highlow,
        expr: expr || defaultExpression
      };
    }, peg$c41 = "{", peg$c42 = peg$literalExpectation("{", false), peg$c43 = ",", peg$c44 = peg$literalExpectation(",", false), peg$c45 = "}", peg$c46 = peg$literalExpectation("}", false), peg$c47 = function(head, tail) {
      return {
        rolls: [head, ...tail.map((el) => el[3])],
        type: "group"
      };
    }, peg$c48 = "+", peg$c49 = peg$literalExpectation("+", false), peg$c50 = function(head, tail) {
      if (tail.length == 0) {
        return head;
      }
      const ops = tail.map((element) => ({
        type: "math",
        op: element[1],
        tail: element[3]
      }));
      return {
        head,
        type: "diceExpression",
        ops
      };
    }, peg$c51 = function(head, mods, match, sort) {
      const targets = mods.filter((mod) => ["success", "failure"].includes(mod.type));
      mods = mods.filter((mod) => !targets.includes(mod));
      head.mods = (head.mods || []).concat(mods);
      if (targets.length > 0) {
        head.targets = targets;
      }
      if (match) {
        head.match = match;
      }
      if (sort) {
        head.sort = sort;
      }
      return head;
    }, peg$c52 = "s", peg$c53 = peg$literalExpectation("s", false), peg$c54 = "a", peg$c55 = peg$literalExpectation("a", false), peg$c56 = function(dir) {
      if (dir == "d") {
        return {
          type: "sort",
          asc: false
        };
      }
      return {
        type: "sort",
        asc: true
      };
    }, peg$c57 = function(head, tail) {
      head.mods = (head.mods || []).concat(tail);
      return head;
    }, peg$c58 = "!", peg$c59 = peg$literalExpectation("!", false), peg$c60 = function(target) {
      return {
        type: "explode",
        target
      };
    }, peg$c61 = "!!", peg$c62 = peg$literalExpectation("!!", false), peg$c63 = function(target) {
      return {
        type: "compound",
        target
      };
    }, peg$c64 = "!p", peg$c65 = peg$literalExpectation("!p", false), peg$c66 = function(target) {
      return {
        type: "penetrate",
        target
      };
    }, peg$c67 = "r", peg$c68 = peg$literalExpectation("r", false), peg$c69 = function(target) {
      target = target || defaultTarget;
      return {
        type: "reroll",
        target
      };
    }, peg$c70 = "ro", peg$c71 = peg$literalExpectation("ro", false), peg$c72 = function(target) {
      target = target || defaultTarget;
      return {
        type: "rerollOnce",
        target
      };
    }, peg$c73 = function(mod, value) {
      return {
        type: "target",
        mod,
        value
      };
    }, peg$c74 = function(head, tail) {
      head = head ? head : { type: "number", value: 1 };
      return {
        die: tail,
        count: head,
        type: "die"
      };
    }, peg$c75 = "F", peg$c76 = peg$literalExpectation("F", false), peg$c77 = function() {
      return {
        type: "fate"
      };
    }, peg$c78 = "%", peg$c79 = peg$literalExpectation("%", false), peg$c80 = function() {
      return {
        type: "number",
        value: "100"
      };
    }, peg$c81 = "(", peg$c82 = peg$literalExpectation("(", false), peg$c83 = ")", peg$c84 = peg$literalExpectation(")", false), peg$c85 = function(expr, label) {
      if (label) {
        expr.label = label;
      }
      return expr;
    }, peg$c86 = "-", peg$c87 = peg$literalExpectation("-", false), peg$c88 = function(head, tail) {
      if (tail.length == 0) {
        return head;
      }
      const ops = tail.map((element) => ({
        type: "math",
        op: element[1],
        tail: element[3]
      }));
      return {
        head,
        type: "expression",
        ops
      };
    }, peg$c89 = "*", peg$c90 = peg$literalExpectation("*", false), peg$c91 = "/", peg$c92 = peg$literalExpectation("/", false), peg$c93 = "**", peg$c94 = peg$literalExpectation("**", false), peg$c95 = "floor", peg$c96 = peg$literalExpectation("floor", false), peg$c97 = "ceil", peg$c98 = peg$literalExpectation("ceil", false), peg$c99 = "round", peg$c100 = peg$literalExpectation("round", false), peg$c101 = "abs", peg$c102 = peg$literalExpectation("abs", false), peg$c103 = function(op, expr) {
      return {
        type: "mathfunction",
        op,
        expr
      };
    }, peg$c104 = peg$otherExpectation("integer"), peg$c105 = /^[0-9]/, peg$c106 = peg$classExpectation([["0", "9"]], false, false), peg$c107 = function() {
      const num = parseInt(text(), 10);
      return {
        type: "number",
        value: num
      };
    }, peg$c108 = "[", peg$c109 = peg$literalExpectation("[", false), peg$c110 = /^[^\]]/, peg$c111 = peg$classExpectation(["]"], true, false), peg$c112 = "]", peg$c113 = peg$literalExpectation("]", false), peg$c114 = function(label) {
      return label.join("");
    }, peg$c115 = peg$otherExpectation("whitespace"), peg$c116 = /^[ \t\n\r]/, peg$c117 = peg$classExpectation([" ", "	", "\n", "\r"], false, false), peg$currPos = 0, peg$savedPos = 0, peg$posDetailsCache = [{ line: 1, column: 1 }], peg$maxFailPos = 0, peg$maxFailExpected = [], peg$silentFails = 0, peg$result;
    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error(`Can't start parsing from rule "` + options.startRule + '".');
      }
      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }
    function text() {
      return input.substring(peg$savedPos, peg$currPos);
    }
    function location() {
      return peg$computeLocation(peg$savedPos, peg$currPos);
    }
    function expected(description, location2) {
      location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
      throw peg$buildStructuredError(
        [peg$otherExpectation(description)],
        input.substring(peg$savedPos, peg$currPos),
        location2
      );
    }
    function error(message, location2) {
      location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
      throw peg$buildSimpleError(message, location2);
    }
    function peg$literalExpectation(text2, ignoreCase) {
      return { type: "literal", text: text2, ignoreCase };
    }
    function peg$classExpectation(parts, inverted, ignoreCase) {
      return { type: "class", parts, inverted, ignoreCase };
    }
    function peg$anyExpectation() {
      return { type: "any" };
    }
    function peg$endExpectation() {
      return { type: "end" };
    }
    function peg$otherExpectation(description) {
      return { type: "other", description };
    }
    function peg$computePosDetails(pos) {
      var details = peg$posDetailsCache[pos], p;
      if (details) {
        return details;
      } else {
        p = pos - 1;
        while (!peg$posDetailsCache[p]) {
          p--;
        }
        details = peg$posDetailsCache[p];
        details = {
          line: details.line,
          column: details.column
        };
        while (p < pos) {
          if (input.charCodeAt(p) === 10) {
            details.line++;
            details.column = 1;
          } else {
            details.column++;
          }
          p++;
        }
        peg$posDetailsCache[pos] = details;
        return details;
      }
    }
    function peg$computeLocation(startPos, endPos) {
      var startPosDetails = peg$computePosDetails(startPos), endPosDetails = peg$computePosDetails(endPos);
      return {
        start: {
          offset: startPos,
          line: startPosDetails.line,
          column: startPosDetails.column
        },
        end: {
          offset: endPos,
          line: endPosDetails.line,
          column: endPosDetails.column
        }
      };
    }
    function peg$fail(expected2) {
      if (peg$currPos < peg$maxFailPos) {
        return;
      }
      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }
      peg$maxFailExpected.push(expected2);
    }
    function peg$buildSimpleError(message, location2) {
      return new peg$SyntaxError(message, null, null, location2);
    }
    function peg$buildStructuredError(expected2, found, location2) {
      return new peg$SyntaxError(
        peg$SyntaxError.buildMessage(expected2, found),
        expected2,
        found,
        location2
      );
    }
    function peg$parsestart() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      s1 = peg$parseExpression();
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (input.length > peg$currPos) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c0);
          }
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (input.length > peg$currPos) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c0);
            }
          }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c1(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseInlineExpression() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c2) {
        s1 = peg$c2;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c3);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseExpression();
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c4) {
            s3 = peg$c4;
            peg$currPos += 2;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c5);
            }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c6(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseAnyRoll() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      s1 = peg$parseModGroupedRoll();
      if (s1 === peg$FAILED) {
        s1 = peg$parseFullRoll();
        if (s1 === peg$FAILED) {
          s1 = peg$parseInteger();
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseLabel();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c7(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseModGroupedRoll() {
      var s0, s1, s2, s3, s4;
      s0 = peg$currPos;
      s1 = peg$parseGroupedRoll();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseKeepMod();
        if (s3 === peg$FAILED) {
          s3 = peg$parseDropMod();
          if (s3 === peg$FAILED) {
            s3 = peg$parseSuccessMod();
            if (s3 === peg$FAILED) {
              s3 = peg$parseFailureMod();
            }
          }
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseKeepMod();
          if (s3 === peg$FAILED) {
            s3 = peg$parseDropMod();
            if (s3 === peg$FAILED) {
              s3 = peg$parseSuccessMod();
              if (s3 === peg$FAILED) {
                s3 = peg$parseFailureMod();
              }
            }
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseLabel();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c8(s1, s2, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseSuccessMod() {
      var s0, s1, s2;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 62) {
        s1 = peg$c9;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c10);
        }
      }
      if (s1 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 60) {
          s1 = peg$c11;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c12);
          }
        }
        if (s1 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 61) {
            s1 = peg$c13;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c14);
            }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseRollExpr();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c15(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseFailureMod() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 102) {
        s1 = peg$c16;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c17);
        }
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 62) {
          s2 = peg$c9;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c10);
          }
        }
        if (s2 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 60) {
            s2 = peg$c11;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c12);
            }
          }
          if (s2 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 61) {
              s2 = peg$c13;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c14);
              }
            }
          }
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseRollExpr();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c18(s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseCriticalSuccessMod() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c19) {
        s1 = peg$c19;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c20);
        }
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 62) {
          s2 = peg$c9;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c10);
          }
        }
        if (s2 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 60) {
            s2 = peg$c11;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c12);
            }
          }
          if (s2 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 61) {
              s2 = peg$c13;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c14);
              }
            }
          }
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseRollExpr();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c21(s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseCriticalFailureMod() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c22) {
        s1 = peg$c22;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c23);
        }
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 62) {
          s2 = peg$c9;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c10);
          }
        }
        if (s2 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 60) {
            s2 = peg$c11;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c12);
            }
          }
          if (s2 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 61) {
              s2 = peg$c13;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c14);
              }
            }
          }
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseRollExpr();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c24(s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseMatchTarget() {
      var s0, s1, s2;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 62) {
        s1 = peg$c9;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c10);
        }
      }
      if (s1 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 60) {
          s1 = peg$c11;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c12);
          }
        }
        if (s1 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 61) {
            s1 = peg$c13;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c14);
            }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseRollExpr();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c25(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseMatchMod() {
      var s0, s1, s2, s3, s4;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 109) {
        s1 = peg$c26;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c27);
        }
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 116) {
          s2 = peg$c28;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c29);
          }
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseInteger();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parseMatchTarget();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c30(s2, s3, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseKeepMod() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 107) {
        s1 = peg$c31;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c32);
        }
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 108) {
          s2 = peg$c33;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c34);
          }
        }
        if (s2 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 104) {
            s2 = peg$c35;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c36);
            }
          }
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseRollExpr();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c37(s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseDropMod() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 100) {
        s1 = peg$c38;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c39);
        }
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 108) {
          s2 = peg$c33;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c34);
          }
        }
        if (s2 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 104) {
            s2 = peg$c35;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c36);
            }
          }
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseRollExpr();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c40(s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseGroupedRoll() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s1 = peg$c41;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c42);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseRollExpression();
          if (s3 !== peg$FAILED) {
            s4 = [];
            s5 = peg$currPos;
            s6 = peg$parse_();
            if (s6 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 44) {
                s7 = peg$c43;
                peg$currPos++;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c44);
                }
              }
              if (s7 !== peg$FAILED) {
                s8 = peg$parse_();
                if (s8 !== peg$FAILED) {
                  s9 = peg$parseRollExpression();
                  if (s9 !== peg$FAILED) {
                    s6 = [s6, s7, s8, s9];
                    s5 = s6;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$currPos;
              s6 = peg$parse_();
              if (s6 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 44) {
                  s7 = peg$c43;
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c44);
                  }
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse_();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseRollExpression();
                    if (s9 !== peg$FAILED) {
                      s6 = [s6, s7, s8, s9];
                      s5 = s6;
                    } else {
                      peg$currPos = s5;
                      s5 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 125) {
                  s6 = peg$c45;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c46);
                  }
                }
                if (s6 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c47(s3, s4);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseRollExpression() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      s1 = peg$parseRollOrExpression();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (s4 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 43) {
            s5 = peg$c48;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c49);
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseRollOrExpression();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 43) {
              s5 = peg$c48;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c49);
              }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse_();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseRollOrExpression();
                if (s7 !== peg$FAILED) {
                  s4 = [s4, s5, s6, s7];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c50(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseRollOrExpression() {
      var s0;
      s0 = peg$parseFullRoll();
      if (s0 === peg$FAILED) {
        s0 = peg$parseExpression();
      }
      return s0;
    }
    function peg$parseFullRoll() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      s1 = peg$parseTargetedRoll();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseLabel();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c7(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseTargetedRoll() {
      var s0, s1, s2, s3, s4;
      s0 = peg$currPos;
      s1 = peg$parseRolledModRoll();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseDropMod();
        if (s3 === peg$FAILED) {
          s3 = peg$parseKeepMod();
          if (s3 === peg$FAILED) {
            s3 = peg$parseSuccessMod();
            if (s3 === peg$FAILED) {
              s3 = peg$parseFailureMod();
              if (s3 === peg$FAILED) {
                s3 = peg$parseCriticalFailureMod();
                if (s3 === peg$FAILED) {
                  s3 = peg$parseCriticalSuccessMod();
                }
              }
            }
          }
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseDropMod();
          if (s3 === peg$FAILED) {
            s3 = peg$parseKeepMod();
            if (s3 === peg$FAILED) {
              s3 = peg$parseSuccessMod();
              if (s3 === peg$FAILED) {
                s3 = peg$parseFailureMod();
                if (s3 === peg$FAILED) {
                  s3 = peg$parseCriticalFailureMod();
                  if (s3 === peg$FAILED) {
                    s3 = peg$parseCriticalSuccessMod();
                  }
                }
              }
            }
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseMatchMod();
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parseSortMod();
            if (s4 === peg$FAILED) {
              s4 = null;
            }
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c51(s1, s2, s3, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseSortMod() {
      var s0, s1, s2;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 115) {
        s1 = peg$c52;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c53);
        }
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 97) {
          s2 = peg$c54;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c55);
          }
        }
        if (s2 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 100) {
            s2 = peg$c38;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c39);
            }
          }
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c56(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseRolledModRoll() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      s1 = peg$parseDiceRoll();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseCompoundRoll();
        if (s3 === peg$FAILED) {
          s3 = peg$parsePenetrateRoll();
          if (s3 === peg$FAILED) {
            s3 = peg$parseExplodeRoll();
            if (s3 === peg$FAILED) {
              s3 = peg$parseReRollOnceMod();
              if (s3 === peg$FAILED) {
                s3 = peg$parseReRollMod();
              }
            }
          }
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseCompoundRoll();
          if (s3 === peg$FAILED) {
            s3 = peg$parsePenetrateRoll();
            if (s3 === peg$FAILED) {
              s3 = peg$parseExplodeRoll();
              if (s3 === peg$FAILED) {
                s3 = peg$parseReRollOnceMod();
                if (s3 === peg$FAILED) {
                  s3 = peg$parseReRollMod();
                }
              }
            }
          }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c57(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseExplodeRoll() {
      var s0, s1, s2;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 33) {
        s1 = peg$c58;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c59);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseTargetMod();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c60(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseCompoundRoll() {
      var s0, s1, s2;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c61) {
        s1 = peg$c61;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c62);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseTargetMod();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c63(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parsePenetrateRoll() {
      var s0, s1, s2;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c64) {
        s1 = peg$c64;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c65);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseTargetMod();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c66(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseReRollMod() {
      var s0, s1, s2;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 114) {
        s1 = peg$c67;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c68);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseTargetMod();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c69(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseReRollOnceMod() {
      var s0, s1, s2;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c70) {
        s1 = peg$c70;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c71);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseTargetMod();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c72(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseTargetMod() {
      var s0, s1, s2;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 62) {
        s1 = peg$c9;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c10);
        }
      }
      if (s1 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 60) {
          s1 = peg$c11;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c12);
          }
        }
        if (s1 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 61) {
            s1 = peg$c13;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c14);
            }
          }
        }
      }
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseRollExpr();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c73(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseDiceRoll() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      s1 = peg$parseRollExpr();
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 100) {
          s2 = peg$c38;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c39);
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseFateExpr();
          if (s3 === peg$FAILED) {
            s3 = peg$parsePercentExpr();
            if (s3 === peg$FAILED) {
              s3 = peg$parseRollExpr();
            }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c74(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseFateExpr() {
      var s0, s1;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 70) {
        s1 = peg$c75;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c76);
        }
      }
      if (s1 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 102) {
          s1 = peg$c16;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c17);
          }
        }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c77();
      }
      s0 = s1;
      return s0;
    }
    function peg$parsePercentExpr() {
      var s0, s1;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 37) {
        s1 = peg$c78;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c79);
        }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c80();
      }
      s0 = s1;
      return s0;
    }
    function peg$parseRollExpr() {
      var s0;
      s0 = peg$parseBracketExpression();
      if (s0 === peg$FAILED) {
        s0 = peg$parseInteger();
      }
      return s0;
    }
    function peg$parseExpression() {
      var s0;
      s0 = peg$parseInlineExpression();
      if (s0 === peg$FAILED) {
        s0 = peg$parseAddSubExpression();
        if (s0 === peg$FAILED) {
          s0 = peg$parseBracketExpression();
        }
      }
      return s0;
    }
    function peg$parseBracketExpression() {
      var s0, s1, s2, s3, s4, s5;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c81;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c82);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseAddSubExpression();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 41) {
            s3 = peg$c83;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c84);
            }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseLabel();
              if (s5 === peg$FAILED) {
                s5 = null;
              }
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c85(s2, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseAddSubExpression() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      s1 = peg$parseMultDivExpression();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (s4 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 43) {
            s5 = peg$c48;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c49);
            }
          }
          if (s5 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 45) {
              s5 = peg$c86;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c87);
              }
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseMultDivExpression();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 43) {
              s5 = peg$c48;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c49);
              }
            }
            if (s5 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 45) {
                s5 = peg$c86;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c87);
                }
              }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse_();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseMultDivExpression();
                if (s7 !== peg$FAILED) {
                  s4 = [s4, s5, s6, s7];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c88(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseMultDivExpression() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      s1 = peg$parseModExpoExpression();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (s4 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 42) {
            s5 = peg$c89;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c90);
            }
          }
          if (s5 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 47) {
              s5 = peg$c91;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c92);
              }
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseModExpoExpression();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 42) {
              s5 = peg$c89;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c90);
              }
            }
            if (s5 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 47) {
                s5 = peg$c91;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c92);
                }
              }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse_();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseModExpoExpression();
                if (s7 !== peg$FAILED) {
                  s4 = [s4, s5, s6, s7];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c88(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseModExpoExpression() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      s1 = peg$parseFunctionOrRoll();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (s4 !== peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c93) {
            s5 = peg$c93;
            peg$currPos += 2;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c94);
            }
          }
          if (s5 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 37) {
              s5 = peg$c78;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c79);
              }
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseFunctionOrRoll();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c93) {
              s5 = peg$c93;
              peg$currPos += 2;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c94);
              }
            }
            if (s5 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 37) {
                s5 = peg$c78;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c79);
                }
              }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse_();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseFunctionOrRoll();
                if (s7 !== peg$FAILED) {
                  s4 = [s4, s5, s6, s7];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c88(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseMathFunction() {
      var s0;
      if (input.substr(peg$currPos, 5) === peg$c95) {
        s0 = peg$c95;
        peg$currPos += 5;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c96);
        }
      }
      if (s0 === peg$FAILED) {
        if (input.substr(peg$currPos, 4) === peg$c97) {
          s0 = peg$c97;
          peg$currPos += 4;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c98);
          }
        }
        if (s0 === peg$FAILED) {
          if (input.substr(peg$currPos, 5) === peg$c99) {
            s0 = peg$c99;
            peg$currPos += 5;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c100);
            }
          }
          if (s0 === peg$FAILED) {
            if (input.substr(peg$currPos, 3) === peg$c101) {
              s0 = peg$c101;
              peg$currPos += 3;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c102);
              }
            }
          }
        }
      }
      return s0;
    }
    function peg$parseMathFnExpression() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      s1 = peg$parseMathFunction();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 40) {
            s3 = peg$c81;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c82);
            }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseAddSubExpression();
              if (s5 !== peg$FAILED) {
                s6 = peg$parse_();
                if (s6 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 41) {
                    s7 = peg$c83;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$c84);
                    }
                  }
                  if (s7 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c103(s1, s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseFunctionOrRoll() {
      var s0;
      s0 = peg$parseMathFnExpression();
      if (s0 === peg$FAILED) {
        s0 = peg$parseAnyRoll();
        if (s0 === peg$FAILED) {
          s0 = peg$parseBracketExpression();
        }
      }
      return s0;
    }
    function peg$parseInteger() {
      var s0, s1, s2, s3;
      peg$silentFails++;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 45) {
        s1 = peg$c86;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c87);
        }
      }
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c105.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c106);
          }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$c105.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c106);
              }
            }
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c107();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c104);
        }
      }
      return s0;
    }
    function peg$parseLabel() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 91) {
        s1 = peg$c108;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c109);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c110.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c111);
          }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$c110.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c111);
              }
            }
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 93) {
            s3 = peg$c112;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c113);
            }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c114(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parse_() {
      var s0, s1;
      peg$silentFails++;
      s0 = [];
      if (peg$c116.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c117);
        }
      }
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        if (peg$c116.test(input.charAt(peg$currPos))) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c117);
          }
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$c115);
        }
      }
      return s0;
    }
    const defaultTarget = {
      type: "target",
      mod: "=",
      value: {
        type: "number",
        value: 1
      }
    };
    const defaultExpression = {
      type: "number",
      value: 1
    };
    peg$result = peg$startRuleFunction();
    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail(peg$endExpectation());
      }
      throw peg$buildStructuredError(
        peg$maxFailExpected,
        peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
        peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
      );
    }
  }
  var parse = peg$parse;

  // app/lib/dice-roller-parser/diceRoller.ts
  var DiceRoller = class {
    /**
     * The DiceRoller class that performs parsing and rolls of {@link https://wiki.roll20.net/Dice_Reference roll20 format} input strings
     * @constructor
     * @param randFunction The random number generator function to use when rolling, default: Math.random
     * @param maxRolls The max number of rolls to perform for a single die, default: 1000
     */
    constructor({ randFunction, maxRolls = 1e3, alwaysAverage = false, alwaysCrit = false } = {}) {
      this.randFunction = Math.random;
      this.maxRollCount = 1e3;
      this.getRoll = (inputDie) => {
        if (this.alwaysAverage) {
          return Math.floor(inputDie / 2) + 0.5;
        } else if (this.alwaysCrit) {
          return inputDie;
        }
        return Math.floor(this.randFunction() * inputDie) + 1;
      };
      if (randFunction) {
        this.randFunction = randFunction;
      }
      this.maxRollCount = maxRolls;
      this.alwaysAverage = alwaysAverage;
      this.alwaysCrit = alwaysCrit;
    }
    /**
     * Parses and returns an representation of a dice roll input string
     * @param input The input string to parse
     * @returns A {@link RootType} object representing the parsed input string
     */
    parse(input) {
      return parse(input);
    }
    /**
     * Parses and rolls a dice roll input string, returning an object representing the roll
     * @param input The input string to parse
     * @returns A {@link RollBase} object representing the rolled dice input string
     */
    roll(input) {
      const root = parse(input);
      return this.rollType(root);
    }
    /**
     * Parses and rolls a dice roll input string, returning the result as a number
     * @param input The input string to parse
     * @returns The final number value of the result
     */
    rollValue(input) {
      return this.roll(input).value;
    }
    /**
     * Rolls a previously parsed dice roll input string, returning an object representing the roll
     * @param parsed A parsed input as a {@link RootType} string to be rolled
     * @returns A {@link RollBase} object representing the rolled dice input string
     */
    rollParsed(parsed) {
      return this.rollType(parsed);
    }
    rollType(input) {
      let response;
      switch (input.type) {
        case "diceExpression":
          response = this.rollDiceExpr(input);
          break;
        case "group":
          response = this.rollGroup(input);
          break;
        case "die":
          response = this.rollDie(input);
          break;
        case "expression":
          response = this.rollExpression(input);
          break;
        case "mathfunction":
          response = this.rollFunction(input);
          break;
        case "inline":
          response = this.rollType(input.expr);
          break;
        case "number":
          response = {
            ...input,
            success: null,
            successes: 0,
            failures: 0,
            valid: true,
            order: 0
          };
          break;
        default:
          throw new Error(`Unable to render ${input.type}`);
      }
      if (input.label) {
        response.label = input.label;
      }
      return response;
    }
    rollDiceExpr(input) {
      const headRoll = this.rollType(input.head);
      const rolls = [headRoll];
      const ops = [];
      const value = input.ops.reduce((headValue, math, order) => {
        const tailRoll = this.rollType(math.tail);
        tailRoll.order = order;
        rolls.push(tailRoll);
        ops.push(math.op);
        switch (math.op) {
          case "+":
            return headValue + tailRoll.value;
          case "-":
            return headValue - tailRoll.value;
          default:
            return headValue;
        }
      }, headRoll.value);
      return {
        dice: rolls,
        ops,
        success: null,
        successes: 0,
        failures: 0,
        type: "diceexpressionroll",
        valid: true,
        value,
        order: 0
      };
    }
    rollGroup(input) {
      let rolls = input.rolls.map((roll, order) => ({
        ...this.rollType(roll),
        order
      }));
      let successes = 0;
      let failures = 0;
      let hasTarget = false;
      if (input.mods) {
        const mods = input.mods;
        const applyGroupMods = (dice) => {
          hasTarget = mods.some((mod) => ["failure", "success"].includes(mod.type));
          dice = mods.reduce((arr, mod) => this.applyGroupMod(arr, mod), dice);
          if (hasTarget) {
            dice = dice.map((die) => {
              successes += die.successes;
              failures += die.failures;
              die.value = die.successes - die.failures;
              die.success = die.value > 0;
              return die;
            });
          }
          return dice;
        };
        if (rolls.length === 1 && ["die", "diceexpressionroll"].includes(rolls[0].type)) {
          const roll = rolls[0];
          let dice = roll.type === "die" ? roll.rolls : roll.dice.filter((die) => die.type !== "number").reduce((arr, die) => [
            ...arr,
            ...die.type === "die" ? die.rolls : die.dice
          ], []);
          dice = applyGroupMods(dice);
          roll.value = dice.reduce((sum, die) => die.valid ? sum + die.value : sum, 0);
        } else {
          rolls = applyGroupMods(rolls);
        }
      }
      const value = rolls.reduce((sum, roll) => !roll.valid ? sum : sum + roll.value, 0);
      return {
        dice: rolls,
        success: hasTarget ? value > 0 : null,
        successes,
        failures,
        type: "grouproll",
        valid: true,
        value,
        order: 0
      };
    }
    rollDie(input) {
      const count = this.rollType(input.count);
      if (count.value > this.maxRollCount) {
        throw new Error("Entered number of dice too large.");
      }
      let rolls;
      let die;
      if (input.die.type === "fate") {
        die = {
          type: "fate",
          success: null,
          successes: 0,
          failures: 0,
          valid: false,
          value: 0,
          order: 0
        };
        rolls = Array.from({ length: count.value }, (_, i) => this.generateFateRoll(i));
      } else {
        die = this.rollType(input.die);
        rolls = Array.from({ length: count.value }, (_, i) => this.generateDiceRoll(die.value, i));
      }
      if (input.mods) {
        rolls = input.mods.reduce((moddedRolls, mod) => this.applyMod(moddedRolls, mod), rolls);
      }
      let successes = 0;
      let failures = 0;
      if (input.targets) {
        rolls = input.targets.reduce((moddedRolls, target) => this.applyMod(moddedRolls, target), rolls).map((roll) => {
          successes += roll.successes;
          failures += roll.failures;
          roll.value = roll.successes - roll.failures;
          roll.success = roll.value > 0;
          return roll;
        });
      }
      let matched = false;
      let matchCount = 0;
      if (input.match) {
        const match = input.match;
        const counts = rolls.reduce(
          (map, roll) => map.set(roll.roll, (map.get(roll.roll) || 0) + 1),
          /* @__PURE__ */ new Map()
        );
        const matches = new Set(Array.from(counts.entries()).filter(([_, matchedCount]) => matchedCount >= match.min.value).filter(([val]) => !(match.mod && match.expr) || this.successTest(match.mod, this.rollType(match.expr).value, val)).map(([val]) => val));
        rolls.filter((roll) => matches.has(roll.roll)).forEach((roll) => roll.matched = true);
        if (match.count) {
          matched = true;
          matchCount = matches.size;
        }
      }
      if (input.sort) {
        rolls = this.applySort(rolls, input.sort);
      }
      const value = rolls.reduce((sum, roll) => !roll.valid ? sum : sum + roll.value, 0);
      return {
        count,
        die,
        rolls,
        success: input.targets ? value > 0 : null,
        successes,
        failures,
        type: "die",
        valid: true,
        value: matched ? matchCount : value,
        order: 0,
        matched
      };
    }
    rollExpression(input) {
      const headRoll = this.rollType(input.head);
      const rolls = [headRoll];
      const ops = [];
      const value = input.ops.reduce((headValue, math) => {
        const tailRoll = this.rollType(math.tail);
        rolls.push(tailRoll);
        ops.push(math.op);
        switch (math.op) {
          case "+":
            return headValue + tailRoll.value;
          case "-":
            return headValue - tailRoll.value;
          case "*":
            return headValue * tailRoll.value;
          case "/":
            return headValue / tailRoll.value;
          case "%":
            return headValue % tailRoll.value;
          case "**":
            return headValue ** tailRoll.value;
          default:
            return headValue;
        }
      }, headRoll.value);
      return {
        dice: rolls,
        ops,
        success: null,
        successes: 0,
        failures: 0,
        type: "expressionroll",
        valid: true,
        value,
        order: 0
      };
    }
    rollFunction(input) {
      const expr = this.rollType(input.expr);
      let value;
      switch (input.op) {
        case "floor":
          value = Math.floor(expr.value);
          break;
        case "ceil":
          value = Math.ceil(expr.value);
          break;
        case "round":
          value = Math.round(expr.value);
          break;
        case "abs":
          value = Math.abs(expr.value);
          break;
        default:
          value = expr.value;
          break;
      }
      return {
        expr,
        op: input.op,
        success: null,
        successes: 0,
        failures: 0,
        type: "mathfunction",
        valid: true,
        value,
        order: 0
      };
    }
    applyGroupMod(rolls, mod) {
      return this.getGroupModMethod(mod)(rolls);
    }
    getGroupModMethod(mod) {
      const lookup = (roll) => roll.value;
      switch (mod.type) {
        case "success":
          return this.getSuccessMethod(mod, lookup);
        case "failure":
          return this.getFailureMethod(mod, lookup);
        case "keep":
          return this.getKeepMethod(mod, lookup);
        case "drop":
          return this.getDropMethod(mod, lookup);
        default:
          throw new Error(`Mod ${mod.type} is not recognised`);
      }
    }
    applyMod(rolls, mod) {
      return this.getModMethod(mod)(rolls);
    }
    getModMethod(mod) {
      const lookup = (roll) => roll.roll;
      switch (mod.type) {
        case "success":
          return this.getSuccessMethod(mod, lookup);
        case "failure":
          return this.getFailureMethod(mod, lookup);
        case "crit":
          return this.getCritSuccessMethod(mod, lookup);
        case "critfail":
          return this.getCritFailureMethod(mod, lookup);
        case "keep":
          return (rolls) => this.getKeepMethod(mod, lookup)(rolls).sort((a, b) => a.order - b.order);
        case "drop":
          return (rolls) => this.getDropMethod(mod, lookup)(rolls).sort((a, b) => a.order - b.order);
        case "explode":
          return this.getExplodeMethod(mod);
        case "compound":
          return this.getCompoundMethod(mod);
        case "penetrate":
          return this.getPenetrateMethod(mod);
        case "reroll":
          return this.getReRollMethod(mod);
        case "rerollOnce":
          return this.getReRollOnceMethod(mod);
        default:
          throw new Error(`Mod ${mod.type} is not recognised`);
      }
    }
    applySort(rolls, mod) {
      rolls.sort((a, b) => mod.asc ? a.roll - b.roll : b.roll - a.roll);
      rolls.forEach((roll, i) => roll.order = i);
      return rolls;
    }
    getCritSuccessMethod(mod, lookup) {
      const exprResult = this.rollType(mod.expr);
      return (rolls) => {
        return rolls.map((roll) => {
          if (!roll.valid)
            return roll;
          if (roll.type !== "roll")
            return roll;
          if (roll.success)
            return roll;
          const critRoll = roll;
          if (this.successTest(mod.mod, exprResult.value, lookup(roll))) {
            critRoll.critical = "success";
          } else if (critRoll.critical === "success") {
            critRoll.critical = null;
          }
          return roll;
        });
      };
    }
    getCritFailureMethod(mod, lookup) {
      const exprResult = this.rollType(mod.expr);
      return (rolls) => {
        return rolls.map((roll) => {
          if (!roll.valid)
            return roll;
          if (roll.type !== "roll")
            return roll;
          if (roll.success)
            return roll;
          const critRoll = roll;
          if (this.successTest(mod.mod, exprResult.value, lookup(roll))) {
            critRoll.critical = "failure";
          } else if (critRoll.critical === "failure") {
            critRoll.critical = null;
          }
          return roll;
        });
      };
    }
    getSuccessMethod(mod, lookup) {
      const exprResult = this.rollType(mod.expr);
      return (rolls) => {
        return rolls.map((roll) => {
          if (!roll.valid) {
            return roll;
          }
          if (this.successTest(mod.mod, exprResult.value, lookup(roll))) {
            roll.successes += 1;
          }
          return roll;
        });
      };
    }
    getFailureMethod(mod, lookup) {
      const exprResult = this.rollType(mod.expr);
      return (rolls) => {
        return rolls.map((roll) => {
          if (!roll.valid) {
            return roll;
          }
          if (this.successTest(mod.mod, exprResult.value, lookup(roll))) {
            roll.failures += 1;
          }
          return roll;
        });
      };
    }
    getKeepMethod(mod, lookup) {
      const exprResult = this.rollType(mod.expr);
      return (rolls) => {
        if (rolls.length === 0)
          return rolls;
        rolls = rolls.sort((a, b) => mod.highlow === "l" ? lookup(b) - lookup(a) : lookup(a) - lookup(b)).sort((a, b) => (a.valid ? 1 : 0) - (b.valid ? 1 : 0));
        const toKeep = Math.max(Math.min(exprResult.value, rolls.length), 0);
        let dropped = 0;
        let i = 0;
        const toDrop = rolls.reduce((value, roll) => (roll.valid ? 1 : 0) + value, 0) - toKeep;
        while (i < rolls.length && dropped < toDrop) {
          if (rolls[i].valid) {
            rolls[i].valid = false;
            rolls[i].drop = true;
            dropped++;
          }
          i++;
        }
        return rolls;
      };
    }
    getDropMethod(mod, lookup) {
      const exprResult = this.rollType(mod.expr);
      return (rolls) => {
        rolls = rolls.sort((a, b) => mod.highlow === "h" ? lookup(b) - lookup(a) : lookup(a) - lookup(b));
        const toDrop = Math.max(Math.min(exprResult.value, rolls.length), 0);
        let dropped = 0;
        let i = 0;
        while (i < rolls.length && dropped < toDrop) {
          if (rolls[i].valid) {
            rolls[i].valid = false;
            rolls[i].drop = true;
            dropped++;
          }
          i++;
        }
        return rolls;
      };
    }
    getExplodeMethod(mod) {
      const targetValue = mod.target ? this.rollType(mod.target.value) : null;
      return (rolls) => {
        const targetMethod = targetValue ? (roll) => this.successTest(mod.target.mod, targetValue.value, roll.roll) : (roll) => this.successTest("=", roll.type === "fateroll" ? 1 : roll.die, roll.roll);
        if (rolls[0].type === "roll" && targetMethod({ roll: 1 }) && targetMethod({ roll: rolls[0].die })) {
          throw new Error("Invalid reroll target");
        }
        for (let i = 0; i < rolls.length; i++) {
          let roll = rolls[i];
          roll.order = i;
          let explodeCount = 0;
          while (targetMethod(roll) && explodeCount++ < 1e3) {
            roll.explode = true;
            const newRoll = this.reRoll(roll, ++i);
            rolls.splice(i, 0, newRoll);
            roll = newRoll;
          }
        }
        return rolls;
      };
    }
    getCompoundMethod(mod) {
      const targetValue = mod.target ? this.rollType(mod.target.value) : null;
      return (rolls) => {
        const targetMethod = targetValue ? (roll) => this.successTest(mod.target.mod, targetValue.value, roll.roll) : (roll) => this.successTest("=", roll.type === "fateroll" ? 1 : roll.die, roll.roll);
        if (rolls[0].type === "roll" && targetMethod({ roll: 1 }) && targetMethod({ roll: rolls[0].die })) {
          throw new Error("Invalid reroll target");
        }
        for (let i = 0; i < rolls.length; i++) {
          let roll = rolls[i];
          let rollValue = roll.roll;
          let explodeCount = 0;
          while (targetMethod(roll) && explodeCount++ < 1e3) {
            roll.explode = true;
            const newRoll = this.reRoll(roll, i + 1);
            rollValue += newRoll.roll;
            roll = newRoll;
          }
          rolls[i].value = rollValue;
          rolls[i].roll = rollValue;
        }
        return rolls;
      };
    }
    getPenetrateMethod(mod) {
      const targetValue = mod.target ? this.rollType(mod.target.value) : null;
      return (rolls) => {
        const targetMethod = targetValue ? (roll) => this.successTest(mod.target.mod, targetValue.value, roll.roll) : (roll) => this.successTest("=", roll.type === "fateroll" ? 1 : roll.die, roll.roll);
        if (targetValue && rolls[0].type === "roll" && targetMethod(rolls[0]) && this.successTest(mod.target.mod, targetValue.value, 1)) {
          throw new Error("Invalid reroll target");
        }
        for (let i = 0; i < rolls.length; i++) {
          let roll = rolls[i];
          roll.order = i;
          let explodeCount = 0;
          while (targetMethod(roll) && explodeCount++ < 1e3) {
            roll.explode = true;
            const newRoll = this.reRoll(roll, ++i);
            newRoll.value -= 1;
            rolls.splice(i, 0, newRoll);
            roll = newRoll;
          }
        }
        return rolls;
      };
    }
    getReRollMethod(mod) {
      const targetMethod = mod.target ? this.successTest.bind(null, mod.target.mod, this.rollType(mod.target.value).value) : this.successTest.bind(null, "=", 1);
      return (rolls) => {
        if (rolls[0].type === "roll" && targetMethod(1) && targetMethod(rolls[0].die)) {
          throw new Error("Invalid reroll target");
        }
        for (let i = 0; i < rolls.length; i++) {
          while (targetMethod(rolls[i].roll)) {
            rolls[i].reroll = true;
            rolls[i].valid = false;
            const newRoll = this.reRoll(rolls[i], i + 1);
            rolls.splice(++i, 0, newRoll);
          }
        }
        return rolls;
      };
    }
    getReRollOnceMethod(mod) {
      const targetMethod = mod.target ? this.successTest.bind(null, mod.target.mod, this.rollType(mod.target.value).value) : this.successTest.bind(null, "=", 1);
      return (rolls) => {
        if (rolls[0].type === "roll" && targetMethod(1) && targetMethod(rolls[0].die)) {
          throw new Error("Invalid reroll target");
        }
        for (let i = 0; i < rolls.length; i++) {
          if (targetMethod(rolls[i].roll)) {
            rolls[i].reroll = true;
            rolls[i].valid = false;
            const newRoll = this.reRoll(rolls[i], i + 1);
            rolls.splice(++i, 0, newRoll);
          }
        }
        return rolls;
      };
    }
    successTest(mod, target, roll) {
      switch (mod) {
        case ">":
          return roll >= target;
        case "<":
          return roll <= target;
        case "=":
        default:
          return roll == target;
      }
    }
    reRoll(roll, order) {
      switch (roll.type) {
        case "roll":
          return this.generateDiceRoll(roll.die, order);
        case "fateroll":
          return this.generateFateRoll(order);
        default:
          throw new Error(`Cannot do a reroll of a ${roll.type}.`);
      }
    }
    generateDiceRoll(die, order) {
      const roll = this.getRoll(die);
      const critical = roll === die ? "success" : roll === 1 ? "failure" : null;
      return {
        critical,
        die,
        matched: false,
        order,
        roll,
        success: null,
        successes: 0,
        failures: 0,
        type: "roll",
        valid: true,
        value: roll
      };
    }
    generateFateRoll(order) {
      const roll = Math.floor(this.randFunction() * 3) - 1;
      return {
        matched: false,
        order,
        roll,
        success: null,
        successes: 0,
        failures: 0,
        type: "fateroll",
        valid: true,
        value: roll
      };
    }
  };

  // app/modules/damage/mathWorker.ts
  var averageDiceRoller = new DiceRoller({ alwaysAverage: true });
  var critDiceRoller = new DiceRoller({ alwaysCrit: true });
  var regularDiceRoller = new DiceRoller();
  var ZERO = new import_bigfraction.default(0);
  var ONE = new import_bigfraction.default(1);
  var NINE_FIVE = new import_bigfraction.default(19, 20);
  var OH_FIVE = new import_bigfraction.default(1, 20);
  var zero_pmf = () => /* @__PURE__ */ new Map([[0, ONE]]);
  var clean_zeros = (pmf) => new Map([...pmf.entries()].filter(([_, v]) => !v.equals(ZERO)));
  var clean_jpm = (map) => new Map([...map.entries()].filter(([_, v]) => v.size !== 0));
  var weighted_mean_pmf = (pmf) => [...pmf.entries()].reduce(
    (acc, [d, p]) => acc.add(new import_bigfraction.default(d).mul(p)),
    ZERO
  );
  var dieMean = (die) => die.sides / 2 + 0.5;
  var ADVANTAGE = /* @__PURE__ */ ((_ADVANTAGE) => {
    _ADVANTAGE[_ADVANTAGE["DISADVANTAGE"] = -1] = "DISADVANTAGE";
    _ADVANTAGE[_ADVANTAGE["NONE"] = 0] = "NONE";
    _ADVANTAGE[_ADVANTAGE["ADVANTAGE"] = 1] = "ADVANTAGE";
    _ADVANTAGE[_ADVANTAGE["SUPERADVANTAGE"] = 2] = "SUPERADVANTAGE";
    return _ADVANTAGE;
  })(ADVANTAGE || {});
  var getEmptyDamager = (damagers) => ({
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
    gwmSS: false
  });
  var numberRange = (start, end) => new Array(end - start).fill(void 0).map((d, i) => i + start);
  var ACs = numberRange(1, 30 + 1);
  var computeDamageInfo = (damageInfo) => damageInfo;
  var diceToPMF = (dice) => new Map(numberRange(1, dice.sides + 1).map((v) => [v, new import_bigfraction.default(1, dice.sides)]));
  var flatModToPMF = (flatMod) => /* @__PURE__ */ new Map([[flatMod.number, ONE]]);
  var counterify = (arr) => arr.reduce((acc, curr) => (acc[curr] ? ++acc[curr] : acc[curr] = 1, acc), {});
  var counterToPMF = (counter) => {
    const totalCount = Object.values(counter).reduce((acc, n) => acc + n, 0);
    return new Map(Object.entries(counter).map(([k, v]) => [Number(k), new import_bigfraction.default(v).div(totalCount)]));
  };
  var removePmfZeroes = (pmf) => new Map([...pmf.entries()].filter(([_, v]) => !v.equals(ZERO)));
  var convolvePMFs = (pmfX_, pmfY_, add) => {
    const pmfX = new Map([...pmfX_.entries()].sort());
    const pmfY = new Map([...pmfY_.entries()].sort());
    const absMin = Math.min(...pmfX.keys(), ...pmfY.keys()) - (add ? 0 : Math.max(...pmfY.keys()));
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
                (pmfX.get(valX) ?? ZERO).mul(pmfY.get(valY) ?? ZERO)
              ])
            )
          )
        ])
      )
    );
    const pmf = /* @__PURE__ */ new Map();
    [...jointProbMap.entries()].forEach(([x, xPMF]) => {
      [...xPMF.entries()].forEach(([y, prob]) => {
        const k = add ? Number(x) + Number(y) : Number(x) - Number(y);
        pmf.set(k, (pmf.get(k) ?? ZERO).add(prob));
      });
    });
    return pmf;
  };
  var addPMFs = (pmfs) => pmfs.reduce((acc, curr) => convolvePMFs(acc, curr, true), zero_pmf());
  var getAttackRollPMF = (fullAttackRoll) => {
    if (/^[\dd+]+$/.test(fullAttackRoll)) {
      const dicePMFs = fullAttackRoll.split("+").flatMap((diceString) => {
        const match = diceString.match(/^(?<count>\d*)((?<dice>d)(?<sides>\d+))?$/i);
        if (!match?.groups) {
          return [];
        }
        const { dice, sides, count } = match.groups;
        if (dice === "d" && sides) {
          return numberRange(0, Number(count ?? 1)).map(() => ({ sides: Number(sides?.trim()) })).map(diceToPMF);
        }
        return flatModToPMF({ number: Number(count) });
      });
      return addPMFs(dicePMFs);
    }
    const N = 1e4;
    return new Map(
      Object.entries(
        [...Array(N)].map((_) => regularDiceRoller.roll(fullAttackRoll).value).reduce(
          (acc, curr) => (acc[curr] ? ++acc[curr] : acc[curr] = 1, acc),
          {}
        )
      ).map(([k, v]) => [Number(k), new import_bigfraction.default(v).div(N)])
    );
  };
  var getDamagePMFForDie = (die, { greatWeaponFighting, elementalAdept }) => {
    const regDiceVals = numberRange(1, die.sides + 1);
    const eaDiceVals = regDiceVals.map((v) => Math.max(2, v));
    const diceValues = elementalAdept ? eaDiceVals : regDiceVals;
    if (greatWeaponFighting) {
      return counterToPMF(counterify(regDiceVals.map((v) => v <= 2 ? diceValues : numberRange(0, diceValues.length).map((_) => v)).flat()));
    }
    return counterToPMF(counterify(diceValues));
  };
  var getDamageRollPMF = (fullDamageRoll, weaponDamage, damageFeatures, crit) => {
    if (/^[\dd+]+$/.test(fullDamageRoll)) {
      const dicePMFs = fullDamageRoll.split("+").flatMap((diceString) => {
        const match = diceString.match(/^(?<count>\d*)((?<dice>d)(?<sides>\d+))?$/i);
        if (!match?.groups) {
          return [];
        }
        const { dice, sides, count } = match.groups;
        if (dice === "d" && sides) {
          return numberRange(0, Number(count ?? 1)).map(() => ({ sides: Number(sides?.trim()) })).map((d) => {
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
    const N = 1e4;
    return new Map(
      Object.entries(
        counterify(
          [...Array(N)].map((_) => regularDiceRoller.roll(fullDamageRoll).value)
        )
      ).map(([k, v]) => [Number(k), new import_bigfraction.default(v).div(N)])
    );
  };
  var jointProbPMFs = (jpm_pmfs) => {
    const pmf = /* @__PURE__ */ new Map();
    const keySet = /* @__PURE__ */ new Set([
      ...jpm_pmfs.map((jp) => [...jp.pmf.keys()]).flat(2)
    ]);
    [...keySet].forEach(
      (k) => pmf.set(
        k,
        jpm_pmfs.reduce(
          (acc, n) => acc.add((n.pmf.get(k) || ZERO).mul(n.chance)),
          ZERO
        )
      )
    );
    return pmf;
  };
  var printPMF = (pmf, name = "") => {
    console.log(`${name}`);
    console.log(
      new Map(
        [...pmf.entries()].sort(([kl, _vl], [kr, _vr]) => kl - kr).map(([k, v]) => [k, new import_bigfraction.default(v).valueOf().toFixed(6)])
      )
    );
    console.log(
      `${name}: SUM: ${[...pmf.values()].reduce((acc, n) => acc.add(n), ZERO).toString()}`
    );
  };
  var printPMFRepr = (pmf) => {
    console.log(`,
expected: new Map([
${[...pmf.entries()].sort(([k1, _v1], [k2, _v2]) => k1 - k2).map(([k, v]) => `[${k}, new Fraction(${v.n},${v.d})]`).join(",\n")}
])`);
  };
  var pLucky = ({ p, hitMods }) => {
    if (hitMods.lucky) {
      switch (hitMods.advantage) {
        case 2 /* SUPERADVANTAGE */:
          return p.pow(2).mul(1200).sub(p.mul(2340)).add(1141).mul(p).div(8e3);
        case 1 /* ADVANTAGE */:
          return new import_bigfraction.default(39, 400).mul(p).sub(p.pow(2).div(10));
        case -1 /* DISADVANTAGE */:
          return p.pow(2).div(10);
        case 0 /* NONE */:
          return p.div(20);
      }
    }
    return ZERO;
  };
  var pHitBase = ({ p, hitMods }) => {
    if (hitMods.advantage > 0) {
      return ONE.sub(ONE.sub(p).pow(hitMods.advantage + 1));
    }
    if (hitMods.advantage < 0) {
      return p.pow(Math.abs(hitMods.advantage) + 1);
    }
    return p;
  };
  var factorHitMods = ({ pRaw, hitMods }) => pHitBase({ p: pRaw, hitMods }).add(pLucky({ p: pRaw, hitMods }));
  var pHit = ({ bonus, ac, hitMods }) => {
    const pRaw = Math.min(0.95, Math.max(0.05, (21 - ac + bonus) / 20));
    return factorHitMods({ pRaw: new import_bigfraction.default(pRaw), hitMods });
  };
  var computeHitProbability = (fullAttackRoll, ac, hitMods) => {
    const attackRollPMF = getAttackRollPMF(fullAttackRoll);
    const fullPhit = [...attackRollPMF.entries()].map(([attackBonus, likelihood]) => likelihood.mul(pHit({ bonus: Number(attackBonus), ac, hitMods }))).reduce((a, b) => a.add(b), ZERO);
    return fullPhit;
  };
  var computeHitMap = ({
    hitProbByAC,
    regularDamagePMF,
    critDamagePMF,
    missDamagePMF,
    damageInfo
  }) => new Map(
    ACs.map((ac) => {
      const hitProb = hitProbByAC.get(ac);
      const critProb = pHit({
        bonus: 0,
        ac: 21 - damageInfo.critFaceCount,
        hitMods: damageInfo.hitMods
      });
      const jpms = [
        { pmf: regularDamagePMF, chance: hitProb.sub(critProb) },
        { pmf: critDamagePMF, chance: critProb },
        { pmf: missDamagePMF, chance: ONE.sub(hitProb) }
      ];
      const singleDamage = jointProbPMFs(jpms);
      const output = addPMFs(numberRange(0, damageInfo.attackCount).map((_) => singleDamage));
      return [ac, output];
    })
  );
  var getAverageDamage = (damagePMFByAC, ac) => {
    const pmf = damagePMFByAC.get(ac);
    return weighted_mean_pmf(pmf);
  };
  var computeDamageResult = (damageInfo) => {
    const fullAttackRoll = damageInfo.attack.join("+");
    const hitProbByAC = new Map(ACs.map((ac) => [ac, computeHitProbability(fullAttackRoll, ac, damageInfo.hitMods)]));
    const regularDamagePMF = getDamageRollPMF(damageInfo.damage.join("+"), true, damageInfo.damageFeatures, false);
    const critDamagePMF = getDamageRollPMF(damageInfo.damage.join("+"), true, damageInfo.damageFeatures, true);
    const missDamagePMF = zero_pmf();
    return {
      hitProbMapByAC: computeHitMap({ hitProbByAC, regularDamagePMF, critDamagePMF, missDamagePMF, damageInfo }),
      averageDamage: weighted_mean_pmf(regularDamagePMF).mul(damageInfo.attackCount),
      regularDamagePMF,
      util: {
        ONE,
        ZERO
      }
    };
  };
  globalThis.onmessage = (e) => {
    const damageInfo = e.data;
    const damageResult = computeDamageResult(damageInfo);
    globalThis.postMessage(damageResult);
  };
})();
/**
 * @license Fraction.js v4.2.1 20/08/2023
 * https://www.xarg.org/2014/03/rational-numbers-in-javascript/
 *
 * Copyright (c) 2023, Robert Eisele (robert@raw.org)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 **/
