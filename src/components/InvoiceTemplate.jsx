import React from 'react';

const InvoiceTemplate = React.forwardRef(({ order, type = 'standard' }, ref) => {
  if (!order) return <div ref={ref} style={{ display: 'none' }} />;

  const isStandard = type === 'standard';
  
  // Sizing configuration for Thermal Rolls
  const config = {
    standard: { width: '8.5in', minHeight: '11in', padding: '0.5in', fontSize: '12px', font: "'Inter', sans-serif" },
    '1.5': { width: '1.5in', minHeight: '1in', padding: '0.05in', fontSize: '8px', font: "'Courier New', Courier, monospace" },
    '1.75': { width: '1.75in', minHeight: '1in', padding: '0.05in', fontSize: '9px', font: "'Courier New', Courier, monospace" },
    '2.0': { width: '2.0in', minHeight: '1in', padding: '0.1in', fontSize: '10px', font: "'Courier New', Courier, monospace" }
  }[type] || { width: '8.5in', minHeight: '11in', padding: '0.5in', fontSize: '12px', font: "'Inter', sans-serif" };

  const baseStyle = {
    width: config.width,
    minHeight: config.minHeight,
    height: 'auto',
    padding: config.padding,
    backgroundColor: '#fff',
    color: '#000',
    fontFamily: config.font,
    boxSizing: 'border-box',
    position: 'relative',
    margin: '0',
    overflow: 'hidden',
    lineHeight: '1.2'
  };

  // Render Thermal Receipt Style (1.5, 1.75, 2.0)
  if (!isStandard) {
    return (
      <div style={{ display: 'none' }}>
        <div ref={ref} className="print-receipt" style={baseStyle}>
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '5px', marginBottom: '8px' }}>
            <h1 style={{ margin: 0, fontSize: isStandard ? '24px' : '14px', fontWeight: 'bold' }}>
                {order.site_id === 1 ? 'ACHARU' : 'TAJA SHUTKI'}
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '8px' }}>#{order.tracking_id?.slice(-6)}</p>
          </div>

          <div style={{ fontSize: '9px', marginBottom: '8px' }}>
            <p style={{ margin: '0', fontWeight: 'bold' }}>To: {order.customer_name}</p>
            <p style={{ margin: '1px 0' }}>{order.customer_phone}</p>
            <p style={{ margin: '0', fontSize: '8px', lineHeight: '1.1' }}>{order.customer_address}</p>
            <p style={{ margin: '2px 0 0', fontWeight: 'bold', fontSize: '10px' }}>[{order.location === 'Cox' ? 'HOME' : 'OUTSIDE'}]</p>
          </div>

          <div style={{ borderTop: '1px dashed #000', paddingTop: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px', fontWeight: 'bold', marginBottom: '3px' }}>
              <span>Item</span>
              <span>Total</span>
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ marginBottom: '3px' }}>
                <div style={{ fontSize: '8px', fontWeight: 'bold' }}>{item.quantity}x {item.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px' }}>
                  <span>@ ৳{item.price}</span>
                  <span>৳{item.price * item.quantity}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #000', marginTop: '5px', paddingTop: '3px', fontSize: '9px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>TOTAL:</span>
              <span>৳{order.total_amount}</span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '7px', textAlign: 'center' }}>Method: {order.payment_method?.toUpperCase()}</p>
          </div>

          <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '6px', borderTop: '0.5px solid #eee', paddingTop: '3px' }}>
             <p>Thank you for choosing {order.site_id === 1 ? 'Acharu' : 'Taja Shutki'}!</p>
          </div>
        </div>
        <style>{`
          @media print {
            @page { size: ${config.width} auto; margin: 0; }
            body * { visibility: hidden; }
            .print-receipt, .print-receipt * { visibility: visible; }
            .print-receipt { position: absolute !important; left: 0; top: 0; width: ${config.width} !important; }
          }
        `}</style>
      </div>
    );
  }

  // Render Standard A4 Invoice
  return (
    <div style={{ display: 'none' }}>
      <div ref={ref} className="print-standard" style={baseStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900 }}>{order.site_id === 1 ? 'ACHARU' : 'TAJA SHUTKI'}</h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Artisanal Quality Delivered</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900 }}>INVOICE</h2>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>#{order.tracking_id}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
          <div>
            <h4 style={{ fontSize: '10px', textTransform: 'uppercase', color: '#888', margin: '0 0 10px' }}>Bill To:</h4>
            <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{order.customer_name}</p>
            <p style={{ fontSize: '13px' }}>{order.customer_phone}</p>
            <p style={{ fontSize: '13px', lineHeight: '1.5' }}>{order.customer_address}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h4 style={{ fontSize: '10px', textTransform: 'uppercase', color: '#888', margin: '0 0 10px' }}>Order Details:</h4>
            <p style={{ fontSize: '12px', margin: '5px 0' }}>Date: {new Date(order.created_at).toLocaleDateString()}</p>
            <p style={{ fontSize: '12px', margin: '5px 0' }}>Status: {order.status}</p>
            <p style={{ fontSize: '12px', margin: '5px 0' }}>Payment: {order.payment_method?.toUpperCase()}</p>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #000' }}>
              <th style={{ textAlign: 'left', padding: '10px 0' }}>Item</th>
              <th style={{ textAlign: 'center', padding: '10px 0' }}>Qty</th>
              <th style={{ textAlign: 'right', padding: '10px 0' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px 0' }}>
                   <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                   <div style={{ fontSize: '11px', color: '#888' }}>{item.weight}kg</div>
                </td>
                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>৳{item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ width: '250px', marginLeft: 'auto', borderTop: '2px solid #000', paddingTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 900 }}>
                <span>TOTAL:</span>
                <span>৳{order.total_amount}</span>
            </div>
        </div>

        <div style={{ marginTop: '60px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Thank you for shopping with <strong>{order.site_id === 1 ? 'Acharu' : 'Taja Shutki'}</strong>!</p>
            <p style={{ margin: '5px 0 0', fontSize: '10px', color: '#999' }}>This is a computer generated invoice.</p>
        </div>
      </div>
      <style>{`
        @media print {
          @page { size: A4; margin: 0.5in; }
          body * { visibility: hidden; }
          .print-standard, .print-standard * { visibility: visible; }
          .print-standard { position: absolute !important; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
});

export default InvoiceTemplate;
