const prisma = require('../db');

exports.getAllAlerts = async (req, res) => {
  try {
    const alerts = await prisma.scadaAlert.findMany({
      orderBy: { id: 'desc' },
    });
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data alarm SCADA' });
  }
};

exports.acknowledgeAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await prisma.scadaAlert.update({
      where: { id: parseInt(id) },
      data: {
        isAcknowledged: true,
        resolvedAt: new Date(),
      },
    });

    res.json({ success: true, message: 'Alarm berhasil dikonfirmasi (Acknowledged)', data: alert });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ success: false, message: 'Gagal mengonfirmasi alarm' });
  }
};
