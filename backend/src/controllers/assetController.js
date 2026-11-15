const prisma = require('../db');

exports.getAllAssets = async (req, res) => {
  try {
    const { type, stationId, condition } = req.query;
    const where = {};

    if (type) where.type = type;
    if (stationId) where.stationId = parseInt(stationId);
    if (condition) where.condition = condition;

    const assets = await prisma.infrastructureAsset.findMany({
      where,
      include: {
        station: {
          select: { id: true, code: true, name: true, km: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    res.json({ success: true, count: assets.length, data: assets });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data aset LAA' });
  }
};

exports.getAllSections = async (req, res) => {
  try {
    const sections = await prisma.trackSection.findMany({
      orderBy: { id: 'asc' },
    });
    res.json({ success: true, count: sections.length, data: sections });
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data seksi lintasan' });
  }
};
