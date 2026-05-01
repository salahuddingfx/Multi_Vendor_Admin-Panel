import React from 'react';

const InvoiceTemplate = React.forwardRef(({ order }, ref) => {
  return (
    <div style={{ display: 'none' }}>
      {order && (
        <div ref={ref} className="print-invoice" style={{
          width: '1.5in',
          padding: '0.1in',
          backgroundColor: 'white',
          color: '#000',
          fontFamily: "'Courier New', Courier, monospace",
          boxSizing: 'border-box',
          lineHeight: '1.2'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '5px', marginBottom: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              {order.site_id === 1 ? 'ACHARU' : 'TAJA SHUTKI'}
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '8px' }}>Order: #{order.tracking_id?.slice(-6) || order.id}</p>
            <p style={{ margin: '1px 0 0', fontSize: '7px' }}>{new Date(order.created_at).toLocaleDateString()}</p>
          </div>

          {/* Customer */}
          <div style={{ marginBottom: '10px', fontSize: '8px', borderBottom: '1px dashed #000', paddingBottom: '5px' }}>
            <p style={{ margin: '0', fontWeight: 'bold' }}>To: {order.customer_name}</p>
            <p style={{ margin: '1px 0' }}>{order.customer_phone}</p>
            <p style={{ margin: '1px 0', fontSize: '7px', lineHeight: '1.1' }}>{order.customer_address}</p>
          </div>

          {/* Items */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '2px', marginBottom: '3px' }}>
              <span>Item</span>
              <span>Total</span>
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ marginBottom: '4px' }}>
                <div style={{ fontSize: '8px', fontWeight: 'bold' }}>{item.quantity}x {item.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px' }}>
                  <span>@ ৳{item.price}</span>
                  <span>৳{item.price * item.quantity}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ borderTop: '1px dashed #000', paddingTop: '5px', fontSize: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Subtotal:</span>
              <span>৳{order.subtotal || order.total_amount - (order.delivery_charge || 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Delivery:</span>
              <span>৳{order.delivery_charge || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold', marginTop: '3px', borderTop: '1px solid #000', paddingTop: '3px' }}>
              <span>TOTAL:</span>
              <span>৳{order.total_amount}</span>
            </div>
          </div>

          {/* Payment */}
          <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '8px', borderTop: '1px dashed #000', paddingTop: '5px' }}>
            <p style={{ margin: 0 }}>Method: {order.payment_method?.toUpperCase()}</p>
            <p style={{ margin: '2px 0 0', fontWeight: 'bold' }}>{order.payment_status?.toUpperCase()}</p>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '15px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '5px' }}>
            <p style={{ margin: 0, fontSize: '7px' }}>Thank you for your order!</p>
          </div>
        </div>
      )}

      <style>
        {`
          @media print {
            @page {
              margin: 0;
              size: 1.5in auto;
            }
            body * {
              visibility: hidden;
            }
            .print-invoice, .print-invoice * {
              visibility: visible;
            }
            .print-invoice {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 1.5in !important;
              margin: 0 !important;
              padding: 0.1in !important;
              background-color: white !important;
            }
          }
        `}
      </style>
    </div>
  );
});

export default InvoiceTemplate;
