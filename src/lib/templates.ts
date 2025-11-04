// Plantillas predefinidas para organizar contenido educativo
// Cada plantilla define como se distribuyen los bloques en el espacio

import { ContentTemplate, TemplateType } from '@/types/content-blocks';

export const TEMPLATE_SINGLE: ContentTemplate = {
  type: 'single',
  name: 'Un solo bloque',
  description: 'Un único bloque de contenido a ancho completo',
  blocks: [
    {
      id: 'block-1',
      type: 'text',
      order: 0,
      data: { content: '' }
    }
  ],
  layout: {
    columns: 1,
    rows: 1,
    areas: [
      {
        id: 'area-1',
        blockId: 'block-1',
        gridColumn: '1 / 2',
        gridRow: '1 / 2'
      }
    ]
  }
};

export const TEMPLATE_TWO_COLUMNS: ContentTemplate = {
  type: 'two-col',
  name: 'Dos columnas',
  description: 'Dos bloques lado a lado',
  blocks: [
    {
      id: 'block-1',
      type: 'text',
      order: 0,
      data: { content: '' }
    },
    {
      id: 'block-2',
      type: 'text',
      order: 1,
      data: { content: '' }
    }
  ],
  layout: {
    columns: 2,
    rows: 1,
    areas: [
      {
        id: 'area-1',
        blockId: 'block-1',
        gridColumn: '1 / 2',
        gridRow: '1 / 2'
      },
      {
        id: 'area-2',
        blockId: 'block-2',
        gridColumn: '2 / 3',
        gridRow: '1 / 2'
      }
    ]
  }
};

export const TEMPLATE_TWO_ROWS: ContentTemplate = {
  type: 'two-row',
  name: 'Dos filas',
  description: 'Dos bloques apilados verticalmente',
  blocks: [
    {
      id: 'block-1',
      type: 'text',
      order: 0,
      data: { content: '' }
    },
    {
      id: 'block-2',
      type: 'text',
      order: 1,
      data: { content: '' }
    }
  ],
  layout: {
    columns: 1,
    rows: 2,
    areas: [
      {
        id: 'area-1',
        blockId: 'block-1',
        gridColumn: '1 / 2',
        gridRow: '1 / 2'
      },
      {
        id: 'area-2',
        blockId: 'block-2',
        gridColumn: '1 / 2',
        gridRow: '2 / 3'
      }
    ]
  }
};

export const TEMPLATE_TRIPLE: ContentTemplate = {
  type: 'triple',
  name: 'Triple celda',
  description: 'Dos bloques arriba, uno abajo completo',
  blocks: [
    {
      id: 'block-1',
      type: 'text',
      order: 0,
      data: { content: '' }
    },
    {
      id: 'block-2',
      type: 'text',
      order: 1,
      data: { content: '' }
    },
    {
      id: 'block-3',
      type: 'text',
      order: 2,
      data: { content: '' }
    }
  ],
  layout: {
    columns: 2,
    rows: 2,
    areas: [
      {
        id: 'area-1',
        blockId: 'block-1',
        gridColumn: '1 / 2',
        gridRow: '1 / 2'
      },
      {
        id: 'area-2',
        blockId: 'block-2',
        gridColumn: '2 / 3',
        gridRow: '1 / 2'
      },
      {
        id: 'area-3',
        blockId: 'block-3',
        gridColumn: '1 / 3',
        gridRow: '2 / 3'
      }
    ]
  }
};

export const TEMPLATE_QUAD: ContentTemplate = {
  type: 'quad',
  name: 'Cuatro celdas',
  description: 'Cuatro bloques en cuadrícula 2x2',
  blocks: [
    {
      id: 'block-1',
      type: 'text',
      order: 0,
      data: { content: '' }
    },
    {
      id: 'block-2',
      type: 'text',
      order: 1,
      data: { content: '' }
    },
    {
      id: 'block-3',
      type: 'text',
      order: 2,
      data: { content: '' }
    },
    {
      id: 'block-4',
      type: 'text',
      order: 3,
      data: { content: '' }
    }
  ],
  layout: {
    columns: 2,
    rows: 2,
    areas: [
      {
        id: 'area-1',
        blockId: 'block-1',
        gridColumn: '1 / 2',
        gridRow: '1 / 2'
      },
      {
        id: 'area-2',
        blockId: 'block-2',
        gridColumn: '2 / 3',
        gridRow: '1 / 2'
      },
      {
        id: 'area-3',
        blockId: 'block-3',
        gridColumn: '1 / 2',
        gridRow: '2 / 3'
      },
      {
        id: 'area-4',
        blockId: 'block-4',
        gridColumn: '2 / 3',
        gridRow: '2 / 3'
      }
    ]
  }
};

export const TEMPLATES: Record<TemplateType, ContentTemplate | null> = {
  'single': TEMPLATE_SINGLE,
  'two-col': TEMPLATE_TWO_COLUMNS,
  'two-row': TEMPLATE_TWO_ROWS,
  'triple': TEMPLATE_TRIPLE,
  'quad': TEMPLATE_QUAD,
  'custom': null
};

export function getTemplate(type: TemplateType): ContentTemplate | null {
  return TEMPLATES[type];
}

export function createDocumentFromTemplate(type: TemplateType) {
  const template = getTemplate(type);
  if (!template) return null;

  return {
    template: type,
    blocks: template.blocks.map(block => ({ ...block })),
    layout: { ...template.layout }
  };
}
