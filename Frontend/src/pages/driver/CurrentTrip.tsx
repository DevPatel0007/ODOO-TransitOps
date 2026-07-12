/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  MapPin, 
  Navigation,
  FileText,
  Camera,
  MessageCircle,
  Phone,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockTrips } from '@/src/data';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

export default function DriverCurrentTrip() {
  const [tripStatus, setTripStatus] = useState<'IDLE' | 'STARTED' | 'COMPLETED'>('STARTED');
  const trip = mockTrips[0];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header with Back button */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" render={<Link to="/driver" />} nativeButton={false} className="h-8 w-8">
           <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">Trip Details</h2>
      </div>

      {/* Main Trip Card */}
      <Card className="border-none shadow-md overflow-hidden bg-white">
        <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between py-4">
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-3 py-1 font-bold">
            {tripStatus === 'STARTED' ? 'IN TRANSIT' : 'IDLE'}
          </Badge>
          <span className="text-xs font-mono font-bold text-slate-400">ID: {trip.id}</span>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-8">
            {/* Route Timeline */}
            <div className="relative pl-6 space-y-8 before:absolute before:left-1.5 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-slate-100 before:border-dashed before:border-l-2 before:border-slate-300">
              <div className="relative">
                <div className="absolute -left-[24.5px] top-1 w-4 h-4 rounded-full border-4 border-white bg-blue-600 shadow-sm"></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Source</p>
                  <p className="text-lg font-bold text-slate-900">{trip.source}</p>
                  <p className="text-sm text-slate-500">Pickup Location • Warehouse 4</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-[24.5px] top-1 w-4 h-4 rounded-full border-4 border-white bg-slate-200 shadow-sm"></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Destination</p>
                  <p className="text-lg font-bold text-slate-900">{trip.destination}</p>
                  <p className="text-sm text-slate-500">Drop Point • {trip.client} Yard</p>
                </div>
              </div>
            </div>

            {/* Shipment Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Consignment</p>
                  <p className="font-bold text-slate-900 text-sm">Industrial Materials</p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Weight</p>
                  <p className="font-bold text-slate-900 text-sm">18.5 Tons</p>
               </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 font-bold text-md rounded-2xl shadow-lg border-blue-500 gap-3">
                <Navigation className="w-6 h-6" />
                Open GPS Navigation
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-14 font-bold text-slate-700 border-slate-200 rounded-2xl gap-3">
                  <Camera className="w-5 h-5 text-slate-400" />
                  Proof (POD)
                </Button>
                <Button variant="outline" className="h-14 font-bold text-slate-700 border-slate-200 rounded-2xl gap-3">
                  <FileText className="w-5 h-5 text-slate-400" />
                  Expenses
                </Button>
              </div>

              <AnimatePresence mode="wait">
                {tripStatus === 'STARTED' ? (
                  <motion.div
                    key="end-trip"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Button 
                      variant="destructive" 
                      className="w-full h-14 font-bold text-md rounded-2xl shadow-xl shadow-red-100 gap-3 mt-4"
                      onClick={() => setTripStatus('COMPLETED')}
                    >
                      <Square className="w-5 h-5 fill-white" />
                      Complete Delivery
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="trip-done"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 bg-green-50 rounded-2xl border border-green-200 flex items-center justify-center gap-3 text-green-700 font-bold text-lg mt-4"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    Trip Completed!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support & Contact */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 px-1">Emergency & Support</h3>
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-200 font-bold text-slate-600 gap-2">
            <Phone className="w-4 h-4 text-slate-400" />
            Contact Yard
          </Button>
          <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-200 font-bold text-slate-600 gap-2">
            <MessageCircle className="w-4 h-4 text-slate-400" />
            Chat Hub
          </Button>
        </div>
      </div>
    </div>
  );
}
