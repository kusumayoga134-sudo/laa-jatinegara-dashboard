const prisma = require('../db');

exports.getAllLogs = async (req, res) => {
  try {
    const { targetType, status, targetCode, search, limit = 200 } = req.query;
    const where = {};
    if (targetType) where.targetType = targetType;
    if (status) where.status = status;
    if (targetCode) where.targetCode = targetCode;
    if (search) {
      where.OR = [
        { targetCode: { contains: search } },
        { description: { contains: search } },
        { technician: { contains: search } },
        { actionType: { contains: search } },
      ];
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
    const { targetType, targetCode, actionType, technician, description, status = 'COMPLETED', timestamp } = req.body;

    if (!targetCode || !actionType || !technician || !description) {
      return res.status(400).json({ success: false, message: 'Harap lengkapi semua field log' });
    }

    const newLog = await prisma.maintenanceLog.create({
      data: {
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        targetType: targetType || 'LINE',
        targetCode,
        actionType,
        technician,
        description,
        status,
      },
    });

    res.status(201).json({ success: true, message: 'Catatan pekerjaan berhasil dicatat', data: newLog });
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat catatan pekerjaan' });
  }
};
