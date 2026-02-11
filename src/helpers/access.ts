import type { DeviceShare } from "../generated/prisma"
import prisma from "../prisma"

export const ownsDevice = async (
  device_id: bigint,
  user_id: bigint,
): Promise<boolean> => {
  const ownedDevice = await prisma.device.findFirst({
    where: {
      id: device_id,
      user_id: user_id,
    },
  })

  if (ownedDevice) {
    return true
  }
  return false
}

const grabDeviceShare = async (
  device_id: bigint,
  user_id: bigint,
): Promise<DeviceShare | null> => {
  const deviceShare = await prisma.deviceShare.findFirst({
    where: {
      device_id: device_id,
      connection: {
        OR: [{ requester_id: user_id }, { addressee_id: user_id }],
      },
    },
  })
  return deviceShare
}

export const hasReadAccessToDevice = async (
  device_id: bigint,
  user_id: bigint,
): Promise<boolean> => {
  if (await ownsDevice(device_id, user_id)) return true

  const deviceShare = await grabDeviceShare(device_id, user_id)

  return !!deviceShare
}

export const hasRingAccessToDevice = async (
  device_id: bigint,
  user_id: bigint,
): Promise<boolean> => {
  if (await ownsDevice(device_id, user_id)) return true

  const deviceShare = await grabDeviceShare(device_id, user_id)

  return !!deviceShare?.can_ring
}

export const hasLockAccessToDevice = async (
  device_id: bigint,
  user_id: bigint,
): Promise<boolean> => {
  if (await ownsDevice(device_id, user_id)) return true

  const deviceShare = await grabDeviceShare(device_id, user_id)

  return !!deviceShare?.can_lock
}
