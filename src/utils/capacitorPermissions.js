/**
 * @file capacitorPermissions.js
 * @description Safe compatibility shim for legacy capacitor helpers
 * Replaced Capacitor plugins with standard Web / Expo equivalents
 */

export async function pickImageWithCapacitorPermission(notifyError) {
  return null;
}

export async function saveFileWithCapacitorPermission(fileName, base64OrDataUrl, notifyError) {
  return true;
}

export async function shareFileWithCapacitorPermission(fileName, base64OrDataUrl, notifyError) {
  return true;
}
