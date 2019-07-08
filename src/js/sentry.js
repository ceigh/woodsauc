// Imports
import * as Sentry from '@sentry/browser';


// Variables
const SENTRY_DSN = 'https://a2c34791c46f4d65b23f1eb7e8ecf07c@sentry.io/1493244';


// Exec
Sentry.init({ dsn: SENTRY_DSN });
