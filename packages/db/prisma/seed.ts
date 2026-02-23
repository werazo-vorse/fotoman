import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { cedula: '1143978209' },
    update: {},
    create: {
      name: 'DIANA MILEIDY ZUÑIGA ALVEAR',
      cedula: '1143978209',
      email: 'alvear906@gmail.com',
      phone: '3044666312',
      address: 'Carrera 33# 26b 110',
      platform: 'WEB',
    },
  })

  const vehicle = await prisma.vehicle.upsert({
    where: { plate: 'BYF83F' },
    update: {},
    create: {
      plate: 'BYF83F',
      type: 'Motocicleta',
      brand: 'Moto Triller',
      ownerId: user.id,
    },
  })

  await prisma.fotomulta.upsert({
    where: { comparendoNumber: '76001000000045904867' },
    update: {},
    create: {
      comparendoNumber: '76001000000045904867',
      resolutionNumber: '0001887446',
      infractionDate: new Date('2025-01-15'),
      resolutionDate: new Date('2025-02-13'),
      infractionCode: 'C14',
      infractionDescription: 'No detenerse ante la luz roja del semáforo',
      amount: 468500,
      status: 'RESOLUTION',
      vehicleId: vehicle.id,
    },
  })

  await prisma.fotomulta.upsert({
    where: { comparendoNumber: '76001000000048631426' },
    update: {},
    create: {
      comparendoNumber: '76001000000048631426',
      resolutionNumber: '0001936615',
      infractionDate: new Date('2025-02-20'),
      resolutionDate: new Date('2025-03-14'),
      infractionCode: 'C14',
      infractionDescription: 'No detenerse ante la luz roja del semáforo',
      amount: 468500,
      status: 'RESOLUTION',
      vehicleId: vehicle.id,
    },
  })

  console.log('Seed data created successfully')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
