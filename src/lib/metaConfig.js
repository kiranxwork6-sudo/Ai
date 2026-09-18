const readPublicValue = (value) => typeof value === 'string' ? value.trim() : '';
export const EXPECTED_META_APP_ID = '230831096602291';
export const EXPECTED_META_EMBEDDED_SIGNUP_CONFIG_ID = '1737194977391820';

export const metaPublicConfig = Object.freeze({
  appId: readPublicValue(import.meta.env.VITE_META_APP_ID),
  embeddedSignupConfigId: readPublicValue(import.meta.env.VITE_META_EMBEDDED_SIGNUP_CONFIG_ID)
});

export function logMetaPublicConfig() {
  console.info('[MetaConfig]', {
    runtimeMetaAppId: metaPublicConfig.appId || '(missing)',
    runtimeConfigId: metaPublicConfig.embeddedSignupConfigId || '(missing)'
  });
}

export function hasMetaPublicConfig() {
  return metaPublicConfig.appId === EXPECTED_META_APP_ID
    && metaPublicConfig.embeddedSignupConfigId === EXPECTED_META_EMBEDDED_SIGNUP_CONFIG_ID;
}