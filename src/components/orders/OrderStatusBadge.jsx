// Order Status Badge Component
import React from 'react';
import { Badge } from '../ui/Badge.jsx';

export function OrderStatusBadge({ status, size = 'md' }) {
  switch (status) {
    case 'new':
      return (
        <Badge variant="info" size={size} dot>
          Baru
        </Badge>
      );
    case 'processing':
      return (
        <Badge variant="warning" size={size} dot>
          Diproses
        </Badge>
      );
    case 'ready':
      return (
        <Badge variant="success" size={size} dot>
          Siap Kirim
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="neutral" size={size} dot>
          Selesai
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="danger" size={size} dot>
          Dibatalkan
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" size={size}>
          {status || 'Unknown'}
        </Badge>
      );
  }
}
