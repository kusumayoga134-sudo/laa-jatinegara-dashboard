const prisma = require('../db');

const MONTH_NAMES_ID = [
  'JANUARI',
  'FEBRUARI',
  'MARET',
  'APRIL',
  'MEI',
  'JUNI',
  'JULI',
  'AGUSTUS',
  'SEPTEMBER',
  'OKTOBER',
  'NOVEMBER',
  'DESEMBER',
];

function computeTimestamp(tahun, bulan, explicitTimestamp) {
  if (explicitTimestamp) {
    const parsed = new Date(explicitTimestamp);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  const now = new Date();
  const parsedYear = tahun !== undefined && tahun !== null && tahun !== '' ? parseInt(tahun, 10) : NaN;
  const normalizedBulan = bulan ? String(bulan).trim().toUpperCase() : '';
  const monthIdx = MONTH_NAMES_ID.indexOf(normalizedBulan);

  if (!isNaN(parsedYear)) {
    const m = monthIdx >= 0 ? monthIdx : now.getMonth();
    return new Date(Date.UTC(parsedYear, m, 15, 5, 0, 0));
  }
  return now;
}

exports.getAllLogs = async (req, res) => {
  try {
    const { targetType, status, targetCode, search, limit = 500 } = req.query;
    const where = {};
    if (targetType) where.targetType = targetType;
    if (status) where.status = status;
    if (targetCode) where.targetCode = targetCode;
    if (search) {
      const trimmedSearch = String(search).trim();
      where.OR = [
        { targetCode: { contains: trimmedSearch } },
        { description: { contains: trimmedSearch } },
        { actionType: { contains: trimmedSearch } },
        { kilometer: { contains: trimmedSearch } },
        { bulan: { contains: trimmedSearch } },
        { technician: { contains: trimmedSearch } },
      ];
      if (/^\d{4}$/.test(trimmedSearch)) {
        where.OR.push({ tahun: parseInt(trimmedSearch, 10) });
      }
    }

    const logs = await prisma.maintenanceLog.findMany({
      where,
      orderBy: { id: 'desc' },
      take: parseInt(limit),
    });

    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil riwayat log perawatan' });
  }
};

exports.createLog = async (req, res) => {
  try {
    const {
      targetType,
      targetCode,
      targetId,
      lineId,
      actionType,
      kilometer,
      tahun,
      bulan,
      technician,
      description,
      status = 'COMPLETED',
      timestamp,
    } = req.body;

    if (!targetCode || !actionType) {
      return res.status(400).json({ success: false, message: 'Harap lengkapi Lokasi dan Jenis Pekerjaan' });
    }

    const now = new Date();
    const parsedYear =
      tahun !== undefined && tahun !== null && tahun !== ''
        ? parseInt(tahun, 10)
        : timestamp && !isNaN(new Date(timestamp).getTime())
        ? new Date(timestamp).getFullYear()
        : now.getFullYear();

    const normalizedBulan = bulan
      ? String(bulan).trim().toUpperCase()
      : timestamp && !isNaN(new Date(timestamp).getTime())
      ? MONTH_NAMES_ID[new Date(timestamp).getMonth()]
      : MONTH_NAMES_ID[now.getMonth()];

    const normalizedDesc = description && String(description).trim() ? String(description).trim() : '-';
    const normalizedKm = kilometer !== undefined && kilometer !== null && String(kilometer).trim() ? String(kilometer).trim() : null;
    const resolvedTargetId = targetId || lineId || null;

    const newLog = await prisma.maintenanceLog.create({
      data: {
        timestamp: computeTimestamp(parsedYear, normalizedBulan, timestamp),
        tahun: isNaN(parsedYear) ? now.getFullYear() : parsedYear,
        bulan: normalizedBulan,
        kilometer: normalizedKm,
        targetType: targetType || 'LINE',
        targetCode: String(targetCode).trim(),
        targetId: resolvedTargetId,
        actionType: String(actionType).trim(),
        technician: technician ? String(technician).trim() : null,
        description: normalizedDesc,
        status: status || 'COMPLETED',
      },
    });

    res.status(201).json({ success: true, message: 'Catatan pekerjaan berhasil dicatat', data: newLog });
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat catatan pekerjaan' });
  }
};

exports.updateLog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      targetType,
      targetCode,
      targetId,
      lineId,
      actionType,
      kilometer,
      tahun,
      bulan,
      technician,
      description,
      status,
      timestamp,
    } = req.body;

    const existing = await prisma.maintenanceLog.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Catatan pekerjaan tidak ditemukan' });
    }

    const nextTahun =
      tahun !== undefined && tahun !== null && tahun !== '' ? parseInt(tahun, 10) : existing.tahun;
    const nextBulan =
      bulan !== undefined && bulan !== null && String(bulan).trim()
        ? String(bulan).trim().toUpperCase()
        : existing.bulan;

    const shouldRecomputeTs = timestamp !== undefined || tahun !== undefined || bulan !== undefined;
    const nextTimestamp = shouldRecomputeTs ? computeTimestamp(nextTahun, nextBulan, timestamp) : undefined;
    const resolvedTargetId = targetId !== undefined ? targetId : lineId;

    const updated = await prisma.maintenanceLog.update({
      where: { id: parseInt(id) },
      data: {
        ...(targetType !== undefined && { targetType }),
        ...(targetCode !== undefined && { targetCode: String(targetCode).trim() }),
        ...(resolvedTargetId !== undefined && { targetId: resolvedTargetId || null }),
        ...(actionType !== undefined && { actionType: String(actionType).trim() }),
        ...(kilometer !== undefined && {
          kilometer: kilometer !== null && String(kilometer).trim() ? String(kilometer).trim() : null,
        }),
        ...(tahun !== undefined && !isNaN(nextTahun) && { tahun: nextTahun }),
        ...(bulan !== undefined && nextBulan && { bulan: nextBulan }),
        ...(technician !== undefined && { technician: technician ? String(technician).trim() : null }),
        ...(description !== undefined && {
          description: description && String(description).trim() ? String(description).trim() : '-',
        }),
        ...(status !== undefined && { status }),
        ...(nextTimestamp && { timestamp: nextTimestamp }),
      },
    });

    res.json({ success: true, message: 'Catatan pekerjaan berhasil diperbarui', data: updated });
  } catch (error) {
    console.error('Error updating log:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui catatan pekerjaan' });
  }
};

exports.deleteLog = async (req, res) => {
  try {
    const { id } = req.params;
    const logId = parseInt(id, 10);
    if (isNaN(logId)) {
      return res.status(400).json({ success: false, message: 'ID catatan tidak valid' });
    }

    const existing = await prisma.maintenanceLog.findUnique({
      where: { id: logId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Catatan pekerjaan tidak ditemukan' });
    }

    await prisma.maintenanceLog.delete({
      where: { id: logId },
    });

    res.json({ success: true, message: 'Catatan pekerjaan berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus catatan pekerjaan' });
  }
};
