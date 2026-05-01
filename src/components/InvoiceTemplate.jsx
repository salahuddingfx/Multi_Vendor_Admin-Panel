import React from 'react';

const InvoiceTemplate = React.forwardRef(({ order }, ref) => {
  return (
    <div style={{ display: 'none' }}>
      {order && (
        <div ref={ref} className="print-invoice" style={{
          width: '5.5in',
          height: '8.5in',
          padding: '0.5in',
          backgroundColor: 'white',
          color: '#333',
          fontFamily: "'Inter', sans-serif",
          boxSizing: 'border-box',
          position: 'relative'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, letterSpacing: '1px' }}>{order.site_id === 1 ? 'ACHARU' : 'TAJA SHUTKI'}</h1>
              <p style={{ margin: 0, fontSize: '10px', color: '#666', fontWeight: 'bold' }}>Artisanal Quality Delivered</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 900 }}>INVOICE</h2>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: 'bold' }}>#{order.tracking_id || order.id}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <h4 style={{ fontSize: '9px', textTransform: 'uppercase', color: '#888', margin: '0 0 5px' }}>Bill To:</h4>
              <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '2px 0' }}>{order.customer_name}</p>
              <p style={{ fontSize: '11px', margin: '2px 0', opacity: 0.8 }}>{order.customer_phone}</p>
              <p style={{ fontSize: '11px', margin: '2px 0', opacity: 0.8, lineHeight: '1.4' }}>{order.customer_address || order.address}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h4 style={{ fontSize: '9px', textTransform: 'uppercase', color: '#888', margin: '0 0 5px' }}>Order Details:</h4>
              <p style={{ fontSize: '11px', margin: '2px 0' }}>Date: <strong>{new Date(order.created_at).toLocaleDateString()}</strong></p>
              <p style={{ fontSize: '11px', margin: '2px 0' }}>Method: <strong>{order.payment_method?.toUpperCase() || 'COD'}</strong></p>
              <p style={{ fontSize: '11px', margin: '2px 0' }}>Status: <strong style={{ color: order.payment_status === 'paid' ? '#10b981' : '#f43f5e' }}>{order.payment_status?.toUpperCase()}</strong></p>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #000' }}>
                <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '9px', textTransform: 'uppercase', color: '#888' }}>Item</th>
                <th style={{ textAlign: 'center', padding: '8px 0', fontSize: '9px', textTransform: 'uppercase', color: '#888' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '9px', textTransform: 'uppercase', color: '#888' }}>Price</th>
                <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '9px', textTransform: 'uppercase', color: '#888' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '0.5px solid #eee' }}>
                  <td style={{ padding: '8px 0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ fontSize: '9px', color: '#888' }}>{item.weight || 0.5}kg</div>
                  </td>
                  <td style={{ padding: '8px 0', textAlign: 'center', fontSize: '11px' }}>{item.quantity}</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontSize: '11px' }}>৳{item.price}</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontSize: '11px', fontWeight: 'bold' }}>৳{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ width: '180px', marginLeft: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', margin: '3px 0' }}>
              <span>Subtotal:</span>
              <span>৳{order.subtotal || order.total_amount - (order.delivery_charge || 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', margin: '3px 0' }}>
              <span>Delivery:</span>
              <span>৳{order.delivery_charge || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 900, marginTop: '10px', paddingTop: '10px', borderTop: '1.5px solid #000' }}>
              <span>TOTAL:</span>
              <span>৳{order.total_amount}</span>
            </div>
          </div>

          {/* Footer */}
          <div style={{ position: 'absolute', bottom: '0.5in', left: '0.5in', right: '0.5in', textAlign: 'center', borderTop: '0.5px solid #eee', paddingTop: '15px' }}>
            <p style={{ margin: 0, fontSize: '10px', fontStyle: 'italic', color: '#999' }}>Thank you for your order!</p>
            <p style={{ margin: '5px 0 0', fontSize: '8px', color: '#ccc' }}>This is a computer generated invoice.</p>
          </div>
        </div>
      )}

      <style>
        {`
          @media print {
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
              width: 5.5in !important;
              height: 8.5in !important;
              margin: 0 !important;
              padding: 0.5in !important;
              background-color: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>
    </div>
  );
});

export default InvoiceTemplate;
