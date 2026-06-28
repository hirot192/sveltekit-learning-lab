/**
 * M2's seed data keeps a fixed historical demo user. Since M3, live requests
 * use event.locals.user and never use this ID for authorization.
 */
export const DEMO_USER_ID = '00000000-0000-4000-8000-000000000001';
