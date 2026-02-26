'use client';

import { Package } from 'lucide-react';

import type { MobileInventoryItem } from '@/app/services/mobile-seller';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface MobileInventorySectionProps {
  inventory: MobileInventoryItem[];
}

export function MobileInventorySection({ inventory }: MobileInventorySectionProps) {
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Mi Inventario" description="Stock que llevás en tu vehículo" />

      <main className="flex-1 space-y-4 px-4 pb-6 sm:px-6">
        {inventory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <Package className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No tenés stock asignado actualmente.</p>
            <p className="text-sm text-muted-foreground">El dueño te asignará stock cuando salgas a trabajar.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{inventory.length} productos</Badge>
              <Badge variant="outline">{totalItems} unidades totales</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {inventory.map((item) => (
                <Card key={item.variantId}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.productName}</p>
                        {item.presentationName && (
                          <p className="text-sm text-muted-foreground truncate">{item.presentationName}</p>
                        )}
                        {item.code && <p className="text-xs text-muted-foreground font-mono">{item.code}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-2xl font-bold tabular-nums">{item.quantity}</p>
                        <p className="text-xs text-muted-foreground">unidades</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
