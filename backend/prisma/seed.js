const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding UPT Resor LAA 1.9 Jatinegara Database...');

  // Clean existing data
  await prisma.scadaAlert.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.telemetryRecord.deleteMany();
  await prisma.infrastructureAsset.deleteMany();
  await prisma.switchDevice.deleteMany();
  await prisma.trackSection.deleteMany();
  await prisma.station.deleteMany();

  // 1. Seed Stations
  const stationsData = [
    {
      code: 'PND',
      name: 'ST. PONDOK JATI',
      km: 'KM 10+400',
      kmNumeric: 10.4,
      tracksCount: 2,
      platforms: 2,
      description: 'Stasiun persimpangan lintasan lingkar Jakarta menuju Kramat dan Jatinegara.',
      status: 'NORMAL',
      xPos: 11.0,
      yPos: 41.5,
    },
    {
      code: 'JNG',
      name: 'ST. JATINEGARA',
      km: 'KM 11+750',
      kmNumeric: 11.75,
      tracksCount: 8,
      platforms: 4,
      description: 'Stasiun sentral UPT Resor LAA 1.9 dengan 8 jalur, kompleks wesel dan sistem suplai listrik traksi utama.',
      status: 'NORMAL',
      xPos: 35.0,
      yPos: 32.0,
    },
    {
      code: 'KLD',
      name: 'ST. KLENDER',
      km: 'KM 15+027',
      kmNumeric: 15.027,
      tracksCount: 2,
      platforms: 2,
      description: 'Stasiun lintas hilir-hulu petak Jatinegara - Klender dengan sectioning gardu traksi.',
      status: 'NORMAL',
      xPos: 71.5,
      yPos: 45.0,
    },
    {
      code: 'BUA',
      name: 'ST. BUARAN',
      km: 'KM 17+500',
      kmNumeric: 17.5,
      tracksCount: 2,
      platforms: 2,
      description: 'Stasiun perantara petak Klender - Klender Baru dilengkapi Air Joint dan Air Section.',
      status: 'NORMAL',
      xPos: 86.5,
      yPos: 45.0,
    },
    {
      code: 'KLDB',
      name: 'ST. KLENDER BARU',
      km: 'KM 19+546',
      kmNumeric: 19.546,
      tracksCount: 2,
      platforms: 2,
      description: 'Stasiun komuter petak Buaran - Cakung dengan DS 9 & DS 10 pembatas seksi.',
      status: 'NORMAL',
      xPos: 89.0,
      yPos: 62.5,
    },
    {
      code: 'CUK',
      name: 'ST. CAKUNG',
      km: 'KM 20+943',
      kmNumeric: 20.943,
      tracksCount: 4,
      platforms: 2,
      description: 'Stasiun transit utama dengan jalur dwiganda (DDT) dan DS 11-14 proteksi petak Cakung - Kranji.',
      status: 'NORMAL',
      xPos: 76.5,
      yPos: 60.0,
    },
    {
      code: 'KRI',
      name: 'ST. KRANJI',
      km: 'KM 23+987',
      kmNumeric: 23.987,
      tracksCount: 2,
      platforms: 2,
      description: 'Stasiun gerbang perbatasan DKI Jakarta - Jawa Barat lintasan KRL Commuter Line.',
      status: 'NORMAL',
      xPos: 58.5,
      yPos: 60.5,
    },
    {
      code: 'BKS',
      name: 'ST. BEKASI',
      km: 'KM 26+403',
      kmNumeric: 26.403,
      tracksCount: 8,
      platforms: 4,
      description: 'Stasiun terminus dan emplasemen besar LAA 1.9 dengan pemutus beban DS 15-20.',
      status: 'NORMAL',
      xPos: 33.5,
      yPos: 58.5,
    },
  ];

  const createdStations = {};
  for (const st of stationsData) {
    const created = await prisma.station.create({ data: st });
    createdStations[st.code] = created;
  }

  // 2. Seed Disconnecting Switches (DS 1 - DS 20) with precise percentage coordinates on original schematic
  const switchesData = [
    {
      code: 'DS 1',
      name: 'Pemutus Daya DS 1 MRI-JNG (HI)',
      defaultState: 'NO',
      currentState: 'NO',
      lineType: 'HI',
      locationKm: 'KM 11+200',
      feedSection: 'MRI-JNG (HI)',
      stationId: createdStations['JNG'].id,
      voltageValue: 0.0,
      currentLoad: 0.0,
      temperature: 29.2,
      status: 'NORMAL',
      mapCoordX: 18.0,
      mapCoordY: 46.8,
    },
    {
      code: 'DS 2',
      name: 'Pemutus Daya DS 2 JNG-MRI (HU)',
      defaultState: 'NO',
      currentState: 'NO',
      lineType: 'HU',
      locationKm: 'KM 11+200',
      feedSection: 'JNG-MRI (HU)',
      stationId: createdStations['JNG'].id,
      voltageValue: 0.0,
      currentLoad: 0.0,
      temperature: 29.5,
      status: 'NORMAL',
      mapCoordX: 18.0,
      mapCoordY: 51.8,
    },
    {
      code: 'DS 3',
      name: 'Pemutus Daya DS 3 JALUR 2 JNG',
      defaultState: 'NC',
      currentState: 'NC',
      lineType: 'HU',
      locationKm: 'KM 11+750',
      feedSection: 'JALUR 2',
      stationId: createdStations['JNG'].id,
      voltageValue: 1515.2,
      currentLoad: 480.0,
      temperature: 37.8,
      status: 'NORMAL',
      mapCoordX: 24.2,
      mapCoordY: 46.8,
    },
    {
      code: 'DS 4',
      name: 'Pemutus Daya DS 4 JALUR 1 JNG',
      defaultState: 'NC',
      currentState: 'NC',
      lineType: 'HU',
      locationKm: 'KM 11+750',
      feedSection: 'JALUR 1',
      stationId: createdStations['JNG'].id,
      voltageValue: 1512.4,
      currentLoad: 510.5,
      temperature: 38.4,
      status: 'NORMAL',
      mapCoordX: 24.2,
      mapCoordY: 51.8,
    },
    {
      code: 'DS 5',
      name: 'Pemutus Daya DS 5 JALUR 2,3 JNG',
      defaultState: 'NC',
      currentState: 'NC',
      lineType: 'HI',
      locationKm: 'KM 12+100',
      feedSection: 'JALUR 2,3',
      stationId: createdStations['JNG'].id,
      voltageValue: 1510.0,
      currentLoad: 620.0,
      temperature: 39.1,
      status: 'NORMAL',
      mapCoordX: 45.8,
      mapCoordY: 46.5,
    },
    {
      code: 'DS 6',
      name: 'Pemutus Daya DS 6 JALUR 1 JNG',
      defaultState: 'NC',
      currentState: 'NC',
      lineType: 'HU',
      locationKm: 'KM 12+100',
      feedSection: 'JALUR 1',
      stationId: createdStations['JNG'].id,
      voltageValue: 1514.8,
      currentLoad: 540.2,
      temperature: 38.0,
      status: 'NORMAL',
      mapCoordX: 45.8,
      mapCoordY: 51.8,
    },
    {
      code: 'DS 7',
      name: 'Pemutus Daya DS 7 KLD-JNG HI',
      defaultState: 'NO',
      currentState: 'NO',
      lineType: 'HI',
      locationKm: 'KM 13+800',
      feedSection: 'KLD-JNG HI',
      stationId: createdStations['KLD'].id,
      voltageValue: 0.0,
      currentLoad: 0.0,
      temperature: 30.1,
      status: 'NORMAL',
      mapCoordX: 59.5,
      mapCoordY: 46.8,
    },
    {
      code: 'DS 8',
      name: 'Pemutus Daya DS 8 JNG-KLD HU',
      defaultState: 'NO',
      currentState: 'NO',
      lineType: 'HU',
      locationKm: 'KM 13+800',
      feedSection: 'JNG-KLD HU',
      stationId: createdStations['KLD'].id,
      voltageValue: 0.0,
      currentLoad: 0.0,
      temperature: 30.4,
      status: 'NORMAL',
      mapCoordX: 59.5,
      mapCoordY: 51.8,
    },
    {
      code: 'DS 9',
      name: 'Pemutus Daya DS 9 KLDB-BUA HI',
      defaultState: 'NC',
      currentState: 'NC',
      lineType: 'HI',
      locationKm: 'KM 17+500',
      feedSection: 'KLDB-BUA HI',
      stationId: createdStations['BUA'].id,
      voltageValue: 1508.5,
      currentLoad: 410.2,
      temperature: 36.9,
      status: 'NORMAL',
      mapCoordX: 90.5,
      mapCoordY: 46.8,
    },
    {
      code: 'DS 10',
      name: 'Pemutus Daya DS 10 BUA-KLDB HU',
      defaultState: 'NC',
      currentState: 'NC',
      lineType: 'HU',
      locationKm: 'KM 17+500',
      feedSection: 'BUA-KLDB HU',
      stationId: createdStations['BUA'].id,
      voltageValue: 1509.0,
      currentLoad: 435.0,
      temperature: 37.2,
      status: 'NORMAL',
      mapCoordX: 90.5,
      mapCoordY: 51.8,
    },
    {
      code: 'DS 11',
      name: 'Pemutus Daya DS 11 CUK-KLDB HI',
      defaultState: 'NO',
      currentState: 'NO',
      lineType: 'HI',
      locationKm: 'KM 19+800',
      feedSection: 'CUK-KLDB HI',
      stationId: createdStations['KLDB'].id,
      voltageValue: 0.0,
      currentLoad: 0.0,
      temperature: 28.7,
      status: 'NORMAL',
      mapCoordX: 84.5,
      mapCoordY: 68.5,
    },
    {
      code: 'DS 12',
      name: 'Pemutus Daya DS 12 KLDB-CUK HU',
      defaultState: 'NO',
      currentState: 'NO',
      lineType: 'HU',
      locationKm: 'KM 19+800',
      feedSection: 'KLDB-CUK HU',
      stationId: createdStations['KLDB'].id,
      voltageValue: 0.0,
      currentLoad: 0.0,
      temperature: 29.0,
      status: 'NORMAL',
      mapCoordX: 84.5,
      mapCoordY: 63.5,
    },
    {
      code: 'DS 13',
      name: 'Pemutus Daya DS 13 KRI-CUK HI',
      defaultState: 'NC',
      currentState: 'NC',
      lineType: 'HI',
      locationKm: 'KM 21+200',
      feedSection: 'KRI-CUK HI',
      stationId: createdStations['CUK'].id,
      voltageValue: 1518.2,
      currentLoad: 530.0,
      temperature: 38.6,
      status: 'NORMAL',
      mapCoordX: 71.0,
      mapCoordY: 68.5,
    },
    {
      code: 'DS 14',
      name: 'Pemutus Daya DS 14 CUK-KRI HU',
      defaultState: 'NC',
      currentState: 'NC',
      lineType: 'HU',
      locationKm: 'KM 21+200',
      feedSection: 'CUK-KRI HU',
      stationId: createdStations['CUK'].id,
      voltageValue: 1516.4,
      currentLoad: 490.5,
      temperature: 38.1,
      status: 'NORMAL',
      mapCoordX: 71.0,
      mapCoordY: 63.5,
    },
    {
      code: 'DS 15',
      name: 'Pemutus Daya DS 15 EMP BKS (HI)',
      defaultState: 'NC',
      currentState: 'NC',
      lineType: 'HI',
      locationKm: 'KM 26+200',
      feedSection: 'EMP BKS (HI)',
      stationId: createdStations['BKS'].id,
      voltageValue: 1511.0,
      currentLoad: 610.0,
      temperature: 39.5,
      status: 'NORMAL',
      mapCoordX: 43.5,
      mapCoordY: 68.5,
    },
    {
      code: 'DS 16',
      name: 'Pemutus Daya DS 16 EMP BKS (HU)',
      defaultState: 'NC',
      currentState: 'NC',
      lineType: 'HU',
      locationKm: 'KM 26+200',
      feedSection: 'EMP BKS (HU)',
      stationId: createdStations['BKS'].id,
      voltageValue: 1512.1,
      currentLoad: 580.4,
      temperature: 39.0,
      status: 'NORMAL',
      mapCoordX: 43.5,
      mapCoordY: 63.5,
    },
    {
      code: 'DS 17',
      name: 'Pemutus Daya DS 17 EMP BKS (4-5)',
      defaultState: 'NC',
      currentState: 'NC',
      lineType: 'EMPL',
      locationKm: 'KM 26+300',
      feedSection: 'EMP BKS (4-5)',
      stationId: createdStations['BKS'].id,
      voltageValue: 1509.7,
      currentLoad: 310.0,
      temperature: 35.4,
      status: 'NORMAL',
      mapCoordX: 39.0,
      mapCoordY: 74.0,
    },
    {
      code: 'DS 18',
      name: 'Pemutus Daya DS 18 EMP BKS (6-7,8)',
      defaultState: 'NC',
      currentState: 'NC',
      lineType: 'EMPL',
      locationKm: 'KM 26+300',
      feedSection: 'EMP BKS (6-7,8)',
      stationId: createdStations['BKS'].id,
      voltageValue: 1509.3,
      currentLoad: 280.0,
      temperature: 34.8,
      status: 'NORMAL',
      mapCoordX: 36.0,
      mapCoordY: 74.0,
    },
    {
      code: 'DS 19',
      name: 'Pemutus Daya DS 19 BKT-BKS (HI)',
      defaultState: 'NC',
      currentState: 'NC',
      lineType: 'HI',
      locationKm: 'KM 26+800',
      feedSection: 'BKT-BKS (HI)',
      stationId: createdStations['BKS'].id,
      voltageValue: 1514.0,
      currentLoad: 470.0,
      temperature: 37.9,
      status: 'NORMAL',
      mapCoordX: 21.0,
      mapCoordY: 68.5,
    },
    {
      code: 'DS 20',
      name: 'Pemutus Daya DS 20 BKS-BKT (HU)',
      defaultState: 'NC',
      currentState: 'NC',
      lineType: 'HU',
      locationKm: 'KM 26+800',
      feedSection: 'BKS-BKT (HU)',
      stationId: createdStations['BKS'].id,
      voltageValue: 1513.5,
      currentLoad: 520.0,
      temperature: 38.2,
      status: 'NORMAL',
      mapCoordX: 21.0,
      mapCoordY: 63.5,
    },
  ];

  for (const sw of switchesData) {
    await prisma.switchDevice.create({ data: sw });
  }

  // 3. Seed Track Sections (NASPAN & Tracks)
  const sectionsData = [
    { name: 'NASPAN 1 JNG-KLD (HU)', trackType: 'HILIR', startKm: 'KM 11+750', endKm: 'KM 12+844', isEnergized: true, voltage: 1515.0, status: 'ENERGIZED', substation: 'GTR-JNG' },
    { name: 'NASPAN 1 JNG-KLD (HI)', trackType: 'HULU', startKm: 'KM 11+750', endKm: 'KM 12+844', isEnergized: true, voltage: 1512.0, status: 'ENERGIZED', substation: 'GTR-JNG' },
    { name: 'NASPAN 2 JNG-KLD', trackType: 'HILIR', startKm: 'KM 12+844', endKm: 'KM 13+800', isEnergized: true, voltage: 1510.0, status: 'ENERGIZED', substation: 'GTR-JNG' },
    { name: 'NASPAN 3 JNG-KLD', trackType: 'HULU', startKm: 'KM 13+800', endKm: 'KM 15+027', isEnergized: true, voltage: 1508.0, status: 'ENERGIZED', substation: 'GTR-BUA' },
    { name: 'NASPAN 4 JNG-KLD', trackType: 'HILIR', startKm: 'KM 14+700', endKm: 'KM 15+760', isEnergized: true, voltage: 1510.0, status: 'ENERGIZED', substation: 'GTR-BUA' },
    { name: 'NASPAN 4B KLD-BUA', trackType: 'HULU', startKm: 'KM 15+760', endKm: 'KM 16+914', isEnergized: true, voltage: 1509.0, status: 'ENERGIZED', substation: 'GTR-BUA' },
    { name: 'NASPAN 5 KLD-BUA', trackType: 'HILIR', startKm: 'KM 16+914', endKm: 'KM 17+500', isEnergized: true, voltage: 1512.0, status: 'ENERGIZED', substation: 'GTR-BUA' },
    { name: 'NASPAN 6 KLD-BUA', trackType: 'HULU', startKm: 'KM 17+209', endKm: 'KM 18+200', isEnergized: true, voltage: 1511.0, status: 'ENERGIZED', substation: 'GTR-BUA' },
    { name: 'NASPAN 7 BUA-KLDB', trackType: 'HILIR', startKm: 'KM 18+200', endKm: 'KM 19+546', isEnergized: true, voltage: 1514.0, status: 'ENERGIZED', substation: 'GTR-CUK' },
    { name: 'NASPAN 8 BUA-KLDB', trackType: 'HULU', startKm: 'KM 19+546', endKm: 'KM 20+474', isEnergized: true, voltage: 1513.0, status: 'ENERGIZED', substation: 'GTR-CUK' },
    { name: 'NASPAN 9 EMPL CUK', trackType: 'EMPLASEMEN', startKm: 'KM 20+474', endKm: 'KM 21+400', isEnergized: true, voltage: 1516.0, status: 'ENERGIZED', substation: 'GTR-CUK' },
    { name: 'NASPAN 10 CUK-KRI', trackType: 'HILIR', startKm: 'KM 21+400', endKm: 'KM 22+700', isEnergized: true, voltage: 1515.0, status: 'ENERGIZED', substation: 'GTR-CUK' },
    { name: 'NASPAN 11 CUK-KRI', trackType: 'HULU', startKm: 'KM 22+700', endKm: 'KM 23+987', isEnergized: true, voltage: 1512.0, status: 'ENERGIZED', substation: 'GTR-BKS' },
    { name: 'NASPAN 12 BKS-KRI', trackType: 'HILIR', startKm: 'KM 23+987', endKm: 'KM 25+540', isEnergized: true, voltage: 1510.0, status: 'ENERGIZED', substation: 'GTR-BKS' },
    { name: 'NASPAN 13 BKS-KRI', trackType: 'HULU', startKm: 'KM 25+540', endKm: 'KM 26+403', isEnergized: true, voltage: 1513.0, status: 'ENERGIZED', substation: 'GTR-BKS' },
  ];

  for (const sec of sectionsData) {
    await prisma.trackSection.create({ data: sec });
  }

  // 4. Seed Infrastructure Assets (Air Joints, Air Sections, FRPs)
  const assetsData = [
    // Air Joints (AJ)
    { type: 'AIR_JOINT', code: 'AJ KM 10+000', name: 'Air Joint KM 10+000', locationKm: 'KM 10+000', stationId: createdStations['PND'].id, condition: 'BAIK', notes: 'Peregangan kawat kontak normal.' },
    { type: 'AIR_JOINT', code: 'AJ KM 13+300', name: 'Air Joint KM 13+300', locationKm: 'KM 13+300', stationId: createdStations['JNG'].id, condition: 'BAIK', notes: 'Inspeksi berkala aman.' },
    { type: 'AIR_JOINT', code: 'AJ KM 14+100', name: 'Air Joint KM 14+100', locationKm: 'KM 14+100', stationId: createdStations['KLD'].id, condition: 'BAIK', notes: 'Tegangan mekanik sesuai standar.' },
    { type: 'AIR_JOINT', code: 'AJ KM 14+700', name: 'Air Joint KM 14+700', locationKm: 'KM 14+700', stationId: createdStations['KLD'].id, condition: 'BAIK', notes: 'Kondisi dropper dan kawat kontak baik.' },
    { type: 'AIR_JOINT', code: 'AJ KM 16+500', name: 'Air Joint KM 16+500', locationKm: 'KM 16+500', stationId: createdStations['BUA'].id, condition: 'BAIK', notes: 'Overlap line stabil.' },
    { type: 'AIR_JOINT', code: 'AJ KM 18+800', name: 'Air Joint KM 18+800', locationKm: 'KM 18+800', stationId: createdStations['KLDB'].id, condition: 'PERHATIAN', notes: 'Perlu pelumasan steady arm.' },
    { type: 'AIR_JOINT', code: 'AJ KM 19+300', name: 'Air Joint KM 19+300', locationKm: 'KM 19+300', stationId: createdStations['KLDB'].id, condition: 'BAIK', notes: 'Jarak bebas kawat sesuai spesifikasi.' },
    { type: 'AIR_JOINT', code: 'AJ KM 22+700', name: 'Air Joint KM 22+700', locationKm: 'KM 22+700', stationId: createdStations['KRI'].id, condition: 'BAIK', notes: 'Tension device terkalibrasi.' },
    { type: 'AIR_JOINT', code: 'AJ KM 24+400', name: 'Air Joint KM 24+400', locationKm: 'KM 24+400', stationId: createdStations['KRI'].id, condition: 'BAIK', notes: 'Normal saat cuaca panas.' },
    { type: 'AIR_JOINT', code: 'AJ KM 25+000', name: 'Air Joint KM 25+000', locationKm: 'KM 25+000', stationId: createdStations['BKS'].id, condition: 'BAIK', notes: 'Menjelang emplasemen St. Bekasi.' },

    // Air Sections (AS)
    { type: 'AIR_SECTION', code: 'AS KM 1+880', name: 'Air Section KM 1+880', locationKm: 'KM 1+880', stationId: createdStations['PND'].id, condition: 'BAIK', notes: 'Arah percabangan Kramat.' },
    { type: 'AIR_SECTION', code: 'AS KM 2+000', name: 'Air Section KM 2+000', locationKm: 'KM 2+000', stationId: createdStations['PND'].id, condition: 'BAIK', notes: 'Arah percabangan Kramat.' },
    { type: 'AIR_SECTION', code: 'AS KM 11+200', name: 'Air Section KM 11+200', locationKm: 'KM 11+200', stationId: createdStations['JNG'].id, condition: 'BAIK', notes: 'Pemisah isolasi udara fasa traksi Manggarai-Jatinegara.' },
    { type: 'AIR_SECTION', code: 'AS KM 11+900', name: 'Air Section KM 11+900', locationKm: 'KM 11+900', stationId: createdStations['JNG'].id, condition: 'BAIK', notes: 'Isolator busur listrik aman.' },
    { type: 'AIR_SECTION', code: 'AS KM 12+500', name: 'Air Section KM 12+500', locationKm: 'KM 12+500', stationId: createdStations['JNG'].id, condition: 'BAIK', notes: 'Pemisah seksi stasiun timur.' },
    { type: 'AIR_SECTION', code: 'AS KM 15+450', name: 'Air Section KM 15+450', locationKm: 'KM 15+450', stationId: createdStations['KLD'].id, condition: 'BAIK', notes: 'Air section petak Klender.' },
    { type: 'AIR_SECTION', code: 'AS KM 17+239', name: 'Air Section KM 17+239', locationKm: 'KM 17+239', stationId: createdStations['BUA'].id, condition: 'BAIK', notes: 'Seksi Stasiun Buaran.' },
    { type: 'AIR_SECTION', code: 'AS KM 17+900', name: 'Air Section KM 17+900', locationKm: 'KM 17+900', stationId: createdStations['BUA'].id, condition: 'BAIK', notes: 'Pemisah petak Buaran - Klender Baru.' },
    { type: 'AIR_SECTION', code: 'AS KM 20+150', name: 'Air Section KM 20+150', locationKm: 'KM 20+150', stationId: createdStations['CUK'].id, condition: 'BAIK', notes: 'Isolasi petak gardu traksi Cakung.' },
    { type: 'AIR_SECTION', code: 'AS KM 21+400', name: 'Air Section KM 21+400', locationKm: 'KM 21+400', stationId: createdStations['CUK'].id, condition: 'BAIK', notes: 'Air section ujung timur Cakung.' },
    { type: 'AIR_SECTION', code: 'AS KM 23+750', name: 'Air Section KM 23+750', locationKm: 'KM 23+750', stationId: createdStations['KRI'].id, condition: 'BAIK', notes: 'Pemisah petak Kranji.' },
    { type: 'AIR_SECTION', code: 'AS KM 25+750', name: 'Air Section KM 25+750', locationKm: 'KM 25+750', stationId: createdStations['BKS'].id, condition: 'BAIK', notes: 'Air section jalur utama Bekasi.' },
    { type: 'AIR_SECTION', code: 'AS KM 26+900', name: 'Air Section KM 26+900', locationKm: 'KM 26+900', stationId: createdStations['BKS'].id, condition: 'BAIK', notes: 'Menuju petak Bekasi Timur.' },

    // FRP (Section Insulator)
    { type: 'FRP', code: 'FRP-JNG-01-31A1', name: 'FRP Isolator JNG 31A1', locationKm: 'KM 11+600', stationId: createdStations['JNG'].id, condition: 'BAIK', notes: 'Bahan serat komposit FRP tahan busur api.' },
    { type: 'FRP', code: 'FRP-JNG-02-11A', name: 'FRP Isolator JNG 11A', locationKm: 'KM 11+650', stationId: createdStations['JNG'].id, condition: 'BAIK', notes: 'Jalur 1 Jatinegara.' },
    { type: 'FRP', code: 'FRP-JNG-06-41B', name: 'FRP Isolator JNG 41B', locationKm: 'KM 11+800', stationId: createdStations['JNG'].id, condition: 'BAIK', notes: 'Inspeksi kebersihan debu karbon ok.' },
    { type: 'FRP', code: 'FRP-JNG-10-JALUR 4', name: 'FRP Isolator JNG Jalur 4', locationKm: 'KM 11+820', stationId: createdStations['JNG'].id, condition: 'BAIK', notes: 'Isolasi seksi peron 4.' },
    { type: 'FRP', code: 'FRP-JNG-20-51B', name: 'FRP Isolator JNG 51B', locationKm: 'KM 12+050', stationId: createdStations['JNG'].id, condition: 'BAIK', notes: 'Percabangan wesel 51B.' },
  ];

  for (const asset of assetsData) {
    await prisma.infrastructureAsset.create({ data: asset });
  }

  // 5. Seed Maintenance Logs
  const logsData = [
    {
      targetType: 'SWITCH',
      targetCode: 'DS 4',
      actionType: 'INSPECTION',
      technician: 'Ahmad Subarkah (LAA 1.9)',
      description: 'Pemeriksaan rutin kontak pisau DS 4 Stasiun Jatinegara. Nilai resistansi kontak 12 micro-ohm, normal.',
      status: 'COMPLETED',
    },
    {
      targetType: 'ASSET',
      targetCode: 'AJ KM 18+800',
      actionType: 'CALIBRATION',
      technician: 'Rudi Hermawan (Teknisi KAI)',
      description: 'Penyetelan dropper kawat kontak dan steady arm saat perawatan malam window 01:00 - 03:30.',
      status: 'COMPLETED',
    },
    {
      targetType: 'SWITCH',
      targetCode: 'DS 1',
      actionType: 'MANUAL_TOGGLE',
      technician: 'Pusdalopka / Dispatcher LAA',
      description: 'Uji buka-tutup interlocking switch DS 1 MRI-JNG simulasi isolasi feeder.',
      status: 'COMPLETED',
    },
    {
      targetType: 'STATION',
      targetCode: 'ST. BEKASI (Jalur 1 Peron Utama Hulu)',
      actionType: 'INSPECTION',
      technician: 'Tim UPT Resor LAA 1.9',
      description: 'Thermovision scanning pada seluruh DS 15-20 emplasemen Stasiun Bekasi, tidak ada hotspot anomali.',
      status: 'COMPLETED',
    },
  ];

  for (const log of logsData) {
    await prisma.maintenanceLog.create({ data: log });
  }

  // 6. Seed SCADA Alerts
  const alertsData = [
    {
      severity: 'INFO',
      code: 'ALT-101',
      message: 'Sistem SCADA UPT Resor LAA 1.9 Jatinegara beroperasi normal (Tegangan 1500V DC Nominal).',
      location: 'Petak JNG - BKS',
      isAcknowledged: true,
    },
    {
      severity: 'WARNING',
      code: 'ALT-102',
      message: 'Jadwal pembersihan isolator keramik & FRP berkala pada wesel W31 & W51 St. Jatinegara.',
      location: 'ST. JATINEGARA (KM 11+750)',
      isAcknowledged: false,
    },
    {
      severity: 'INFO',
      code: 'ALT-103',
      message: 'Telemetri Gardu Traksi Buaran (GTR-BUA) mencatat beban puncak 1420 Ampere saat jam sibuk.',
      location: 'GTR-BUA (KM 17+500)',
      isAcknowledged: true,
    },
  ];

  for (const alt of alertsData) {
    await prisma.scadaAlert.create({ data: alt });
  }

  // 7. Seed Telemetry Records (Substations)
  const telemetryData = [
    {
      substation: 'Gardu Traksi Jatinegara (GTR-JNG)',
      voltageDc: 1515.6,
      currentAmps: 1280.4,
      powerKw: 1940.5,
      frequencyHz: 50.0,
      tempSubstation: 28.2,
      feederStatus: 'NORMAL',
    },
    {
      substation: 'Gardu Traksi Buaran (GTR-BUA)',
      voltageDc: 1510.2,
      currentAmps: 940.8,
      powerKw: 1420.8,
      frequencyHz: 50.02,
      tempSubstation: 29.1,
      feederStatus: 'NORMAL',
    },
    {
      substation: 'Gardu Traksi Cakung (GTR-CUK)',
      voltageDc: 1518.0,
      currentAmps: 1110.2,
      powerKw: 1685.3,
      frequencyHz: 49.98,
      tempSubstation: 27.8,
      feederStatus: 'NORMAL',
    },
    {
      substation: 'Gardu Traksi Bekasi (GTR-BKS)',
      voltageDc: 1512.4,
      currentAmps: 1350.0,
      powerKw: 2041.7,
      frequencyHz: 50.01,
      tempSubstation: 30.5,
      feederStatus: 'NORMAL',
    },
  ];

  for (const tel of telemetryData) {
    await prisma.telemetryRecord.create({ data: tel });
  }

  console.log('Database UPT Resor LAA 1.9 Jatinegara seeded successfully!');
}

module.exports = { seedDatabase: main };

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
