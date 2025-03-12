const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const genshinImpactRedeemCodeWebsitesDetails = [
  {
    name: "Rock Paper Shotgun",
    url: "https://www.rockpapershotgun.com/genshin-impact-codes-list",
    selector: "article",
  },
  {
    name: "Genshin Impact Fandom Wiki",
    url: "https://genshin-impact.fandom.com/wiki/Promotional_Code",
    selector: "code",
  },
];

async function upsertRedeemCodeWebsites() {
  for (const site of genshinImpactRedeemCodeWebsitesDetails) {
    await prisma.redeemCodeWebsite.upsert({
      where: { name: site.name },
      update: { url: site.url, selector: site.selector },
      create: site,
    });
  }
  console.log("Database seeding completed.");
}

upsertRedeemCodeWebsites()
  .catch((error) => {
    console.error("Error seeding database:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
