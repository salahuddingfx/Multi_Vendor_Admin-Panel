import React from 'react';

const InvoiceTemplate = React.forwardRef(({ order }, ref) => {
  if (!order) return null;

  return (
    <div style={{ display: 'none' }}>
      <div 
        ref={ref}
        style={{
          width: '5.5in',
          height: '8.5in',
          padding: '0.5in',
          backgroundColor: '#fff',
          color: '#000',
          fontFamily: "'Inter', sans-serif",
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        className="print-invoice"
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>
              {order.siteId === 'acharu' ? 'ACHARU' : 'TAJA SHUTKI'}
            </h1>
            <p style={{ fontSize: '10px', margin: '5px 0 0', opacity: 0.6 }}>Artisanal Quality Delivered</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>INVOICE</h2>
            <p style={{ fontSize: '11px', margin: '2px 0' }}>#{String(order.tracking_id || order.id).split('-')[0].toUpperCase()}</p>
            <p style={{ fontSize: '10px', margin: 0 }}>{new Date(order.created_at || new Date()).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', marginBottom: '5px' }}>Bill To:</p>
            <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '2px 0' }}>{order.customer_name || order.customerName}</p>
            <p style={{ fontSize: '11px', margin: '2px 0', opacity: 0.8 }}>{order.customer_phone || order.phone}</p>
            <p style={{ fontSize: '11px', margin: '2px 0', opacity: 0.8, lineHeight: '1.4' }}>{order.customer_address || order.address}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', marginBottom: '5px' }}>Order Details:</p>
            <p style={{ fontSize: '11px', margin: '2px 0' }}>Status: <span style={{ fontWeight: 'bold' }}>{order.status}</span></p>
            <p style={{ fontSize: '11px', margin: '2px 0' }}>Payment: <span style={{ fontWeight: 'bold' }}>Cash on Delivery</span></p>
          </div>
        </div>

        {/* Items Table */}
        <div style={{ flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <th style={{ textAlign: 'left', fontSize: '10px', padding: '10px 0', textTransform: 'uppercase', color: '#666' }}>Item Description</th>
                <th style={{ textAlign: 'center', fontSize: '10px', padding: '10px 0', textTransform: 'uppercase', color: '#666' }}>Qty</th>
                <th style={{ textAlign: 'right', fontSize: '10px', padding: '10px 0', textTransform: 'uppercase', color: '#666' }}>Price</th>
                <th style={{ textAlign: 'right', fontSize: '10px', padding: '10px 0', textTransform: 'uppercase', color: '#666' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #fafafa' }}>
                  <td style={{ padding: '12px 0', fontSize: '12px' }}>
                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ fontSize: '10px', color: '#888' }}>{item.weight || '500g'}</div>
                  </td>
                  <td style={{ textAlign: 'center', fontSize: '12px' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', fontSize: '12px' }}>৳{item.price}</td>
                  <td style={{ textAlign: 'right', fontSize: '12px', fontWeight: 'bold' }}>৳{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Totals */}
        <div style={{ borderTop: '2px solid #000', paddingTop: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '5px' }}>
            <span style={{ fontSize: '11px', marginRight: '40px' }}>Subtotal:</span>
            <span style={{ fontSize: '11px', fontWeight: 'bold', width: '80px', textAlign: 'right' }}>৳{order.subtotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '5px' }}>
            <span style={{ fontSize: '11px', marginRight: '40px' }}>Shipping:</span>
            <span style={{ fontSize: '11px', fontWeight: 'bold', width: '80px', textAlign: 'right' }}>৳{order.delivery_charge || order.shipping}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', backgroundColor: '#f9f9f9', padding: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: '900', marginRight: '40px', textTransform: 'uppercase' }}>Total Amount:</span>
            <span style={{ fontSize: '14px', fontWeight: '900', width: '80px', textAlign: 'right' }}>৳{order.total_amount || order.total}</span>
          </div>
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', fontStyle: 'italic', color: '#666' }}>Thank you for choosing artisanal excellence.</p>
          <div style={{ fontSize: '9px', marginTop: '10px', color: '#aaa' }}>
            This is a computer generated invoice. No signature required.
          </div>
        </div>
      </div>

      <style>
        {`
          @media print {
            @page {
              size: 5.5in 8.5in;
              margin: 0;
            }
            body * {
              visibility: hidden;
            }
            .print-invoice, .print-invoice * {
              visibility: visible !important;
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
