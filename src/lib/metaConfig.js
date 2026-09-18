const readPublicValue = (value) => typeof value === 'string' ? value.trim() : '';

export const metaPublicConfig = Object.freeze({
  appId: readPublicValue(import.meta.env.VITE_META_APP_ID),
  embeddedSignupConfigId: readPublicValue(import.meta.env.VITE_META_EMBEDDED_SIGNUP_CONFIG_ID)
});

export function logMetaPublicConfig() {
  console.info('[MetaConfig]', {
    appIdPresent: Boolean(metaPublicConfig.appId),
    appIdLength: metaPublicConfig.appId.length,
    appIdValue: metaPublicConfig.appId || '(missing)',
    configIdPresent: Boolean(metaPublicConfig.embeddedSignupConfigId),
    configIdLength: metaPublicConfig.embeddedSignupConfigId.length
  });
}

export function hasMetaPublicConfig() {
  return /^\d+$/.test(metaPublicConfig.appId)
    && /^\d+$/.test(metaPublicConfig.embeddedSignupConfigId);
}