import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertMetaAppConfig, getMetaConfig } from './config/meta.js';
import { db } from './storage/db.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const originalEnv = {
  META_APP_ID: process.env.META_APP_ID,
  META_APP_SECRET: process.env.META_APP_SECRET,
  META_EMBEDDED_SIGNUP_CONFIG_ID: process.env.META_EMBEDDED_SIGNUP_CONFIG_ID,
  META_GRAPH_API_VERSION: process.env.META_GRAPH_API_VERSION
};

try {
  process.env.META_APP_ID = 'app-id';
  process.env.META_APP_SECRET = 'app-secret';
  process.env.META_EMBEDDED_SIGNUP_CONFIG_ID = 'config-id';
  process.env.META_GRAPH_API_VERSION = 'v99.0';
  assert.deepEqual(getMetaConfig(), {
    appId: 'app-id',
    appSecret: 'app-secret',
    verifyToken: '',
    embeddedSignupConfigId: 'config-id',
    graphApiVersion: 'v99.0',
    systemUserAccessToken: ''
  }, 'server Meta config must use the standardized names');

  delete process.env.META_APP_SECRET;
  assert.throws(() => assertMetaAppConfig(), /META_APP_ID, META_APP_SECRET, and META_EMBEDDED_SIGNUP_CONFIG_ID/, 'incomplete Meta config must fail safely');

  const modalSource = read('src/components/WhatsAppConnectModal.jsx');
  const publicConfigSource = read('src/lib/metaConfig.js');
  assert.match(publicConfigSource, /EXPECTED_META_APP_ID = '230831096602291'/, 'client must pin the Gereply App ID');
  assert.match(publicConfigSource, /EXPECTED_META_EMBEDDED_SIGNUP_CONFIG_ID = '1737194977391820'/, 'client must pin the Gereply Embedded Signup Config ID');
  assert.match(modalSource, /metaPublicConfig\.appId/, 'FB.init must use the public App ID config');
  assert.match(modalSource, /metaPublicConfig\.embeddedSignupConfigId/, 'FB.login must use the public Config ID config');
  assert.match(modalSource, /FB\.init completed/, 'FB.init completion must be diagnosable');
  assert.match(modalSource, /FB\.login called/, 'FB.login reachability must be diagnosable');
  assert.match(modalSource, /Unable to load WhatsApp signup/, 'SDK failures must leave the loading state');
  assert.doesNotMatch(modalSource, /appId:\s*['"]\d+['"]/, 'App ID must not be hardcoded in the frontend');
  assert.doesNotMatch(modalSource, /config_id:\s*['"]\d+['"]/, 'Config ID must not be hardcoded in the frontend');
  assert.doesNotMatch(modalSource, /META_APP_SECRET|META_SYSTEM_USER_ACCESS_TOKEN|GEMINI_API_KEY|SESSION_SECRET/, 'server secrets must not appear in frontend source');

  const serviceSource = read('server/services/whatsapp/index.js');
  const providerSource = read('server/services/whatsapp/metaProvider.js');
  const routeSource = read('server/routes/whatsapp.js');
  assert.doesNotMatch(serviceSource, /process\.env\.WHATSAPP_(ACCESS_TOKEN|API_TOKEN|PHONE_NUMBER_ID|BUSINESS_ACCOUNT_ID)/, 'outgoing delivery must not use global WhatsApp credentials');
  assert.doesNotMatch(providerSource, /process\.env\.WHATSAPP_(VERIFY_TOKEN|APP_SECRET)/, 'webhook security must use META_* names');
  assert.doesNotMatch(routeSource, /accessToken/, 'browser onboarding route must not accept a permanent access token');

  const originalConnections = JSON.stringify(db.data.whatsapp_connections || []);
  try {
    db.saveWhatsAppConnection('biz-default', 'meta', { status: 'connected', phoneNumberId: 'phone-a', wabaId: 'waba-a', accessToken: 'tenant-a-token' });
    assert.equal(db.findBusinessByPhoneNumberId('phone-a')?.id, 'biz-default', 'webhook routing must use the connected tenant phone ID');
    assert.equal(db.getWhatsAppConnection('tenant-b', 'meta').phoneNumberId, '', 'tenant connection lookup must not cross tenants');
    assert.equal(db.findBusinessByPhoneNumberId('unknown-phone'), null, 'unknown phone IDs must not fall back to a default tenant');
  } finally {
    db.data.whatsapp_connections = JSON.parse(originalConnections);
    db.save();
  }

  console.log('Meta configuration, frontend secrecy, tenant routing, and credential-boundary tests passed.');
} finally {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}