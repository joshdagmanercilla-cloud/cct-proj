import React, { useState } from 'react';
import { Plus, Edit3, Trash2, MapPin, Lock, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CommuteRoute } from '../../types';
import { apiRequest } from '../../utils/api';

interface RouteForm {
  originBarangay: string;
  destinationArea: string;
  distanceKm: string;
  estimatedMinutes: string;
  farePhp: string;
  modesText: string;
  stopsText: string;
  advisory: string;
}

const EMPTY_ROUTE: RouteForm = {
  originBarangay: 'Marabulig 1, Cauayan City',
  destinationArea: '',
  distanceKm: '3.5',
  estimatedMinutes: '12',
  farePhp: '25',
  modesText: 'Tricycle, Regular Jeepney',
  stopsText: 'Brgy. Hall, Maharlika Highway, Destination Terminal',
  advisory: 'Standard daytime transit route.',
};

export const AdminCommutePage: React.FC = () => {
  const { commuteRoutes, refreshCommuteRoutes, currentUser, notify } = useApp();
  const isSuperAdmin = currentUser.role === 'super_admin';

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RouteForm>(EMPTY_ROUTE);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_ROUTE);
    setModalOpen(true);
  };

  const openEdit = (route: CommuteRoute) => {
    setEditingId(route.id);
    setForm({
      originBarangay: route.originBarangay,
      destinationArea: route.destinationArea,
      distanceKm: String(route.distanceKm),
      estimatedMinutes: String(route.estimatedMinutes),
      farePhp: String(route.farePhp),
      modesText: route.modes.join(', '),
      stopsText: route.stops.join(', '),
      advisory: route.advisory,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    setSaving(true);
    try {
      const payload = {
        originBarangay: form.originBarangay,
        destinationArea: form.destinationArea,
        distanceKm: Number(form.distanceKm) || 3,
        estimatedMinutes: Number(form.estimatedMinutes) || 10,
        farePhp: Number(form.farePhp) || 20,
        modes: form.modesText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        stops: form.stopsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        advisory: form.advisory,
      };

      if (editingId) {
        await apiRequest(`/api/admin/commute/routes/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        notify('Commute route updated and synced to Job Seeker guide.', 'success');
      } else {
        await apiRequest('/api/admin/commute/routes', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        notify('New commute route published.', 'success');
      }
      setModalOpen(false);
      await refreshCommuteRoutes();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Unable to save route.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (route: CommuteRoute) => {
    if (!isSuperAdmin) return;
    try {
      await apiRequest(`/api/admin/commute/routes/${route.id}`, { method: 'DELETE' });
      notify(`Deleted route ${route.originBarangay} -> ${route.destinationArea}.`, 'info');
      await refreshCommuteRoutes();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to delete route.', 'error');
    }
  };

  return (
    <div className="space-y-5">
      {!isSuperAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-900 flex items-center gap-2">
          <Lock className="w-4 h-4 shrink-0" />
          <span>
            Read-only mode: Only <strong>Super Admin</strong> users can modify official fares, commute times, or stops. Updates automatically recalculate estimates across the Job Seeker site.
          </span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Cauayan City Commute Matrix ({commuteRoutes.length} routes)
          </h2>
          <p className="text-xs text-slate-600">
            Every fare, transit mode, and stop list edited here updates Applicant "How to get there" panels immediately.
          </p>
        </div>
        {isSuperAdmin && (
          <button
            type="button"
            onClick={openCreate}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Commute Route
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Origin → Destination</th>
                <th className="py-3 px-4 font-semibold">Distance / Time</th>
                <th className="py-3 px-4 font-semibold">Fare (₱)</th>
                <th className="py-3 px-4 font-semibold">Modes &amp; Stops</th>
                <th className="py-3 px-4 font-semibold">Updated</th>
                {isSuperAdmin && <th className="py-3 px-4 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {commuteRoutes.map((route) => (
                <tr key={route.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>
                        {route.originBarangay} → {route.destinationArea}
                      </span>
                    </div>
                    <div className="text-slate-500 mt-0.5">{route.advisory}</div>
                  </td>
                  <td className="py-3 px-4 tabular-nums whitespace-nowrap text-slate-800">
                    <div>{route.distanceKm} km</div>
                    <div className="text-slate-500">{route.estimatedMinutes} mins</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-800 tabular-nums whitespace-nowrap">
                    ₱{route.farePhp}
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-medium text-slate-800">{route.modes.join(' · ')}</div>
                    <div className="text-slate-500 truncate">{route.stops.join(' → ')}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    <div>{route.updatedAt}</div>
                    <div className="text-[11px]">{route.updatedBy}</div>
                  </td>
                  {isSuperAdmin && (
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEdit(route)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded mr-1"
                        title="Edit route"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(route)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete route"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? 'Edit Commute Route' : 'Add Official Commute Route'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Origin Barangay *</label>
                  <input
                    required
                    type="text"
                    value={form.originBarangay}
                    onChange={(e) => setForm({ ...form, originBarangay: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination Area *</label>
                  <input
                    required
                    type="text"
                    value={form.destinationArea}
                    onChange={(e) => setForm({ ...form, destinationArea: e.target.value })}
                    placeholder="e.g., San Fermin, Cauayan City"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.distanceKm}
                    onChange={(e) => setForm({ ...form, distanceKm: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Est. Minutes</label>
                  <input
                    type="number"
                    value={form.estimatedMinutes}
                    onChange={(e) => setForm({ ...form, estimatedMinutes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fare (₱)</label>
                  <input
                    type="number"
                    value={form.farePhp}
                    onChange={(e) => setForm({ ...form, farePhp: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Transport Modes (comma-separated)
                </label>
                <input
                  type="text"
                  value={form.modesText}
                  onChange={(e) => setForm({ ...form, modesText: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Key Stops (comma-separated)
                </label>
                <input
                  type="text"
                  value={form.stopsText}
                  onChange={(e) => setForm({ ...form, stopsText: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Commuter Advisory</label>
                <input
                  type="text"
                  value={form.advisory}
                  onChange={(e) => setForm({ ...form, advisory: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-700 border border-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
