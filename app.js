(function () {
  "use strict";

  const form = document.getElementById("cd-form");
  const elF = document.getElementById("F");
  const elT = document.getElementById("T");
  const elFout = document.getElementById("F-out");
  const elTout = document.getElementById("T-out");
  const elN = document.getElementById("n");
  const elNout = document.getElementById("n-out");
  const tWarn = document.getElementById("t-warn");
  const result = document.getElementById("result");
  const cdValue = document.getElementById("cd-value");
  const gradeTitle = document.getElementById("grade-title");
  const gradeDesc = document.getElementById("grade-desc");
  const breakdownText = document.getElementById("breakdown-text");

  function syncTRange() {
    const f = parseInt(elF.value, 10);
    elT.max = String(f);
    let t = parseInt(elT.value, 10);
    if (t > f) {
      elT.value = String(f);
      t = f;
      tWarn.classList.remove("hidden");
    } else {
      tWarn.classList.add("hidden");
    }
    elFout.textContent = `${elF.value}명`;
    elTout.textContent = `${elT.value}명`;
  }

  function nLabel(n) {
    const penalty = 10 * n * n;
    return `${n}차 (−${penalty}점)`;
  }

  function updateNOut() {
    const n = parseInt(elN.value, 10);
    elNout.textContent = nLabel(n);
  }

  elF.addEventListener("input", syncTRange);
  elT.addEventListener("input", () => {
    tWarn.classList.add("hidden");
    elTout.textContent = `${elT.value}명`;
  });
  elN.addEventListener("input", updateNOut);

  syncTRange();
  updateNOut();

  /**
   * CD = (1.2 * (F^T + 15) * (C * (m + p))) / s - 30V - 10n²
   */
  function computeCD(F, T, C, m, p, V, s, n) {
    const fPowT = Math.pow(F, T);
    const numerator = 1.2 * (fPowT + 15) * (C * (m + p));
    const main = numerator / s;
    const penaltyV = 30 * V;
    const penaltyN = 10 * n * n;
    const CD = main - penaltyV - penaltyN;
    return {
      CD,
      fPowT,
      numerator,
      main,
      penaltyV,
      penaltyN,
    };
  }

  function gradeFor(cd) {
    if (cd < 0) {
      return {
        key: "disaster",
        title: "재앙",
        desc: "절대 금지. 절대 가면 안 되는 재앙 수준의 회식.",
      };
    }
    if (cd >= 1500) {
      return {
        key: "legend",
        title: "전설의 회식",
        desc: "힐링. 회사에 뼈를 묻고 싶어지는 기적의 회식.",
      };
    }
    if (cd >= 300) {
      return {
        key: "good",
        title: "가즈아~",
        desc: "훌륭한 저녁. 즐겁게 참석 가능. 다음 날 컨디션까지 좋아짐.",
      };
    }
    if (cd >= 70) {
      return {
        key: "ok",
        title: "가볼만함",
        desc: "메뉴나 멤버 중 하나라도 좋으면 참석.",
      };
    }
    if (cd >= 30) {
      return {
        key: "meh",
        title: "애매함",
        desc: "메뉴가 최애거나 소고기면 가고, 아니면 다시 생각.",
      };
    }
    if (cd >= 0) {
      return {
        key: "bad",
        title: "제발 가지마",
        desc: "집에서 넷플릭스 보면서 라면 끓여 먹는 게 육체적/정신적으로 이득.",
      };
    }
    return {
      key: "disaster",
      title: "재앙",
      desc: "절대 금지. 절대 가면 안 되는 재앙 수준의 회식.",
    };
  }

  function formatNum(x) {
    if (Number.isInteger(x)) return String(x);
    return x.toFixed(4).replace(/\.?0+$/, "");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const F = parseInt(elF.value, 10);
    let T = parseInt(elT.value, 10);
    if (T > F) T = F;

    const C = parseFloat(form.querySelector('input[name="C"]:checked').value);
    const m = parseInt(document.getElementById("m").value, 10);
    const p = parseInt(document.getElementById("p").value, 10);
    const V = parseInt(document.getElementById("V").value, 10) || 0;
    const s = parseFloat(document.getElementById("s").value);
    const n = parseInt(elN.value, 10);

    const out = computeCD(F, T, C, m, p, V, s, n);
    const g = gradeFor(out.CD);

    cdValue.textContent = formatNum(Math.round(out.CD * 100) / 100);
    gradeTitle.textContent = `[${g.title}]`;
    gradeDesc.textContent = g.desc;

    result.classList.remove("hidden");
    result.className = "result result--" + g.key;

    breakdownText.textContent = [
      `F=${F}, T=${T}  →  F^T = ${formatNum(out.fPowT)}`,
      `분자: 1.2 × (${formatNum(out.fPowT)} + 15) × (${C} × (${m} + ${p})) = ${formatNum(out.numerator)}`,
      `첫 항: ${formatNum(out.numerator)} / ${s} = ${formatNum(out.main)}`,
      `빌런: −30 × ${V} = −${out.penaltyV}`,
      `차수: −10 × ${n}² = −${out.penaltyN}`,
      `CD = ${formatNum(out.main)} − ${out.penaltyV} − ${out.penaltyN} = ${formatNum(out.CD)}`,
    ].join("\n");

    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
})();
