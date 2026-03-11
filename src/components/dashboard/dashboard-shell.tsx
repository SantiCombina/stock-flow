'use client';

import { useState, useTransition } from 'react';

import { getOwnerDashboardStats, getSellerDashboardStats } from '@/app/services/dashboard';
import type { OwnerDashboardStats, Period, SellerDashboardStats } from '@/app/services/dashboard';

import { OwnerDashboard } from './owner-dashboard';
import { SellerDashboard } from './seller-dashboard';

type DashboardShellProps =
  | {
      kind: 'owner';
      userId: number;
      userName: string;
      initialStats: OwnerDashboardStats;
    }
  | {
      kind: 'seller';
      userId: number;
      ownerId: number;
      userName: string;
      initialStats: SellerDashboardStats;
    };

export function DashboardShell(props: DashboardShellProps) {
  const [period, setPeriod] = useState<Period>('month');
  const [stats, setStats] = useState(props.initialStats);
  const [isPending, startTransition] = useTransition();

  function handlePeriodChange(newPeriod: Period) {
    startTransition(async () => {
      if (props.kind === 'owner') {
        const newStats = await getOwnerDashboardStats(props.userId, newPeriod);
        setStats(newStats);
      } else {
        const newStats = await getSellerDashboardStats(props.userId, props.ownerId, newPeriod);
        setStats(newStats);
      }
      setPeriod(newPeriod);
    });
  }

  if (props.kind === 'owner') {
    return (
      <OwnerDashboard
        stats={stats as OwnerDashboardStats}
        userName={props.userName}
        period={period}
        onPeriodChange={handlePeriodChange}
        isPending={isPending}
      />
    );
  }

  return (
    <SellerDashboard
      stats={stats as SellerDashboardStats}
      userName={props.userName}
      period={period}
      onPeriodChange={handlePeriodChange}
      isPending={isPending}
    />
  );
}
