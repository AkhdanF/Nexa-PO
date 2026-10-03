// Payment Status Badge Component
import React from 'react';
import { Badge } from '../ui/Badge.jsx';

export function PaymentStatusBadge({ status, size = 'md' }) {
  switch (status) {
    case 'paid':
      return (
        <Badge variant="success" size={size} dot>
          Lunas
        </Badge>
      );
    case 'dp':
      return (
        <Badge variant="warning" size={size} dot>
          DP
        </Badge>
      );
    case 'unpaid':
      return (
        <Badge variant="danger" size={size} dot>
          Belum Lunas
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
