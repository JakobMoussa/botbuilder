import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { extractUpload } from '../src/lib/uploads';
function request(name: string, content: Uint8Array, type: string) {
  const form = new FormData();
  form.set('file', new File([new Uint8Array(content)], name, { type }));
  return new Request('http://localhost/api/upload', { method: 'POST', body: form });
}
describe('bounded document extraction', () => {
  it('extracts PDF text in a separate process', async () => {
    const value = await extractUpload(request('sample.pdf', await readFile('tests/fixtures/sample.pdf'), 'application/pdf'));
    expect(value.content).toContain('Monday to Friday');
    expect(value.type).toBe('PDF');
  });
  it('extracts DOCX and preserves Unicode', async () => {
    const value = await extractUpload(request('sample.docx', await readFile('tests/fixtures/sample.docx'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'));
    expect(value.content).toContain('Öffnungszeiten');
    expect(value.type).toBe('DOCX');
  });
  it('rejects MIME/signature mismatch and malformed archives', async () => {
    await expect(extractUpload(request('fake.pdf', Buffer.from('not a PDF'), 'application/pdf'))).rejects.toThrow('Dateityp');
    await expect(extractUpload(request('tiny.docx', Buffer.from('x'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'))).rejects.toThrow('Dateityp');
  });
  it('rejects binary text and oversized request bodies', async () => {
    await expect(extractUpload(request('binary.txt', Buffer.from('text\0binary'), 'text/plain'))).rejects.toThrow('Binäre');
    await expect(extractUpload(request('huge.txt', new Uint8Array(6 * 1024 * 1024), 'text/plain'))).rejects.toThrow('groß');
  });
});
