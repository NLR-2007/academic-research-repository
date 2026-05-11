import { useState } from 'react';
import { adminApi } from '../api/endpoints';

export function useAdminActions(onSuccess) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState(null);

  async function approve(id) {
    setIsProcessing(true);
    setActionError(null);
    try {
      await adminApi.approve(id);
      if (onSuccess) await onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to approve paper';
      setActionError(msg);
      alert(msg);
    } finally {
      setIsProcessing(false);
    }
  }

  async function reject(id) {
    const reason = window.prompt('Enter rejection reason');
    if (!reason) return;

    setIsProcessing(true);
    setActionError(null);
    try {
      await adminApi.reject(id, reason);
      if (onSuccess) await onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reject paper';
      setActionError(msg);
      alert(msg);
    } finally {
      setIsProcessing(false);
    }
  }

  async function remove(id) {
    const reason = window.prompt('Enter deletion reason');
    if (!reason) return;

    setIsProcessing(true);
    setActionError(null);
    try {
      await adminApi.deletePaper(id, reason);
      if (onSuccess) await onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete paper';
      setActionError(msg);
      alert(msg);
    } finally {
      setIsProcessing(false);
    }
  }

  return { approve, reject, remove, isProcessing, actionError };
}
