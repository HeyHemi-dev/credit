import type { Region, RegionKey, Service, ServiceKey } from '@/lib/constants'
import type { ConstEnum } from '@/lib/generic-types'
import { REGION, SERVICE } from '@/lib/constants'
import { ERROR } from '@/lib/errors'

export const serviceHelper = {
  keyToParam: (serviceKey: ServiceKey): string => {
    return keyToParam(serviceKey)
  },
  valueToParam: (service: Service): string => {
    return valueToParam(service, SERVICE)
  },
  paramToKey: (param: string): ServiceKey => {
    return paramToKey(param, SERVICE)
  },
  paramToValue: (param: string): Service => {
    return paramToValue(param, SERVICE)
  },
}

export const regionHelper = {
  keyToParam: (regionKey: RegionKey): string => {
    return keyToParam(regionKey)
  },
  valueToParam: (region: Region): string => {
    return valueToParam(region, REGION)
  },
  paramToKey: (param: string): RegionKey => {
    return paramToKey(param, REGION)
  },
  paramToValue: (param: string): Region => {
    return paramToValue(param, REGION)
  },
}

/**
 * Converts a key to a URL-friendly parameter
 * @example BAY_OF_PLENTY -> bay-of-plenty
 */
export function keyToParam(key: string): string {
  return key.toLowerCase().replace(/_/g, '-')
}

/**
 * Finds the key for a given value in a constEnum and converts it to a URL-friendly parameter
 * @example Bay of Plenty -> bay-of-plenty
 */
export function valueToParam(value: string, constant: ConstEnum): string {
  const key = Object.keys(constant).find((k) => constant[k] === value)
  if (!key) throw ERROR.RESOURCE_NOT_FOUND(`${value} not found`)
  return keyToParam(key)
}

/**
 * Converts a URL-friendly parameter to a key
 * @example bay-of-plenty -> BAY_OF_PLENTY
 */
export function paramToKeyFormat(param: string): string {
  return param.toUpperCase().replace(/-/g, '_')
}

/**
 * Given a URL-friendly parameter and a constEnum, finds and returns the key
 * @example bay-of-plenty -> Bay of Plenty
 */
export function paramToKey<T extends ConstEnum>(
  param: string,
  constant: T,
): keyof T {
  const key = Object.keys(constant).find((k) => k === paramToKeyFormat(param))
  if (!key) throw ERROR.RESOURCE_NOT_FOUND(`${param} not found`)
  return key as keyof T
}

/**
 * Given a URL-friendly parameter and a constEnum, finds the key and returns the value
 * @example bay-of-plenty -> Bay of Plenty
 */
export function paramToValue<T extends ConstEnum>(
  param: string,
  constant: T,
): T[keyof T] {
  const key = Object.keys(constant).find((k) => k === paramToKeyFormat(param))
  if (!key) throw ERROR.RESOURCE_NOT_FOUND(`${param} not found`)
  return constant[key as keyof T]
}
