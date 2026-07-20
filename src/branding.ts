/** Shown wherever there's no signed-in tenant to derive a name from — the
 *  login/signup screens (pre-auth) and the superuser's own shell
 *  (platform-level, not scoped to any tenant). Every tenant-scoped screen
 *  instead shows that tenant's own `PrescriptionTemplate.clinicName`
 *  (§5.5/§8.0 of docs/design.md), which is mandatory once a tenant exists. */
export const PLATFORM_NAME = 'Out patient management system'
