import { redirect } from 'next/navigation';

import { getMobileSellerInventory } from '@/app/services/mobile-seller';
import { MobileInventorySection } from '@/components/mobile-inventory/mobile-inventory-section';
import { getCurrentUser } from '@/lib/payload';

export default async function MobileInventoryPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'seller' || user.sellerType !== 'mobile') {
    redirect('/');
  }

  const inventory = await getMobileSellerInventory(user.id);

  return <MobileInventorySection inventory={inventory} />;
}
