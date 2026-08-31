import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');
const migrationPath = join(
  process.cwd(),
  'prisma',
  'migrations',
  '20260831000000_init_domain',
  'migration.sql',
);

describe('V2 domain schema', () => {
  const schema = readFileSync(schemaPath, 'utf8');
  const migration = readFileSync(migrationPath, 'utf8');

  it('defines only the required core domain models', () => {
    for (const model of [
      'User',
      'Company',
      'UserCompany',
      'Report',
      'AttendanceRecord',
      'ContentRecord',
      'Highlight',
    ]) {
      expect(schema).toContain(`model ${model} {`);
    }
  });

  it('models reports by company, year, and month', () => {
    expect(schema).toContain('@@unique([companyId, year, month])');
    expect(migration).toContain('CONSTRAINT "Report_month_check"');
    expect(migration).toContain('"month" BETWEEN 1 AND 12');
    expect(migration).toContain('CONSTRAINT "Report_year_check"');
  });

  it('stores individual records as calendar dates', () => {
    expect(schema.match(/date\s+DateTime @db\.Date/g)).toHaveLength(2);
  });

  it('keeps metric values within the ranges supported by the MVP', () => {
    expect(migration).toContain(
      'CONSTRAINT "AttendanceRecord_metrics_non_negative_check"',
    );
    expect(migration).toContain('CONSTRAINT "ContentRecord_metrics_check"');
    expect(migration).toContain('"engagement" BETWEEN 0 AND 100');
  });

  it('does not introduce weekly concepts', () => {
    expect(schema).not.toMatch(/\bweek\b/i);
    expect(schema).not.toMatch(/weekId/i);
    expect(schema).not.toMatch(/weeklyReport/i);
  });

  it('prevents duplicate user-company memberships', () => {
    expect(schema).toContain('@@id([userId, companyId])');
    expect(schema).toContain('enum UserCompanyRole');
  });
});
