import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('http://localhost:3000/api/fileStorage/findMany', () => {
    return HttpResponse.json({
      data: [
        { id: '1', name: 'file1.jpg', url: '/uploads/file1.jpg' },
        { id: '2', name: 'file2.png', url: '/uploads/file2.png' },
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      },
    });
  }),
  http.post('http://localhost:3000/api/fileStorage/create', async ({ request }) => {
    const data = await request.formData();
    const file = data.get('file') as File;
    const name = data.get('name') as string;

    if (!file) {
      return new HttpResponse(null, { status: 400 });
    }

    return HttpResponse.json({
      data: {
        id: '3',
        name: 'generated-nanoid',
        path: `/uploads/generated-nanoid`,
        link: `/uploads/generated-nanoid`,
        realName: name,
        mimeType: file.type,
        category: "uncategorized",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }
    });
  }),
];
