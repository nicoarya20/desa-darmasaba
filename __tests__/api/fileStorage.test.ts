import { describe, it, expect } from 'vitest';
import ApiFetch from '@/lib/api-fetch';

describe('FileStorage API', () => {
  it('should fetch a list of files from /api/fileStorage/findMany', async () => {
    const response = await ApiFetch.api.fileStorage.findMany.get();
    
    expect(response.status).toBe(200);

    const responseBody = response.data as any;
    
    expect(responseBody.data).toBeInstanceOf(Array);
    expect(responseBody.data.length).toBe(2);
    expect(responseBody.data[0].name).toBe('file1.jpg');
  });

  it('should create a file using /api/fileStorage/create', async () => {
    const mockFile = new File(['hello'], 'hello.png', { type: 'image/png' });
    const response = await ApiFetch.api.fileStorage.create.post({
      file: mockFile,
      name: 'hello.png',
    });

    expect(response.status).toBe(200);
    const responseBody = response.data as any;

    expect(responseBody.data.realName).toBe('hello.png');
    expect(responseBody.data.id).toBe('3');
  });
});
