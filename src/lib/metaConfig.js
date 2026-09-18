const readPublicValue = (value) => typeof value === 'string' ? value.trim() : '';

export const metaPublicConfig = Object.freeze({
  appId: readPublicValue(import.meta.env.VITE_META_APP_ID),
  embeddedSignupConfigId: readPublicValue(import.meta.env.VITE_META_EMBEDDED_SIGNUP_CONFIG_ID)
});

export function hasMetaPublicConfig() {
  return Boolean(metaPublicConfig.appId && metaPublicConfig.embeddedSignupConfigId);
}