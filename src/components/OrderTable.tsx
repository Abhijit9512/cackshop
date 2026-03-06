import { useState } from 'react';
import type { Order } from '../types/database';
import { ChevronDown, ChevronUp, Package, User, Phone, MapPin, Calendar, MessageSquare, CreditCard, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderTableProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
}

const statusColors: Record<string, string> = {
  'Pending Payment': 'bg-red-100 text-red-800 border-red-200',
  'New': 'bg-blue-100 text-blue-800 border-blue-200',
  'Preparing': 'bg-amber-100 text-amber-800 border-amber-200',
  'Completed': 'bg-green-100 text-green-800 border-green-200',
  'Delivered': 'bg-purple-100 text-purple-800 border-purple-200',
};

const statusOptions: Order['status'][] = ['New', 'Preparing', 'Completed', 'Delivered'];

export default function OrderTable({ orders, onUpdateStatus }: OrderTableProps) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <motion.div
          key={order.id}
          layout
          className={`bg-white rounded-xl shadow-md overflow-hidden border ${
            order.status === 'Pending Payment' ? 'border-red-200' : 'border-gray-100'
          }`}
        >
          {/* Order Header */}
          <div
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleExpand(order.id)}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${
                  order.status === 'Pending Payment' ? 'bg-red-100' : 'bg-rose-100'
                }`}>
                  {order.status === 'Pending Payment' ? (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <Package className="w-5 h-5 text-rose-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(order.created_at)} • {order.customer_name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[order.status] || statusColors['New']}`}>
                  {order.status}
                </span>
                <span className="font-bold text-rose-600">₹{order.total_price}</span>
                {expandedOrder === order.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Order Details */}
          <AnimatePresence>
            {expandedOrder === order.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-gray-100"
              >
                {/* Pending Payment Warning */}
                {order.status === 'Pending Payment' && (
                  <div className="p-4 bg-red-50 border-b border-red-100">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Payment Pending</span>
                    </div>
                    <p className="text-sm text-red-600 mt-1">
                      Customer has not completed the payment. Do not process this order until payment is received.
                    </p>
                  </div>
                )}

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800 mb-2">Customer Details</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4 text-rose-500" />
                      <span>{order.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-rose-500" />
                      <span>{order.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-rose-500 mt-0.5" />
                      <span>{order.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-rose-500" />
                      <span>Delivery: {formatDate(order.delivery_date)}</span>
                    </div>
                    {order.instructions && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MessageSquare className="w-4 h-4 text-rose-500 mt-0.5" />
                        <span>{order.instructions}</span>
                      </div>
                    )}
                    
                    {/* Payment Status */}
                    <div className="flex items-center gap-2 text-sm mt-4 pt-3 border-t border-gray-100">
                      <CreditCard className="w-4 h-4 text-rose-500" />
                      <span className="font-medium text-gray-700">Payment:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        order.status === 'Pending Payment' 
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {order.status === 'Pending Payment' ? 'Pending' : 'Paid'}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          className="bg-gray-50 rounded-lg p-3 text-sm"
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">{item.cake_name}</span>
                            <span className="text-rose-600 font-semibold">₹{item.price}</span>
                          </div>
                          <div className="text-gray-500 mt-1">
                            {item.weight} × {item.quantity}
                            {item.message_on_cake && (
                              <span className="block text-rose-500">
                                Message: "{item.message_on_cake}"
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Update Status */}
                {order.status !== 'Pending Payment' && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-medium text-gray-700">Update Status:</span>
                      <div className="flex gap-2 flex-wrap">
                        {statusOptions.map((status) => (
                          <button
                            key={status}
                            onClick={() => onUpdateStatus(order.id, status)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                              order.status === status
                                ? statusColors[status] + ' ring-2 ring-offset-2 ring-current'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
