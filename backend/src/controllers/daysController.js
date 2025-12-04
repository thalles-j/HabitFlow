import { prisma } from '../db.js';
import dayjs from 'dayjs';

async function cleanupOldDays() {
  const cutoffDate = dayjs().subtract(14, 'day').startOf('day').toDate();
  try {
    await prisma.dayHabit.deleteMany({
      where: {
        day: {
          date: {
            lt: cutoffDate,
          },
        },
      },
    });

    await prisma.day.deleteMany({
      where: {
        date: {
          lt: cutoffDate,
        },
      },
    });
  } catch (error) {
    console.error('Error cleaning up old days:', error);
  }
}

export async function getSummary(req, res) {
  try {
    await cleanupOldDays();

    const summary = await prisma.$queryRaw`
      SELECT 
        D.id, 
        D.date,
        D.completed as is_completed,
        (
          SELECT 
            cast(count(*) as float)
          FROM day_habits DH
          WHERE DH.day_id = D.id
        ) as completed,
        (
          SELECT
            cast(count(*) as float)
          FROM habits H
          LEFT JOIN habit_week_days HWD ON H.id = HWD.habit_id
          WHERE
            H.user_id = ${req.userId}
            AND H.created_at <= D.date
            AND (
              (HWD.week_day = EXTRACT(DOW FROM D.date)::int)
              OR
              (H.monthly_day = EXTRACT(DAY FROM D.date)::int)
              OR
              (H.specific_date = D.date)
            )
        ) as amount
      FROM days D
    `

    res.json(summary)
  } catch (err) {
    res.status(500).json({ error: 'Failed to get summary', details: err.message });
  }
}

export async function getDay(req, res) {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Missing date parameter' });
    }

    const parsedDate = dayjs(date).startOf('day');
    const weekDay = parsedDate.get('day');
    const monthDay = parsedDate.date();

    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: {
          lte: parsedDate.toDate(),
        },
        user_id: req.userId,
        OR: [
          {
            weekDays: {
              some: {
                week_day: weekDay,
              }
            }
          },
          {
            monthly_day: monthDay
          },
          {
            specific_date: parsedDate.toDate()
          }
        ],
        NOT: {
          hides: {
            some: {
              date: parsedDate.toDate()
            }
          }
        }
      },
      include: {
        weekDays: true,
      }
    })

    const day = await prisma.day.findFirst({
      where: {
        date: {
          gte: parsedDate.toDate(),
          lt: parsedDate.add(1, 'day').toDate(),
        },
      },
      include: {
        dayHabits: true,
      }
    })

    const completedHabits = day?.dayHabits.map(dayHabit => dayHabit.habit_id) ?? []

    res.json({
      possibleHabits,
      completedHabits,
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to get day info', details: err.message });
  }
}
