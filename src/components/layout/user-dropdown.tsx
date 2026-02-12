'use client';

import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  owner: 'Dueño',
  seller: 'Vendedor',
};

interface UserDropdownProps {
  user: {
    name: string;
    email: string;
    role: 'admin' | 'owner' | 'seller';
  };
}

export function UserDropdown({ user }: UserDropdownProps) {
  const router = useRouter();

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Avatar className="size-9">
            <AvatarImage src="" alt={user.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2">
        <DropdownMenuItem className="cursor-pointer p-0" onClick={() => router.push('/profile')}>
          <div className="flex items-center gap-4 p-3">
            <Avatar size="lg">
              <AvatarImage src="" alt={user.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              <p className="text-xs leading-none text-muted-foreground">{ROLE_LABELS[user.role]}</p>
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
