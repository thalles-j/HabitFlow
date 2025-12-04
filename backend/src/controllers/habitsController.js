import { prisma } from '../db.js';
import dayjs from 'dayjs';

export async function createHabit(req, res) {
  try {
    const { title, weekDays, monthlyDay, specificDate, timeStart, timeEnd } = req.body;

    if (!title || (!weekDays?.length && !monthlyDay && !specificDate)) {
      return res.status(400).json({ message: 'Missing title or frequency configuration' });
    }

    let creationDate = dayjs().startOf('day');

    // Logic: If recurring and timeStart has passed today, start from tomorrow
    if (!specificDate && timeStart) {
      const [hours, minutes] = timeStart.split(':').map(Number);
      const now = dayjs();
      const habitTimeToday = dayjs().hour(hours).minute(minutes);

      if (now.isAfter(habitTimeToday)) {
        creationDate = creationDate.add(1, 'day');
      }
    }

    const habitData = {
      title,
      created_at: creationDate.toDate(),
      user_id: req.userId,
      time_start: timeStart,
      time_end: timeEnd,
    };

    if (weekDays && weekDays.length > 0) {
      habitData.weekDays = {
        create: weekDays.map(weekDay => ({ week_day: weekDay })),
      };
    }

    if (monthlyDay) {
      habitData.monthly_day = monthlyDay;
    }

    if (specificDate) {
      habitData.specific_date = dayjs(specificDate).startOf('day').toDate();
    }

    const habit = await prisma.habit.create({
      data: habitData
    })

    res.status(201).json(habit);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create habit', details: err.message });
  }
}

export async function deleteHabit(req, res) {
  try {
    const { id } = req.params;

    await prisma.habit.delete({
      where: {
        id: id,
      }
    });

    res.status(200).json({ message: 'Habit deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete habit', details: err.message });
  }
}

export async function toggleHabit(req, res) {
  try {
    const id = req.params.id;
    const { date } = req.body; // Expect date in body

    let toggleDate;
    if (date) {
      toggleDate = dayjs(date).startOf('day').toDate();
    } else {
      toggleDate = dayjs().startOf('day').toDate();
    }

    let day = await prisma.day.findUnique({
      where: {
        date: toggleDate,
      }
    })

    if (!day) {
      day = await prisma.day.create({
        data: {
          date: toggleDate,
        }
      })
    }

    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        day_id_habit_id: {
          day_id: day.id,
          habit_id: id,
        }
      }
    })

    if (dayHabit) {
      await prisma.dayHabit.delete({
        where: {
          id: dayHabit.id,
        }
      })
    } else {
      await prisma.dayHabit.create({
        data: {
          day_id: day.id,
          habit_id: id,
        }
      })
    }

    // Check if day is completed
    const weekDay = dayjs(toggleDate).get('day');
    const monthDay = dayjs(toggleDate).date();

    const possibleHabitsCount = await prisma.habit.count({
      where: {
        user_id: req.userId,
        created_at: { lte: toggleDate },
        OR: [
          { weekDays: { some: { week_day: weekDay } } },
          { monthly_day: monthDay }
        ]
      }
    });

    const completedHabitsCount = await prisma.dayHabit.count({
      where: { day_id: day.id }
    });

    const isCompleted = possibleHabitsCount > 0 && completedHabitsCount === possibleHabitsCount;

    await prisma.day.update({
      where: { id: day.id },
      data: { completed: isCompleted }
    });

    res.status(200).json({ isCompleted });
  } catch (err) {
    res.status(400).json({ error: 'Failed to toggle habit', details: err.message });
  }
}

export async function listHabits(req, res) {
  const habits = await prisma.habit.findMany({
    where: {
      user_id: req.userId,
    },
    include: {
      weekDays: true,
    }
  })
  res.json(habits)
}
