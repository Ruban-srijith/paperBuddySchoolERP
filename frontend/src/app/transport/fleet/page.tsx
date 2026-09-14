"use client";

import { useEffect, useState } from "react";
import { Bus, Plus, Activity, Settings, User } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

interface Vehicle {
  id: string;
  registration_number: string;
  vehicle_type: string;
  capacity: number;
  is_active: boolean;
}

export default function FleetManagementPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    registration_number: "",
    vehicle_type: "bus",
    capacity: 40
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  async function fetchVehicles() {
    try {
      const res = await api.get("/transport/vehicles");
      setVehicles(res.data);
    } catch (err) {
      console.error("Failed to fetch vehicles", err);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/transport/vehicles", newVehicle);
      setIsModalOpen(false);
      setNewVehicle({ registration_number: "", vehicle_type: "bus", capacity: 40 });
      fetchVehicles();
    } catch (err) {
      console.error("Failed to create vehicle", err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    try {
      await api.put(`/transport/vehicles/${editingVehicle.id}`, {
        registration_number: editingVehicle.registration_number,
        vehicle_type: editingVehicle.vehicle_type,
        capacity: editingVehicle.capacity
      });
      setEditingVehicle(null);
      fetchVehicles();
    } catch (err) {
      console.error("Failed to update vehicle", err);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight">
              Fleet Management
            </h1>
            <p className="text-xs text-gray-600">
              Manage school buses and vans.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Reg Number</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Capacity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No vehicles found. Click "Add Vehicle" to register one.
                  </td>
                </tr>
              ) : (
                vehicles.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">{v.registration_number}</td>
                    <td className="px-6 py-4 capitalize">{v.vehicle_type}</td>
                    <td className="px-6 py-4">{v.capacity} Seats</td>
                    <td className="px-6 py-4">
                      {v.is_active ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">Active</span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-medium">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => setEditingVehicle(v)} className="text-indigo-600 hover:text-indigo-900 font-medium text-xs">Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Vehicle</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Registration Number</label>
                  <input 
                    type="text" 
                    required 
                    value={newVehicle.registration_number}
                    onChange={e => setNewVehicle({...newVehicle, registration_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. MH-12-AB-1234"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <select 
                    value={newVehicle.vehicle_type}
                    onChange={e => setNewVehicle({...newVehicle, vehicle_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="bus">Bus</option>
                    <option value="van">Van</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Capacity</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={newVehicle.capacity}
                    onChange={e => setNewVehicle({...newVehicle, capacity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                  >
                    Add Vehicle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingVehicle && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Vehicle</h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Registration Number</label>
                  <input 
                    type="text" 
                    required 
                    value={editingVehicle.registration_number}
                    onChange={e => setEditingVehicle({...editingVehicle, registration_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <select 
                    value={editingVehicle.vehicle_type}
                    onChange={e => setEditingVehicle({...editingVehicle, vehicle_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="bus">Bus</option>
                    <option value="van">Van</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Capacity</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={editingVehicle.capacity}
                    onChange={e => setEditingVehicle({...editingVehicle, capacity: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setEditingVehicle(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
