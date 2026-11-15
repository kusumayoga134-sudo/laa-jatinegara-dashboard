const prisma = require('../db');

exports.getAllStations = async (req, res) => {
  try {
    const stations = await prisma.station.findMany({
      include: {
        switches: true,
        assets: true,
      },
      orderBy: {
        kmNumeric: 'asc',
      },
    });
    res.json({ success: true, data: stations });
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data stasiun' });
  }
};

exports.getStationById = async (req, res) => {
  try {
    const { id } = req.params;
    const station = await prisma.station.findFirst({
      where: isNaN(id) ? { code: id.toUpperCase() } : { id: parseInt(id) },
      include: {
        switches: true,
        assets: true,
      },
    });

    if (!station) {
      return res.status(404).json({ success: false, message: 'Stasiun tidak ditemukan' });
    }

    res.json({ success: true, data: station });
  } catch (error) {
    console.error('Error fetching station by id:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail stasiun' });
  }
};
