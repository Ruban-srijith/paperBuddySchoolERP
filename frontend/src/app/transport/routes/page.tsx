"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

interface Route {
  id: string;
  name: string;
  start_point: string;
  end_point: string;
  total_stops: number;
}

interface Stop {
  id: string;
  stop_name: string;
  pickup_time: string;
  drop_time: string;
  monthly_fee: number;
}

export default function RoutesManagementPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoute, setNewRoute] = useState({
    name: "",
    start_point: "",
    end_point: ""
  });
  
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [newStop, setNewStop] = useState({
    stop_name: "",
    pickup_time: "08:00",
    drop_time: "15:00",
    monthly_fee: "" as number | string
  });
  useEffect(() => {
    fetchRoutes();
  }, []);

  async function fetchRoutes() {
    try {
      const res = await api.get("/transport/routes");
      setRoutes(res.data);
    } catch (err) {
      console.error("Failed to fetch routes", err);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/transport/routes", newRoute);
      setIsModalOpen(false);
      setNewRoute({ name: "", start_point: "", end_point: "" });
      fetchRoutes();
    } catch (err) {
      console.error("Failed to create route", err);
    }
  };

  const openStopsModal = async (routeId: string) => {
    setSelectedRouteId(routeId);
    try {
      const res = await api.get(`/transport/stops/${routeId}`);
      setStops(res.data);
    } catch (err) {
      console.error("Failed to fetch stops", err);
    }
  };

  const handleCreateStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRouteId) return;
    try {
      await api.post("/transport/stops", { 
        ...newStop, 
        route_id: selectedRouteId,
        monthly_fee: Number(newStop.monthly_fee) || 0 
      });
      setNewStop({ stop_name: "", pickup_time: "08:00", drop_time: "15:00", monthly_fee: "" });
      const res = await api.get(`/transport/stops/${selectedRouteId}`);
      setStops(res.data);
      fetchRoutes();
    } catch (err) {
      console.error("Failed to create stop", err);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight">
              Routes & Stops
            </h1>
            <p className="text-xs text-gray-600">
              Manage transport routes and map waypoints.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Route</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
              No routes defined yet.
            </div>
          ) : (
            routes.map(r => (
              <div key={r.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col space-y-4 hover:border-indigo-200 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-bold text-gray-900">{r.name}</h3>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{r.total_stops} Stops</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>From:</strong> {r.start_point}</p>
                  <p><strong>To:</strong> {r.end_point}</p>
                </div>
                <div className="pt-4 mt-auto border-t border-gray-100">
                  <button onClick={() => openStopsModal(r.id)} className="text-indigo-600 text-sm font-medium hover:text-indigo-800">Manage Stops →</button>
                </div>
              </div>
            ))
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Route</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Route Name</label>
                  <input 
                    type="text" 
                    required 
                    value={newRoute.name}
                    onChange={e => setNewRoute({...newRoute, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Route A (City Center)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Point</label>
                  <input 
                    type="text" 
                    required 
                    value={newRoute.start_point}
                    onChange={e => setNewRoute({...newRoute, start_point: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Main Station"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Point</label>
                  <input 
                    type="text" 
                    required 
                    value={newRoute.end_point}
                    onChange={e => setNewRoute({...newRoute, end_point: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. School Campus"
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
                    Create Route
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedRouteId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Manage Route Stops</h2>
                <button onClick={() => setSelectedRouteId(null)} className="text-gray-500 hover:text-gray-700 font-bold text-xl">✕</button>
              </div>
              
              <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-4">
                {stops.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No stops added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {stops.map(stop => (
                      <div key={stop.id} className="p-3 border border-gray-200 rounded-xl flex justify-between items-center bg-gray-50/50">
                        <div>
                          <p className="font-medium text-gray-900">{stop.stop_name}</p>
                          <p className="text-xs text-gray-500">Pick-up: {stop.pickup_time || '-'} | Drop: {stop.drop_time || '-'}</p>
                        </div>
                        <span className="text-sm font-bold text-gray-700">₹{stop.monthly_fee}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mt-auto">
                <h3 className="font-semibold text-gray-800 text-sm mb-3">Add New Stop</h3>
                <form onSubmit={handleCreateStop} className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <input type="text" required placeholder="Stop Name" value={newStop.stop_name} onChange={e => setNewStop({...newStop, stop_name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Pickup Time</label>
                    <input type="time" value={newStop.pickup_time} onChange={e => setNewStop({...newStop, pickup_time: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Drop Time</label>
                    <input type="time" value={newStop.drop_time} onChange={e => setNewStop({...newStop, drop_time: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="col-span-2 flex items-end space-x-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Monthly Fee (₹)</label>
                      <input type="number" min="0" value={newStop.monthly_fee} onChange={e => setNewStop({...newStop, monthly_fee: e.target.value === "" ? "" : parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg whitespace-nowrap h-[38px]">
                      Add Stop
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
