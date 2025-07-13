// Simple i18n translation module for English/Spanish

const translations = {
  inventory: {
    en: 'Inventory',
    es: 'Inventario',
  },
  addItem: {
    en: 'Add Item',
    es: 'Agregar Artículo',
  },
  edit: {
    en: 'Edit',
    es: 'Editar',
  },
  delete: {
    en: 'Delete',
    es: 'Eliminar',
  },
  name: {
    en: 'Name',
    es: 'Nombre',
  },
  model: {
    en: 'Model',
    es: 'Modelo',
  },
  size: {
    en: 'Size',
    es: 'Talla',
  },
  stockLevel: {
    en: 'Stock Level',
    es: 'Inventario',
  },
  lowStock: {
    en: 'Low',
    es: 'Bajo',
  },
  actions: {
    en: 'Actions',
    es: 'Acciones',
  },
  save: {
    en: 'Save',
    es: 'Guardar',
  },
  cancel: {
    en: 'Cancel',
    es: 'Cancelar',
  },
  confirmDelete: {
    en: 'Are you sure?',
    es: '¿Está seguro?',
  },
  yes: {
    en: 'Yes',
    es: 'Sí',
  },
  no: {
    en: 'No',
    es: 'No',
  },
  lowStockWarning: {
    en: 'Low Stock!',
    es: '¡Inventario Bajo!',
  },
};

export function t(key, lang = 'en') {
  return translations[key]?.[lang] || key;
}

export default translations; 