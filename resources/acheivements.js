export const achievements = [
  {
    id: "iron_1k",
    name: "Iron Maiden",
    desc: "Mine 1,000 iron.",
    resource: "iron",
    threshold: 1000,
    bonus: { type: "mult", target: "iron.perSecond", value: 1.1 },
  },
];
