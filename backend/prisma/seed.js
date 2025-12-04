import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Clean up existing data
  await prisma.dayHabit.deleteMany();
  await prisma.habitWeekDays.deleteMany();
  await prisma.day.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create the specific user
  const email = 'thalles@gmail.com';
  const password = await bcrypt.hash('12345678', 10);
  const name = 'Thalles Viana';

  const user = await prisma.user.create({
    data: {
      email,
      password,
      name,
    },
  });

  console.log(`Created user: ${user.email}`);

  // 3. Create some habits
  const habitsData = [
    { title: 'Beber Água' },
    { title: 'Ler Livro' },
    { title: 'Exercício' },
    { title: 'Meditar' },
    { title: 'Estudar Code' },
    { title: 'Dormir 8h' },
    { title: 'Comer Fruta' },
    { title: 'Alongamento' },
    { title: 'Caminhada' },
    { title: 'Limpar Casa' },
    { title: 'Organizar Mesa' },
    { title: 'Ligar para Família' },
    { title: 'Aprender Inglês' },
    { title: 'Escrever Diário' },
    { title: 'Planejar Dia' },
    { title: 'Estudar Python' },
    { title: 'Praticar React' },
    { title: 'Resolver LeetCode' },
    { title: 'Ler Docs da API' },
    { title: 'Projeto Pessoal' },
  ];

  const habits = [];
  for (const h of habitsData) {
    const habit = await prisma.habit.create({
      data: {
        title: h.title,
        user_id: user.id,
        created_at: new Date('2025-01-01T00:00:00.000Z'), // Set creation date to past
      },
    });
    
    // Create WeekDays (Daily = 0-6)
    const weekDays = [0, 1, 2, 3, 4, 5, 6];
    for (const day of weekDays) {
      await prisma.habitWeekDays.create({
        data: {
          habit_id: habit.id,
          week_day: day,
        }
      });
    }

    habits.push(habit);
  }

  console.log(`Created ${habits.length} habits.`);

  // 4. Generate random history before 03/12/2025
  // We'll generate for the 60 days leading up to Dec 3rd, 2025
  const referenceDate = new Date('2025-12-03T00:00:00.000Z');
  
  for (let i = 0; i < 60; i++) {
    const date = new Date(referenceDate);
    date.setDate(date.getDate() - i);
    
    // Randomly decide if we did anything this day (80% chance)
    if (Math.random() > 0.2) {
      
      // Create the Day record
      const day = await prisma.day.create({
        data: {
          date: date,
          completed: true, // Force completed flag for seed data
        },
      });

      // For the seed, we want to show many 100% completed days.
      // So we will complete ALL habits for this day to ensure it shows up green in the calendar.
      for (const habit of habits) {
        await prisma.dayHabit.create({
          data: {
            day_id: day.id,
            habit_id: habit.id,
          },
        });
      }
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => { await prisma.$disconnect(); });
