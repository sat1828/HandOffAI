import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'CRITICAL': return 'var(--critical)';
    case 'WARNING': return 'var(--warning)';
    case 'INFO': return 'var(--info)';
    default: return 'var(--ink-4)';
  }
}

export function getAcuityLabel(acuity: number): string {
  switch (acuity) {
    case 1: return 'Critical';
    case 2: return 'High';
    case 3: return 'Moderate';
    case 4: return 'Low';
    case 5: return 'Stable';
    default: return 'Unknown';
  }
}

export function getAcuityColor(acuity: number): string {
  if (acuity <= 1) return 'var(--critical)';
  if (acuity <= 2) return 'var(--warning)';
  if (acuity >= 5) return 'var(--emerald)';
  return 'var(--info)';
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
