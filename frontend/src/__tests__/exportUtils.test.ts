import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { exportToCsv } from '../lib/exportUtils';

describe('exportToCsv Utility', () => {
  let createdLinks: HTMLAnchorElement[] = [];
  let clickedLinks: HTMLAnchorElement[] = [];
  let createdBlobs: { content: BlobPart[]; options?: BlobPropertyBag }[] = [];
  let createdUrls: string[] = [];
  let revokedUrls: string[] = [];

  beforeEach(() => {
    createdLinks = [];
    clickedLinks = [];
    createdBlobs = [];
    createdUrls = [];
    revokedUrls = [];

    // Mock URL.createObjectURL & URL.revokeObjectURL
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn((blob: Blob) => {
        const url = `blob:http://localhost:3000/mock-${Math.random()}`;
        createdUrls.push(url);
        return url;
      }),
      revokeObjectURL: vi.fn((url: string) => {
        revokedUrls.push(url);
      }),
    });

    // Mock Blob to capture contents
    const OriginalBlob = globalThis.Blob;
    vi.stubGlobal(
      'Blob',
      vi.fn(function (content: BlobPart[], options?: BlobPropertyBag) {
        createdBlobs.push({ content, options });
        return new OriginalBlob(content, options);
      })
    );

    // Spy on document.createElement to intercept anchor link
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = origCreateElement(tagName);
      if (tagName.toLowerCase() === 'a') {
        const anchor = el as HTMLAnchorElement;
        anchor.click = vi.fn(() => {
          clickedLinks.push(anchor);
        });
        createdLinks.push(anchor);
      }
      return el;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('generates RFC-4180 CSV with UTF-8 BOM and triggers download', () => {
    const headers = ['Name', 'Role', 'Status'];
    const rows = [['Ruban', 'Administrator', 'ACTIVE']];

    exportToCsv('staff_report', headers, rows);

    expect(createdBlobs.length).toBe(1);
    const { content, options } = createdBlobs[0];
    expect(options?.type).toContain('text/csv;charset=utf-8;');
    expect(content[0]).toBe('\uFEFF'); // UTF-8 BOM

    const csvText = content[1] as string;
    expect(csvText).toBe('Name,Role,Status\r\nRuban,Administrator,ACTIVE');

    expect(createdLinks.length).toBe(1);
    expect(createdLinks[0].getAttribute('download')).toBe('staff_report.csv');
    expect(clickedLinks.length).toBe(1);
  });

  it('preserves numbers as unquoted values for Excel calculations', () => {
    const headers = ['Item', 'Basic', 'Allowances', 'Net'];
    const rows = [['Salary', 50000, 2500.5, 52500.5]];

    exportToCsv('payroll', headers, rows);

    const csvText = createdBlobs[0].content[1] as string;
    // Numbers should NOT be surrounded by quotes so spreadsheets can do =SUM()
    expect(csvText).toBe('Item,Basic,Allowances,Net\r\nSalary,50000,2500.5,52500.5');
  });

  it('exports null and undefined as blank cells, not empty quotes', () => {
    const headers = ['Col1', 'Col2', 'Col3', 'Col4'];
    const rows = [['Present', null, undefined, 'End']];

    exportToCsv('attendance', headers, rows);

    const csvText = createdBlobs[0].content[1] as string;
    // Should be ,, instead of ,"",
    expect(csvText).toBe('Col1,Col2,Col3,Col4\r\nPresent,,,End');
  });

  it('escapes cells containing commas, double quotes, and line breaks', () => {
    const headers = ['Note', 'Quote', 'MultiLine'];
    const rows = [
      [
        'Physics, Chemistry, Math',
        'Said "Hello World"',
        'Line 1\nLine 2',
      ],
    ];

    exportToCsv('escaped_test', headers, rows);

    const csvText = createdBlobs[0].content[1] as string;
    expect(csvText).toBe(
      'Note,Quote,MultiLine\r\n' +
      '"Physics, Chemistry, Math","Said ""Hello World""","Line 1\nLine 2"'
    );
  });

  it('preserves leading and trailing spaces by quoting them', () => {
    const headers = ['Raw'];
    const rows = [['   padded text   ']];

    exportToCsv('spaces_test', headers, rows);

    const csvText = createdBlobs[0].content[1] as string;
    expect(csvText).toBe('Raw\r\n"   padded text   "');
  });

  it('protects against CSV Formula / DDE Injection (CWE-1236)', () => {
    const headers = ['Input', 'Formula', 'AtSign', 'NegativeNumber'];
    const rows = [
      [
        '=SUM(A1:B10)',
        '+cmd| /C calc!A0',
        '@remote_import',
        -500, // Legitimate number should NOT be prefixed with single quote
      ],
    ];

    exportToCsv('security_test', headers, rows);

    const csvText = createdBlobs[0].content[1] as string;
    // Dangerous strings starting with =, +, @ must have a prepended single quote (')
    expect(csvText).toContain("'=SUM(A1:B10)");
    expect(csvText).toContain("'+cmd| /C calc!A0");
    expect(csvText).toContain("'@remote_import");
    // Negative number should remain plain -500
    expect(csvText).toContain(',-500');
  });

  it('sanitizes illegal filename characters and guarantees .csv extension', () => {
    const headers = ['Col'];
    const rows = [['Val']];

    exportToCsv('Timetable_Class 10/A:Section*B?', headers, rows);

    expect(createdLinks[0].getAttribute('download')).toBe('Timetable_Class 10_A_Section_B_.csv');
  });

  it('does not duplicate .csv if filename already ends with .csv', () => {
    exportToCsv('report.csv', ['A'], [['1']]);
    expect(createdLinks[0].getAttribute('download')).toBe('report.csv');

    exportToCsv('UPPERCASE.CSV', ['A'], [['1']]);
    expect(createdLinks[1].getAttribute('download')).toBe('UPPERCASE.CSV');
  });

  it('falls back to export.csv if filename is empty or blank', () => {
    exportToCsv('   ', ['A'], [['1']]);
    expect(createdLinks[0].getAttribute('download')).toBe('export.csv');
  });

  it('revokes the object URL asynchronously to prevent download cancellation race condition', () => {
    vi.useFakeTimers();

    exportToCsv('async_cleanup', ['A'], [['1']]);

    // Right after execution, URL should NOT be revoked yet
    expect(revokedUrls.length).toBe(0);

    // After timer runs, URL should be properly revoked
    vi.advanceTimersByTime(250);
    expect(revokedUrls.length).toBe(1);

    vi.useRealTimers();
  });
});
