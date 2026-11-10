const $ = (s) => document.querySelector(s),
  esc = (s) =>
    String(s).replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );
const S = {
  top: { amt: 100, m: "MobilePay", busy: 0 },
  sel: "campus",
  f: "All",
  mine: new Set(),
  bal: 100,
  tx: [{ d: "Welcome credit", a: 100 }],
  teams: [{ n: "Campus FC", m: ["You"] }],
  room: "General",
  hrs: {},
  rent: [],
};
const pl = (id) => places.find((p) => p.id === id),
  left = (a) => a.tot - a.j;
function show(v) {
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.toggle("on", t.dataset.v === v));
  document
    .querySelectorAll(".view")
    .forEach((s) => s.classList.toggle("on", s.id === "v-" + v));
  if (v === "map") setTimeout(() => map.invalidateSize(), 50);
}
function jb(a) {
  const full = left(a) <= 0 && !S.mine.has(a.id);
  return `<button class="btn" data-j="${a.id}" ${S.mine.has(a.id) || full ? "disabled" : ""}>${S.mine.has(a.id) ? "You're in" : full ? "Full" : a.v}</button>`;
}
const sp = (a) => (left(a) <= 0 ? "Full" : left(a) + " spots left");
const AV = ["#2457F5", "#FF8A3D", "#17B26A", "#8B5CF6", "#E5484D", "#0EA5A4"];
function av(a) {
  const n = Math.min(a.tot, 5),
    f = Math.min(a.j, n);
  let h = "";
  for (let i = 0; i < n; i++)
    h +=
      i < f
        ? `<span class="av" style="background:${AV[(a.id + i) % 6]}">${"MSJILEAKTN"[(a.id + i) % 10]}</span>`
        : '<span class="av em">+</span>';
  return `<div class="avs">${h}<span class="cnt">${a.j}/${a.tot} players</span></div>`;
}
function mc(a, mp) {
  return `<div class="mc"><div class="mh"><span class="when">${esc(a.w)}</span><span class="tag">${esc(a.type)}</span></div><div class="t">${esc(a.t)}</div><div class="m">${pl(a.pl).name}</div>${av(a)}<div class="a">${jb(a)}<span class="spl ${left(a) <= 2 ? "low" : ""}">${sp(a)}</span>${mp ? `<button class="link" data-m="${a.pl}">Show on map</button>` : ""}</div></div>`;
}
const map = L.map("map").setView([55.862, 9.862], 14);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);
const markers = {};
const lg = L.control({ position: "topright" });
lg.onAdd = () => {
  const d = L.DomUtil.create("div", "legend");
  d.innerHTML = '<i class="bx2"></i> Opportunity Box';
  return d;
};
lg.addTo(map);
function rPins() {
  places.forEach((p) => {
    const n = acts.filter((a) => a.pl === p.id).length;
    const icon = L.divIcon({
      className: "",
      html: `<div class="mk ${p.id === S.sel ? "sel" : ""}">${n}${p.box ? '<i class="bx"></i>' : ""}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
    if (markers[p.id]) markers[p.id].setIcon(icon);
    else
      markers[p.id] = L.marker([p.lat, p.lng], {
        icon,
        title: p.name,
        keyboard: true,
      })
        .addTo(map)
        .on("click", () => {
          S.sel = p.id;
          rPins();
          rSheet();
        });
  });
}
function rSheet() {
  const p = pl(S.sel),
    l = acts.filter((a) => a.pl === S.sel),
    it = items.filter((i) => i.pl === S.sel);
  $("#sheet").innerHTML =
    `<h2>${p.name}</h2><div class="kind">${p.kind}</div>` +
    (it.length
      ? `<div class="boxcard"><div><b>Opportunity Box here</b><div class="w">${it.map((i) => i.n + " (" + i.stock + ")").join(" · ")}</div></div><button class="btn" data-v="rent">Rent</button></div>`
      : "") +
    (l.length
      ? l.map((a) => mc(a, false)).join("")
      : '<div class="w">Nothing planned here yet.</div>');
}
function rBoard() {
  const ty = ["All", ...new Set(acts.map((a) => a.type))];
  $("#filters").innerHTML = ty
    .map(
      (t) =>
        `<button class="chip ${t === S.f ? "on" : ""}" data-f="${t}">${t}</button>`,
    )
    .join("");
  $("#list").innerHTML = acts
    .filter((a) => S.f === "All" || a.type === S.f)
    .map((a) => mc(a, true))
    .join("");
}
function rPeople() {
  const q = $("#p-q").value.toLowerCase(),
    tm = S.teams[+$("#t-sel").value || 0];
  $("#plist").innerHTML =
    people
      .filter((p) => (p.n + p.s.join() + p.l).toLowerCase().includes(q))
      .map((p) => {
        const inT = tm.m.includes(p.n);
        return `<div class="card"><div class="t">${p.n}</div><div class="m">${p.s.join(" · ")} · ${p.l}</div><div class="a"><button class="btn ${inT ? "" : "alt"}" data-add="${p.n}" ${inT ? "disabled" : ""}>${inT ? "In " + esc(tm.n) : "Add to " + esc(tm.n)}</button></div></div>`;
      })
      .join("") || '<p class="w">Nobody matches yet.</p>';
}
function rTeams() {
  const v = $("#t-sel").value;
  $("#t-sel").innerHTML = S.teams
    .map((t, i) => `<option value="${i}">${esc(t.n)}</option>`)
    .join("");
  if (v) $("#t-sel").value = v;
  $("#tlist").innerHTML = S.teams
    .map(
      (t) =>
        `<div class="card"><div class="t">${esc(t.n)}</div><div class="m">${t.m.map(esc).join(", ")}</div></div>`,
    )
    .join("");
}
function rChat() {
  $("#rooms").innerHTML = Object.keys(rooms)
    .map(
      (r) =>
        `<button class="chip ${r === S.room ? "on" : ""}" data-r="${r}">${r}</button>`,
    )
    .join("");
  $("#topic").textContent = rooms[S.room].topic;
  $("#msgs").innerHTML = rooms[S.room].m
    .map(
      (m) =>
        `<div class="msg ${m[0] === "You" ? "me" : ""}"><i>${esc(m[0])}</i>${esc(m[1])}</div>`,
    )
    .join("");
  $("#msgs").scrollTop = 1e5;
}
function rRent() {
  $("#active").innerHTML = S.rent.length
    ? "<h3>Your rentals</h3>" +
      S.rent
        .map(
          (r, i) =>
            `<div class="locker"><div><b>Locker ${r.l} opened · code ${r.c}</b><div class="w">${r.n} at ${pl(r.pl).name} · ${r.h}h</div></div><button class="btn alt" data-ret="${i}">Return</button></div>`,
        )
        .join("")
    : "";
  $("#items").innerHTML =
    "<h3>Available now</h3>" +
    items
      .map((i) => {
        const h = S.hrs[i.id] || 1;
        return `<div class="card"><div class="t">${i.n}</div><div class="s"><b>${i.price} kr</b>per hour</div><div class="m">Opportunity Box · ${pl(i.pl).name} · deposit ${i.dep} kr · ${i.stock} in stock</div><div class="a"><select data-h="${i.id}" aria-label="Hours" style="width:auto">${[1, 2, 3, 4].map((x) => `<option ${x === h ? "selected" : ""}>${x}</option>`).join("")}</select><span class="w">hours</span><button class="btn" data-rent="${i.id}" ${i.stock ? "" : "disabled"}>${i.stock ? "Rent · " + (i.price * h + i.dep) + " kr" : "Out of stock"}</button></div></div>`;
      })
      .join("");
}
const AMTS = [50, 100, 200, 500],
  METH = ["MobilePay", "Card", "Apple Pay"];
function rTop() {
  const t = S.top,
    okAmt = t.amt >= 10 && t.amt <= 1000;
  $("#t-amts").innerHTML = AMTS.map(
    (x) =>
      `<button class="chip ${x === t.amt ? "on" : ""}" data-ta="${x}">${x} kr</button>`,
  ).join("");
  $("#t-ms").innerHTML = METH.map(
    (m) =>
      `<button class="chip ${m === t.m ? "on" : ""}" data-tm="${m}">${m}</button>`,
  ).join("");
  $("#t-sum").textContent = okAmt
    ? `You pay ${t.amt} kr with ${t.m} (demo). New balance: ${S.bal + t.amt} kr.`
    : "Enter an amount between 10 and 1000 kr.";
  $("#t-pay").disabled = !okAmt || !!t.busy;
  $("#t-pay").textContent = t.busy
    ? "Processing…"
    : "Pay " + (okAmt ? t.amt : "") + " kr";
}
$("#t-c").addEventListener("input", (e) => {
  S.top.amt = +e.target.value || 0;
  rTop();
});
function rWallet() {
  const dep = S.rent.reduce((s, r) => s + r.dep, 0);
  $("#w-dep").textContent = dep
    ? "In deposit: " + dep + " kr (refunded when you return the gear)"
    : "";
  document
    .querySelectorAll(".balv")
    .forEach((b) => (b.textContent = S.bal + " kr"));
  rTop();
  document
    .querySelectorAll(".bal")
    .forEach((b) => (b.textContent = S.bal + " kr"));
  $("#w-bal").textContent = S.bal + " kr";
  $("#txs").innerHTML = S.tx
    .map(
      (t) =>
        `<div class="tx"><span>${esc(t.d)}</span><b class="${t.a < 0 ? "low" : ""}">${t.a > 0 ? "+" : ""}${t.a} kr</b></div>`,
    )
    .join("");
}
function all() {
  rPins();
  rSheet();
  rBoard();
  rPeople();
  rTeams();
  rChat();
  rRent();
  rWallet();
}
function pay(d, a) {
  S.bal += a;
  S.tx.unshift({ d, a });
}
document.addEventListener("click", (e) => {
  const t = e.target.closest(
    "[data-v],[data-p],[data-j],[data-f],[data-m],[data-a],[data-add],[data-r],[data-rent],[data-ret],[data-ta],[data-tm]",
  );
  if (!t) return;
  const d = t.dataset;
  if (d.v) show(d.v);
  else if (d.p) {
    S.sel = d.p;
    rPins();
    rSheet();
  } else if (d.j) {
    const a = acts.find((x) => x.id == d.j);
    if (!S.mine.has(a.id) && left(a) > 0) {
      a.j++;
      S.mine.add(a.id);
      all();
    }
  } else if (d.f) {
    S.f = d.f;
    rBoard();
  } else if (d.m) {
    S.sel = d.m;
    show("map");
    all();
    const p = pl(d.m);
    map.setView([p.lat, p.lng], 16);
    scrollTo(0, 0);
  } else if (d.add) {
    const tm = S.teams[+$("#t-sel").value || 0];
    if (!tm.m.includes(d.add)) {
      tm.m.push(d.add);
      rTeams();
      rPeople();
      $("#t-ok").textContent =
        d.add + " added to " + tm.n + ". See it under Teams below.";
    }
  } else if (d.r) {
    S.room = d.r;
    rChat();
  } else if (d.ta) {
    S.top.amt = +d.ta;
    $("#t-c").value = "";
    rTop();
  } else if (d.tm) {
    S.top.m = d.tm;
    rTop();
  } else if (d.a === "topen") {
    $("#topup").hidden = false;
    $("#w-ok").textContent = "";
    rTop();
    $("#topup").scrollIntoView({ behavior: "smooth", block: "center" });
  } else if (d.a === "tclose") {
    $("#topup").hidden = true;
  } else if (d.a === "tpay") {
    if (S.top.busy) return;
    S.top.busy = 1;
    rTop();
    setTimeout(() => {
      const x = S.top;
      pay("Top up · " + x.m, x.amt);
      x.busy = 0;
      $("#topup").hidden = true;
      $("#w-ok").textContent =
        "+" +
        x.amt +
        " kr added with " +
        x.m +
        " (demo). Your credit is ready to use.";
      rWallet();
      rRent();
    }, 1100);
  } else if (d.rent) {
    const i = items.find((x) => x.id === d.rent),
      h = S.hrs[i.id] || 1,
      c = i.price * h + i.dep;
    if (S.bal < c) {
      S.top.amt = Math.max(50, Math.ceil((c - S.bal) / 50) * 50);
      $("#r-ok").innerHTML =
        'Not enough credit. <button class="link" data-v="wallet">Add credit</button>';
      rTop();
      return;
    }
    pay("Rent: " + i.n + " (" + h + "h) + deposit", -c);
    i.stock--;
    S.rent.push({
      id: i.id,
      n: i.n,
      pl: i.pl,
      h,
      dep: i.dep,
      l: 1 + Math.floor(Math.random() * 12),
      c: 1000 + Math.floor(Math.random() * 9000),
    });
    $("#r-ok").textContent = "Paid. Go to the box: your locker is open.";
    rRent();
    rWallet();
  } else if (d.ret !== undefined) {
    const r = S.rent.splice(+d.ret, 1)[0];
    items.find((x) => x.id === r.id).stock++;
    pay("Deposit refunded: " + r.n, r.dep);
    $("#r-ok").textContent = "Returned. Deposit refunded.";
    rRent();
    rWallet();
  } else if (d.a === "create") {
    const ti = $("#c-t").value.trim();
    if (!ti) {
      $("#c-ok").textContent = "Give your event a name first.";
      return;
    }
    const dt = $("#c-d").value,
      w =
        (dt
          ? new Date(dt).toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })
          : "Soon") +
        " · " +
        $("#c-h").value;
    acts.unshift({
      id: Date.now(),
      pl: $("#c-p").value,
      type: $("#c-ty").value,
      t: ti,
      w,
      tot: +$("#c-n").value || 8,
      j: 1,
      v: "I'm in",
    });
    $("#c-t").value = "";
    $("#c-ok").textContent =
      "Published. You are the first one in. It is now on the map and the board.";
    all();
  } else if (d.a === "team") {
    const n = $("#t-n").value.trim();
    if (n) {
      S.teams.push({ n, m: ["You"] });
      $("#t-n").value = "";
      rTeams();
      $("#t-sel").value = S.teams.length - 1;
      rPeople();
      $("#t-ok").textContent =
        'Team "' + n + '" created. Now add people to it.';
    }
  } else if (d.a === "send") {
    const v = $("#m-in").value.trim();
    if (v) {
      rooms[S.room].m.push(["You", v]);
      $("#m-in").value = "";
      rChat();
    }
  }
});
document.addEventListener("change", (e) => {
  if (e.target.dataset.h) {
    S.hrs[e.target.dataset.h] = +e.target.value;
    rRent();
  }
});
document.addEventListener("keydown", (e) => {
  const t = e.target;
  if ((e.key === "Enter" || e.key === " ") && t.dataset && t.dataset.p) {
    e.preventDefault();
    S.sel = t.dataset.p;
    rPins();
    rSheet();
  }
  if (e.key === "Enter" && t.id === "m-in")
    document.querySelector("[data-a=send]").click();
});
$("#p-q").addEventListener("input", rPeople);
$("#t-sel").addEventListener("change", () => {
  $("#t-ok").textContent = "";
  rPeople();
});
function fillPlaces() {
  const t = $("#c-ty").value,
    ok = (p) =>
      t === "Other" ||
      typeof placeTypes === "undefined" ||
      !placeTypes[p.id] ||
      placeTypes[p.id].includes(t);
  const list = places.filter(ok);
  $("#c-p").innerHTML = (list.length ? list : places)
    .map((p) => `<option value="${p.id}">${p.name}</option>`)
    .join("");
}
$("#c-ty").addEventListener("change", fillPlaces);
fillPlaces();
all();
