import { useState } from 'react';
import { toast } from 'sonner';

import type { Brand, Category, Quality, Presentation } from '@/payload-types';

import {
  createBrandAction,
  updateBrandAction,
  createCategoryAction,
  updateCategoryAction,
  createQualityAction,
  updateQualityAction,
  createPresentationAction,
  updatePresentationAction,
} from '../../entity-actions';
import type { EntityType, EntityDialogState } from '../types';

interface UseEntityDialogProps {
  setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setQualities: React.Dispatch<React.SetStateAction<Quality[]>>;
  setPresentations: React.Dispatch<React.SetStateAction<Presentation[]>>;
  setValue: (name: 'brandId' | 'categoryId' | 'qualityId', value: string) => void;
  onRefreshEntities: () => void;
}

export function useEntityDialog({
  setBrands,
  setCategories,
  setQualities,
  setPresentations,
  setValue,
  onRefreshEntities,
}: UseEntityDialogProps) {
  const [entityDialog, setEntityDialog] = useState<EntityDialogState>({
    isOpen: false,
    type: null,
    mode: 'create',
  });
  const [entityName, setEntityName] = useState('');

  const openCreateEntity = (type: EntityType) => {
    setEntityDialog({ isOpen: true, type, mode: 'create' });
    setEntityName('');
  };

  const openEditEntity = (type: EntityType, id: number, currentValue: string) => {
    setEntityDialog({ isOpen: true, type, mode: 'edit', id, currentValue });
    setEntityName(currentValue);
  };

  const closeEntityDialog = () => {
    setEntityDialog({ isOpen: false, type: null, mode: 'create' });
    setEntityName('');
  };

  const getEntityLabel = (type: EntityType) => {
    const labels = {
      brand: 'Marca',
      category: 'Categoría',
      quality: 'Calidad',
      presentation: 'Presentación',
    };
    return labels[type];
  };

  const handleSaveEntity = async () => {
    if (!entityDialog.type || !entityName.trim()) return;

    try {
      const { type, mode, id } = entityDialog;

      if (mode === 'create') {
        switch (type) {
          case 'brand': {
            const result = await createBrandAction({ name: entityName });
            if (result?.serverError) {
              toast.error(result.serverError);
              return;
            }
            if (result?.data?.brand) {
              const { brand } = result.data;
              setBrands((prev) => [...prev, brand]);
              setValue('brandId', brand.id.toString());
            }
            break;
          }
          case 'category': {
            const result = await createCategoryAction({ name: entityName });
            if (result?.serverError) {
              toast.error(result.serverError);
              return;
            }
            if (result?.data?.category) {
              const { category } = result.data;
              setCategories((prev) => [...prev, category]);
              setValue('categoryId', category.id.toString());
            }
            break;
          }
          case 'quality': {
            const result = await createQualityAction({ name: entityName });
            if (result?.serverError) {
              toast.error(result.serverError);
              return;
            }
            if (result?.data?.quality) {
              const { quality } = result.data;
              setQualities((prev) => [...prev, quality]);
              setValue('qualityId', quality.id.toString());
            }
            break;
          }
          case 'presentation': {
            const result = await createPresentationAction({
              label: entityName,
            });
            if (result?.serverError) {
              toast.error(result.serverError);
              return;
            }
            if (result?.data?.presentation) {
              const { presentation } = result.data;
              setPresentations((prev) => [...prev, presentation]);
            }
            break;
          }
        }
        toast.success(`${getEntityLabel(type)} creada exitosamente`);
      } else if (mode === 'edit' && id) {
        switch (type) {
          case 'brand': {
            const result = await updateBrandAction({ id, name: entityName });
            if (result?.serverError) {
              toast.error(result.serverError);
              return;
            }
            if (result?.data?.brand) {
              const { brand } = result.data;
              setBrands((prev) => prev.map((b) => (b.id === id ? brand : b)));
            }
            break;
          }
          case 'category': {
            const result = await updateCategoryAction({ id, name: entityName });
            if (result?.serverError) {
              toast.error(result.serverError);
              return;
            }
            if (result?.data?.category) {
              const { category } = result.data;
              setCategories((prev) => prev.map((c) => (c.id === id ? category : c)));
            }
            break;
          }
          case 'quality': {
            const result = await updateQualityAction({ id, name: entityName });
            if (result?.serverError) {
              toast.error(result.serverError);
              return;
            }
            if (result?.data?.quality) {
              const { quality } = result.data;
              setQualities((prev) => prev.map((q) => (q.id === id ? quality : q)));
            }
            break;
          }
          case 'presentation': {
            const result = await updatePresentationAction({
              id,
              label: entityName,
            });
            if (result?.serverError) {
              toast.error(result.serverError);
              return;
            }
            if (result?.data?.presentation) {
              const { presentation } = result.data;
              setPresentations((prev) => prev.map((p) => (p.id === id ? presentation : p)));
            }
            break;
          }
        }
        toast.success(`${getEntityLabel(type)} actualizada exitosamente`);
      }

      closeEntityDialog();
      onRefreshEntities();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar');
    }
  };

  return {
    entityDialog,
    entityName,
    setEntityName,
    openCreateEntity,
    openEditEntity,
    closeEntityDialog,
    handleSaveEntity,
    getEntityLabel,
  };
}
