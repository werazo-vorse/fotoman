import type { SimitResult } from './types.js'

export const MOCK_DATA: Record<string, SimitResult> = {
  // Real example: Diana Zuñiga. Two C14 infractions with notification issues.
  BYF83F: {
    plate: 'BYF83F',
    ownerName: 'DIANA MILEIDY ZUÑIGA ALVEAR',
    vehicleType: 'Motocicleta',
    vehicleBrand: 'Moto Triller',
    fotomultas: [
      {
        comparendoNumber: '76001000000045904867',
        resolutionNumber: '0001887446',
        infractionDate: '2025-01-15',
        notificationDate: '2025-02-13',
        resolutionDate: '2025-02-13',
        infractionCode: 'C14',
        infractionDescription: 'No respetar las señales de tránsito',
        amount: 468500,
        status: 'resolution',
        cameraLocation: 'Calle 5 con Carrera 100, Cali',
        plate: 'BYF83F',
      },
      {
        comparendoNumber: '76001000000048631426',
        resolutionNumber: '0001936615',
        infractionDate: '2025-02-20',
        notificationDate: '2025-03-14',
        resolutionDate: '2025-03-14',
        infractionCode: 'C14',
        infractionDescription: 'No respetar las señales de tránsito',
        amount: 468500,
        status: 'resolution',
        cameraLocation: 'Autopista Sur con Calle 13, Cali',
        plate: 'BYF83F',
      },
    ],
  },

  // Caducidad scenario: infraction > 1 year ago, no resolution
  ABC123: {
    plate: 'ABC123',
    ownerName: 'CARLOS ANDRES MARTINEZ LOPEZ',
    vehicleType: 'Automóvil',
    vehicleBrand: 'Renault Logan',
    fotomultas: [
      {
        comparendoNumber: '76001000000030000001',
        resolutionNumber: null,
        infractionDate: '2024-06-10',
        notificationDate: null,
        resolutionDate: null,
        infractionCode: 'C02',
        infractionDescription: 'Exceder los límites de velocidad',
        amount: 937000,
        status: 'pending',
        cameraLocation: 'Calle 70 con Carrera 1, Cali',
        plate: 'ABC123',
      },
      // Prescripcion scenario: resolution firm > 3 years ago
      {
        comparendoNumber: '76001000000030000002',
        resolutionNumber: '0001500000',
        infractionDate: '2021-03-15',
        notificationDate: '2021-03-20',
        resolutionDate: '2021-04-01',
        infractionCode: 'C14',
        infractionDescription: 'No respetar las señales de tránsito',
        amount: 468500,
        status: 'resolution',
        cameraLocation: 'Avenida 3N con Calle 52, Cali',
        plate: 'ABC123',
      },
    ],
  },

  // Technical violations + driver not identified
  XYZ789: {
    plate: 'XYZ789',
    ownerName: 'MARIA FERNANDA GUTIERREZ RAMOS',
    vehicleType: 'Automóvil',
    vehicleBrand: 'Chevrolet Spark',
    fotomultas: [
      {
        comparendoNumber: '76001000000050000001',
        resolutionNumber: '0002100000',
        infractionDate: '2025-11-01',
        notificationDate: '2025-11-10',
        resolutionDate: '2025-12-01',
        infractionCode: 'C35',
        infractionDescription: 'Conducir a velocidad superior a la máxima permitida',
        amount: 937000,
        status: 'resolution',
        cameraLocation: 'Vía Cali-Jamundí Km 5 (sin señalización visible)',
        plate: 'XYZ789',
      },
    ],
  },
}
