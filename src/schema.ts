import { SchemaObject } from '@paljs/types'

export const schema: SchemaObject = {
  models: [
    {
      name: 'Layanan',
      fields: [
        {
          name: 'id',
          type: 'String',
          isId: true,
          unique: false,
          defaultValue: 'cuid()',
          list: false,
          required: true,
          kind: 'scalar',
          documentation: '',
          relationField: false,
        },
        {
          name: 'name',
          type: 'String',
          isId: false,
          unique: true,
          list: false,
          required: true,
          kind: 'scalar',
          documentation: '',
          relationField: false,
        },
      ],
      documentation: '',
    },
    {
      name: 'Potensi',
      fields: [
        {
          name: 'id',
          type: 'String',
          isId: true,
          unique: false,
          defaultValue: 'cuid()',
          list: false,
          required: true,
          kind: 'scalar',
          documentation: '',
          relationField: false,
        },
        {
          name: 'name',
          type: 'String',
          isId: false,
          unique: true,
          list: false,
          required: true,
          kind: 'scalar',
          documentation: '',
          relationField: false,
        },
      ],
      documentation: '',
    },
  ],
  enums: [],
  dataSource: { provider: 'postgresql', url: 'env("DATABASE_URL")' },
  generators: [{ name: 'client', provider: 'prisma-client-js' }],
}
