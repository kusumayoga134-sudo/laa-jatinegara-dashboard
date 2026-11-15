const prisma = require('../db');

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalStations,
      switches,
      totalAssets,
      totalSections,
      unackAlerts,
      recentLogs,
    ] = await Promise.all([
      prisma.station.count(),
      prisma.switchDevice.findMany(),
      prisma.infrastructureAsset.count(),
      prisma.trackSection.count(),
      prisma.scadaAlert.count({ where: { isAcknowledged: false } }),
      prisma.maintenanceLog.count(),
    ]);

    const totalSwitches = switches.length;
    const closedSwitches = switches.filter((s) => s.currentState === 'NC').length;
    const openSwitches = switches.filter((s) => s.currentState === 'NO').length;
    const interlockedCount = switches.filter((s) => s.isInterlocked).length;

    // Calculate active power load
    const activeVoltages = switches
      .filter((s) => s.currentState === 'NC')
      .map((s) => s.voltageValue);
    const avgVoltage = activeVoltages.length
      ? (activeVoltages.reduce((a, b) => a + b, 0) / activeVoltages.length).toFixed(1)
      : '1500.0';

    const totalLoadCurrent = switches
      .filter((s) => s.currentState === 'NC')
      .reduce((sum, s) => sum + s.currentLoad, 0)
      .toFixed(1);

    res.json({
      success: true,
      data: {
        totalStations,
        totalSwitches,
        closedSwitches,
        openSwitches,
        interlockedCount,
        totalAssets,
        totalSections,
        unackAlerts,
        recentLogs,
        avgVoltage: parseFloat(avgVoltage),
        totalLoadCurrent: parseFloat(totalLoadCurrent),
        catenaryNominalVoltage: '1500 V DC',
        systemStatus: unackAlerts > 0 ? 'PERINGATAN OPERASI' : 'NORMAL SIAGA',
        resorInfo: {
          uptName: 'UPT RESOR LAA 1.9 JATINEGARA',
          daop: 'DAOP 1 JAKARTA',
          lintas: 'KRAMAT / MANGGARAI - JATINEGARA - BEKASI',
          totalLengthKm: '16.4 KM',
          feedSubstations: 4,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil statistik dashboard' });
  }
};
