const prisma = require('../db');

exports.getAllSwitches = async (req, res) => {
  try {
    const { stationId, lineType, state } = req.query;
    const where = {};

    if (stationId) where.stationId = parseInt(stationId);
    if (lineType) where.lineType = lineType;
    if (state) where.currentState = state;

    const switches = await prisma.switchDevice.findMany({
      where,
      include: {
        station: {
          select: { id: true, code: true, name: true, km: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    res.json({ success: true, count: switches.length, data: switches });
  } catch (error) {
    console.error('Error fetching switches:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data pemutus beban (DS)' });
  }
};

exports.getSwitchById = async (req, res) => {
  try {
    const { id } = req.params;
    const switchItem = await prisma.switchDevice.findFirst({
      where: isNaN(id) ? { code: id.toUpperCase() } : { id: parseInt(id) },
      include: {
        station: true,
      },
    });

    if (!switchItem) {
      return res.status(404).json({ success: false, message: 'Switch tidak ditemukan' });
    }

    res.json({ success: true, data: switchItem });
  } catch (error) {
    console.error('Error fetching switch:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail switch' });
  }
};

exports.toggleSwitch = async (req, res) => {
  try {
    const { id } = req.params;
    const { operator = 'Dispatcher Pusdalopka LAA' } = req.body;

    const switchItem = await prisma.switchDevice.findFirst({
      where: isNaN(id) ? { code: id.toUpperCase() } : { id: parseInt(id) },
      include: { station: true },
    });

    if (!switchItem) {
      return res.status(404).json({ success: false, message: 'Switch tidak ditemukan' });
    }

    if (switchItem.isInterlocked) {
      return res.status(400).json({
        success: false,
        message: `Switch ${switchItem.code} dalam kondisi TERKUNCI (Interlock Safety Active). Buka kuncian sebelum mengoperasikan!`,
      });
    }

    const nextState = switchItem.currentState === 'NC' ? 'NO' : 'NC';
    const isNowClosed = nextState === 'NC';

    // Simulate electrical values
    const newVoltage = isNowClosed ? Number((1505 + Math.random() * 20).toFixed(1)) : 0.0;
    const newCurrent = isNowClosed ? Number((350 + Math.random() * 300).toFixed(1)) : 0.0;
    const newTemp = isNowClosed ? Number((35 + Math.random() * 5).toFixed(1)) : 28.0;

    const updatedSwitch = await prisma.switchDevice.update({
      where: { id: switchItem.id },
      data: {
        currentState: nextState,
        voltageValue: newVoltage,
        currentLoad: newCurrent,
        temperature: newTemp,
        lastOperated: new Date(),
        operatedBy: operator,
        status: 'NORMAL',
      },
      include: { station: true },
    });

    // Create log record
    await prisma.maintenanceLog.create({
      data: {
        targetType: 'SWITCH',
        targetCode: updatedSwitch.code,
        actionType: 'MANUAL_TOGGLE',
        technician: operator,
        description: `Pengalihan posisi sakelar ${updatedSwitch.code} (${updatedSwitch.feedSection}) dari [${switchItem.currentState}] menjadi [${nextState}] oleh ${operator}.`,
        status: 'COMPLETED',
      },
    });

    res.json({
      success: true,
      message: `Berhasil mengubah sakelar ${updatedSwitch.code} ke posisi ${nextState}`,
      data: updatedSwitch,
    });
  } catch (error) {
    console.error('Error toggling switch:', error);
    res.status(500).json({ success: false, message: 'Gagal mengoperasikan switch' });
  }
};

exports.toggleInterlock = async (req, res) => {
  try {
    const { id } = req.params;
    const { operator = 'Teknisi Proteksi LAA' } = req.body;

    const switchItem = await prisma.switchDevice.findFirst({
      where: isNaN(id) ? { code: id.toUpperCase() } : { id: parseInt(id) },
    });

    if (!switchItem) {
      return res.status(404).json({ success: false, message: 'Switch tidak ditemukan' });
    }

    const nextInterlock = !switchItem.isInterlocked;
    const updatedSwitch = await prisma.switchDevice.update({
      where: { id: switchItem.id },
      data: {
        isInterlocked: nextInterlock,
        status: nextInterlock ? 'LOCKED' : 'NORMAL',
      },
      include: { station: true },
    });

    await prisma.maintenanceLog.create({
      data: {
        targetType: 'SWITCH',
        targetCode: updatedSwitch.code,
        actionType: 'SAFETY_LOCK',
        technician: operator,
        description: `Fitur keselamatan Interlock pada sakelar ${updatedSwitch.code} diubah menjadi [${nextInterlock ? 'TERKUNCI / LOCKED' : 'TERBUKA / UNLOCKED'}].`,
        status: 'COMPLETED',
      },
    });

    res.json({
      success: true,
      message: `Interlock status ${updatedSwitch.code} diubah menjadi ${nextInterlock ? 'LOCKED' : 'UNLOCKED'}`,
      data: updatedSwitch,
    });
  } catch (error) {
    console.error('Error toggling interlock:', error);
    res.status(500).json({ success: false, message: 'Gagal mengubah status interlock' });
  }
};
