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

export const TEMPLATE_SIDEBAR_LEFT: ContentTemplate = {
  type: 'sidebar-left',
  name: 'Barra lateral izquierda',
  description: 'Barra lateral estrecha a la izquierda con contenido principal a la derecha',
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
    columns: 3,
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
        gridColumn: '2 / 4',
        gridRow: '1 / 2'
      }
    ]
  }
};

export const TEMPLATE_SIDEBAR_RIGHT: ContentTemplate = {
  type: 'sidebar-right',
  name: 'Barra lateral derecha',
  description: 'Contenido principal a la izquierda con barra lateral estrecha a la derecha',
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
    columns: 3,
    rows: 1,
    areas: [
      {
        id: 'area-1',
        blockId: 'block-1',
        gridColumn: '1 / 3',
        gridRow: '1 / 2'
      },
      {
        id: 'area-2',
        blockId: 'block-2',
        gridColumn: '3 / 4',
        gridRow: '1 / 2'
      }
    ]
  }
};

export const TEMPLATE_HEADER_CONTENT: ContentTemplate = {
  type: 'header-content',
  name: 'Encabezado y contenido',
  description: 'Encabezado superior con dos columnas de contenido debajo',
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
        gridColumn: '1 / 3',
        gridRow: '1 / 2'
      },
      {
        id: 'area-2',
        blockId: 'block-2',
        gridColumn: '1 / 2',
        gridRow: '2 / 3'
      },
      {
        id: 'area-3',
        blockId: 'block-3',
        gridColumn: '2 / 3',
        gridRow: '2 / 3'
      }
    ]
  }
};

export const TEMPLATE_FOCUS_LEFT: ContentTemplate = {
  type: 'focus-left',
  name: 'Foco izquierdo',
  description: 'Columna amplia a la izquierda (70%) con columna estrecha a la derecha (30%)',
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
    columns: 10,
    rows: 1,
    areas: [
      {
        id: 'area-1',
        blockId: 'block-1',
        gridColumn: '1 / 8',
        gridRow: '1 / 2'
      },
      {
        id: 'area-2',
        blockId: 'block-2',
        gridColumn: '8 / 11',
        gridRow: '1 / 2'
      }
    ]
  }
};

export const TEMPLATE_FOCUS_RIGHT: ContentTemplate = {
  type: 'focus-right',
  name: 'Foco derecho',
  description: 'Columna estrecha a la izquierda (30%) con columna amplia a la derecha (70%)',
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
    columns: 10,
    rows: 1,
    areas: [
      {
        id: 'area-1',
        blockId: 'block-1',
        gridColumn: '1 / 4',
        gridRow: '1 / 2'
      },
      {
        id: 'area-2',
        blockId: 'block-2',
        gridColumn: '4 / 11',
        gridRow: '1 / 2'
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
  'sidebar-left': TEMPLATE_SIDEBAR_LEFT,
  'sidebar-right': TEMPLATE_SIDEBAR_RIGHT,
  'header-content': TEMPLATE_HEADER_CONTENT,
  'focus-left': TEMPLATE_FOCUS_LEFT,
  'focus-right': TEMPLATE_FOCUS_RIGHT,
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

// Configuraciones de plantillas para el sistema resizable
const TEMPLATE_CONFIGS: Record<TemplateType, { direction: 'horizontal' | 'vertical'; sizes: number[] } | null> = {
  'single': { direction: 'vertical', sizes: [100] },
  'two-col': { direction: 'horizontal', sizes: [50, 50] },
  'two-row': { direction: 'vertical', sizes: [50, 50] },
  'triple': { direction: 'horizontal', sizes: [50, 50] },
  'quad': { direction: 'horizontal', sizes: [50, 50] },
  'sidebar-left': { direction: 'horizontal', sizes: [33, 67] },
  'sidebar-right': { direction: 'horizontal', sizes: [67, 33] },
  'header-content': { direction: 'vertical', sizes: [30, 70] },
  'focus-left': { direction: 'horizontal', sizes: [70, 30] },
  'focus-right': { direction: 'horizontal', sizes: [30, 70] },
  'custom': null
};

export function createBlocksFromTemplate(type: TemplateType) {
  const template = getTemplate(type);
  const config = TEMPLATE_CONFIGS[type];

  if (!template || !config) return { direction: 'vertical' as const, blocks: [] };

  return {
    direction: config.direction,
    blocks: template.blocks.map((block, index) => ({
      id: `block-${Date.now()}-${index}`,
      content: { ...block, id: `block-${Date.now()}-${index}` },
      defaultSize: config.sizes[index] || 100 / template.blocks.length,
    }))
  };
}
