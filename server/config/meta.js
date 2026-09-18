const readValue = (value) => typeof value === 'string' ? value.trim() : '';

export function getMetaConfig() {
  return {
    appId: readValue(process.env.META_APP_ID),
    appSecret: readValue(process.env.META_APP_SECRET),
    verifyToken: readValue(process.env.META_VERIFY_TOKEN),
    embeddedSignupConfigId: readValue(process.env.META_EMBEDDED_SIGNUP_CONFIG_ID),
    graphApiVersion: readValue(process.env.META_GRAPH_API_VERSION) || 'v21.0',
    systemUserAccessToken: readValue(process.env.META_SYSTEM_USER_ACCESS_TOKEN)
  };
}

export function assertMetaAppConfig(config = getMetaConfig()) {
  if (!config.appId || !config.appSecret || !config.embeddedSignupConfigId) {
    throw new Error('Meta App configuration is incomplete. Set META_APP_ID, META_APP_SECRET, and META_EMBEDDED_SIGNUP_CONFIG_ID.');
  }
  return config;
}