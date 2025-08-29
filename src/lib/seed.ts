import { prisma } from "@/lib/prisma";

export async function seedDatabase() {
  try {
    console.log("🌱 Seeding database...");

    // Create constituencies
    const constituencies = await Promise.all([
      prisma.constituency.upsert({
        where: { name: "Mumbai North" },
        update: {},
        create: {
          name: "Mumbai North",
          state: "Maharashtra",
          totalVoters: 0,
        },
      }),
      prisma.constituency.upsert({
        where: { name: "Delhi South" },
        update: {},
        create: {
          name: "Delhi South",
          state: "Delhi",
          totalVoters: 0,
        },
      }),
      prisma.constituency.upsert({
        where: { name: "Bangalore Central" },
        update: {},
        create: {
          name: "Bangalore Central",
          state: "Karnataka",
          totalVoters: 0,
        },
      }),
    ]);

    console.log("✅ Constituencies created");

    // Create candidates for each constituency
    const candidates = await Promise.all([
      // Mumbai North candidates
      prisma.candidate.upsert({
        where: { 
          constituencyId_name: {
            constituencyId: constituencies[0].id,
            name: "Rajesh Kumar"
          }
        },
        update: {},
        create: {
          name: "Rajesh Kumar",
          party: "Bharatiya Janata Party",
          symbol: "Lotus",
          constituencyId: constituencies[0].id,
        },
      }),
      prisma.candidate.upsert({
        where: { 
          constituencyId_name: {
            constituencyId: constituencies[0].id,
            name: "Priya Sharma"
          }
        },
        update: {},
        create: {
          name: "Priya Sharma",
          party: "Indian National Congress",
          symbol: "Hand",
          constituencyId: constituencies[0].id,
        },
      }),
      prisma.candidate.upsert({
        where: { 
          constituencyId_name: {
            constituencyId: constituencies[0].id,
            name: "Amit Patel"
          }
        },
        update: {},
        create: {
          name: "Amit Patel",
          party: "Aam Aadmi Party",
          symbol: "Broom",
          constituencyId: constituencies[0].id,
        },
      }),

      // Delhi South candidates
      prisma.candidate.upsert({
        where: { 
          constituencyId_name: {
            constituencyId: constituencies[1].id,
            name: "Suresh Verma"
          }
        },
        update: {},
        create: {
          name: "Suresh Verma",
          party: "Bharatiya Janata Party",
          symbol: "Lotus",
          constituencyId: constituencies[1].id,
        },
      }),
      prisma.candidate.upsert({
        where: { 
          constituencyId_name: {
            constituencyId: constituencies[1].id,
            name: "Meera Singh"
          }
        },
        update: {},
        create: {
          name: "Meera Singh",
          party: "Indian National Congress",
          symbol: "Hand",
          constituencyId: constituencies[1].id,
        },
      }),
      prisma.candidate.upsert({
        where: { 
          constituencyId_name: {
            constituencyId: constituencies[1].id,
            name: "Rahul Gupta"
          }
        },
        update: {},
        create: {
          name: "Rahul Gupta",
          party: "Aam Aadmi Party",
          symbol: "Broom",
          constituencyId: constituencies[1].id,
        },
      }),

      // Bangalore Central candidates
      prisma.candidate.upsert({
        where: { 
          constituencyId_name: {
            constituencyId: constituencies[2].id,
            name: "Krishna Reddy"
          }
        },
        update: {},
        create: {
          name: "Krishna Reddy",
          party: "Bharatiya Janata Party",
          symbol: "Lotus",
          constituencyId: constituencies[2].id,
        },
      }),
      prisma.candidate.upsert({
        where: { 
          constituencyId_name: {
            constituencyId: constituencies[2].id,
            name: "Lakshmi Devi"
          }
        },
        update: {},
        create: {
          name: "Lakshmi Devi",
          party: "Indian National Congress",
          symbol: "Hand",
          constituencyId: constituencies[2].id,
        },
      }),
      prisma.candidate.upsert({
        where: { 
          constituencyId_name: {
            constituencyId: constituencies[2].id,
            name: "Arjun Kumar"
          }
        },
        update: {},
        create: {
          name: "Arjun Kumar",
          party: "Janata Dal (Secular)",
          symbol: "Farmer",
          constituencyId: constituencies[2].id,
        },
      }),
    ]);

    console.log("✅ Candidates created");

    // Assign constituency to existing users (for testing)
    const users = await prisma.user.findMany({
      where: { constituencyId: null },
      take: 10, // Limit to first 10 users
    });

    if (users.length > 0) {
      const constituencyIds = constituencies.map(c => c.id);
      
      await Promise.all(
        users.map((user, index) =>
          prisma.user.update({
            where: { id: user.id },
            data: {
              constituencyId: constituencyIds[index % constituencyIds.length],
            },
          })
        )
      );

      console.log(`✅ Assigned constituencies to ${users.length} users`);
    }

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}
