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
  add: {
    en: 'Add',
    es: 'Agregar',
  },
  allFieldsRequired: {
    en: 'All fields are required.',
    es: 'Todos los campos son obligatorios.'
  },
  stockMustBeNonNegative: {
    en: 'Stock must be a non-negative number.',
    es: 'Inventario debe ser un número no negativo.'
  },
  errorAddingItem: {
    en: 'Error adding item.',
    es: 'Error al agregar el artículo.'
  },
  errorUpdatingItem: {
    en: 'Error updating item.',
    es: 'Error al actualizar el artículo.'
  },
  networkError: {
    en: 'Network error.',
    es: 'Error de red.'
  },
  errorDeletingItem: {
    en: 'Error deleting item.',
    es: 'Error al eliminar el artículo.'
  },
};

export function t(key, lang = 'en') {
  return translations[key]?.[lang] || key;
}

export default translations; 