import { PrismaClient } from "@prisma/client";
import type { EducationLevel } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_DATA: { educationLevel: EducationLevel; subjects: { name: string; topics: string[] }[] }[] = [
  {
    educationLevel: "MIDDLE_SCHOOL",
    subjects: [
      { name: "Matematik", topics: ["Kesirler", "Denklemler", "Oran ve Orantı"] },
      { name: "Fen Bilimleri", topics: ["Hücre", "Kuvvet ve Hareket"] },
    ],
  },
  {
    educationLevel: "HIGH_SCHOOL",
    subjects: [
      { name: "Matematik", topics: ["Türev", "İntegral", "Limit"] },
      { name: "Fizik", topics: ["Vektörler", "Kuvvet ve Newton Yasaları"] },
    ],
  },
  {
    educationLevel: "UNIVERSITY",
    subjects: [
      { name: "Veri Yapıları", topics: ["Bağlı Listeler", "Ağaçlar"] },
      { name: "Lineer Cebir", topics: ["Matrisler", "Vektör Uzayları"] },
    ],
  },
  {
    educationLevel: "LIFELONG_LEARNER",
    subjects: [
      { name: "Yazılım Geliştirme", topics: ["React", "TypeScript"] },
      { name: "Kişisel Gelişim", topics: ["Zaman Yönetimi"] },
    ],
  },
];

async function main() {
  for (const { educationLevel, subjects } of SEED_DATA) {
    for (const { name, topics } of subjects) {
      let subject = await prisma.subject.findFirst({
        where: { name, userId: null, educationLevel },
      });
      if (!subject) {
        subject = await prisma.subject.create({
          data: { name, educationLevel, userId: null },
        });
        console.log(`Olusturuldu: ${educationLevel} / ${name}`);
      }

      for (const topicName of topics) {
        const existingTopic = await prisma.topic.findFirst({
          where: { name: topicName, subjectId: subject.id },
        });
        if (!existingTopic) {
          await prisma.topic.create({
            data: { name: topicName, subjectId: subject.id },
          });
          console.log(`  + Konu: ${topicName}`);
        }
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
