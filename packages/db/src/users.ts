import type { Platform, User } from '@prisma/client'
import { prisma } from './index.js'

export async function findOrCreateUser(data: {
  cedula: string
  name: string
  email?: string
  phone?: string
  address?: string
  platform?: Platform
}): Promise<User> {
  return prisma.user.upsert({
    where: { cedula: data.cedula },
    update: {
      name: data.name,
      ...(data.email && { email: data.email }),
      ...(data.phone && { phone: data.phone }),
      ...(data.address && { address: data.address }),
    },
    create: {
      cedula: data.cedula,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      platform: data.platform ?? 'WEB',
    },
  })
}

export async function findUserByCedula(cedula: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { cedula } })
}

export async function findUserByPhone(phone: string): Promise<User | null> {
  return prisma.user.findFirst({ where: { phone } })
}
