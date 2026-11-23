// Extra demo data, loaded after data.js: food meetups, partner offers.
// Canteen coordinates are an approximate placeholder: right-click the exact spot in Google Maps to copy them.
places.push({ id: "canteen", name: "Campus canteen", kind: "Lunch & social meals · free to join", lat: 55.8643, lng: 9.8388 });
placeTypes.canteen = ["Food"];
acts.push(
  { id: 16, pl: "canteen", type: "Food", t: "Lunch together: meet someone new", w: "Today · 12:00", tot: 8, j: 3, v: "Join table" },
  { id: 17, pl: "canteen", type: "Food", t: "Welcome dinner for newcomers", w: "Fri · 18:30", tot: 12, j: 5, v: "Join table" }
);
// Offers from local businesses. st: "approved" (live), "pending" (waiting for approval) or "rejected".
const ads = [
  { id: 1, biz: "Local café (example)", text: "10% off for students after a game", contact: "cafe@example.com", st: "approved" },
  { id: 2, biz: "Sports shop (example)", text: "15% off balls with your Common Ground ticket", contact: "shop@example.com", st: "pending" },
];
