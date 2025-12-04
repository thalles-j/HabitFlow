import { prisma } from '../db.js';

export async function listLogs(req, res) {
  try {
    const { page = 1, pageSize = 10, habitId, dateFrom, dateTo, status, sort = 'date', order = 'desc' } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);
    const where = {
      habit: { userId: req.userId },
      AND: [
        habitId ? { habitId: Number(habitId) } : {},
        status ? { status } : {},
        dateFrom || dateTo ? {
          date: {
            gte: dateFrom ? new Date(dateFrom) : undefined,
            lte: dateTo ? new Date(dateTo) : undefined,
          }
        } : {},
      ]
    };

    const total = await prisma.habitLog.count({ where });
    const data = await prisma.habitLog.findMany({
      where,
      skip,
      take: Number(pageSize),
      orderBy: { [sort]: order === 'asc' ? 'asc' : 'desc' },
    });

    res.json({ data, page: Number(page), pageSize: Number(pageSize), total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list logs', details: err.message });
  }
}

export async function createLog(req, res) {
  try {
    const { habitId, date, status, notes } = req.body;
    const habit = await prisma.habit.findFirst({ where: { id: Number(habitId), userId: req.userId } });
    if (!habit) return res.status(404).json({ error: 'Hábito não encontrado' });
    const log = await prisma.habitLog.create({ data: { habitId: Number(habitId), date: new Date(date), status, notes } });
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create log', details: err.message });
  }
}

export async function updateLog(req, res) {
  try {
    const id = Number(req.params.id);
    const { date, status, notes } = req.body;
    const existing = await prisma.habitLog.findFirst({
      where: { id, habit: { userId: req.userId } },
    });
    if (!existing) return res.status(404).json({ error: 'Registro não encontrado' });
    const log = await prisma.habitLog.update({
      where: { id },
      data: { date: date ? new Date(date) : undefined, status, notes },
    });
    res.json(log);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update log', details: err.message });
  }
}

export async function deleteLog(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.habitLog.findFirst({ where: { id, habit: { userId: req.userId } } });
    if (!existing) return res.status(404).json({ error: 'Registro não encontrado' });
    await prisma.habitLog.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete log', details: err.message });
  }
}
