import React from 'react';

const BulkInvoiceTemplate = React.forwardRef(({ orders, type = 'standard' }, ref) => {
  if (!orders || orders.length === 0) return <div ref={ref} style={{ display: 'none' }} />;

  const isStandard = type === 'standard';
  
  const config = {
    standard: { width: '8.5in', padding: '0.5in', fontSize: '12px', font: "'Inter', system-ui, sans-serif" },
    '1.5': { width: '1.5in', padding: '0.05in', fontSize: '8px', font: "system-ui, sans-serif" },
    '1.75': { width: '1.75in', padding: '0.05in', fontSize: '9px', font: "system-ui, sans-serif" },
    '2.0': { width: '2.0in', padding: '0.1in', fontSize: '10px', font: "system-ui, sans-serif" }
  }[type] || { width: '8.5in', padding: '0.5in', fontSize: '12px', font: "'Inter', system-ui, sans-serif" };

  return (
    <div style={{ display: 'none' }}>
      <div ref={ref} className="bulk-print-container">
        {orders.map((order, index) => {
          const brandColor = order.site_id === 1 ? '#800000' : '#064e3b';
          
          return (
            <div key={order.id} className="invoice-page" style={{ 
                width: config.width, 
                backgroundColor: '#fff', 
                color: '#000', 
                fontFamily: config.font,
                padding: config.padding,
                boxSizing: 'border-box',
                pageBreakAfter: 'always',
                minHeight: isStandard ? '11in' : 'auto'
            }}>
              {/* Standard Layout */}
              {isStandard ? (
                <div className="print-standard" style={{ position: 'relative' }}>
                  {order.payment_status === 'paid' && (
                    <div style={{
                      position: 'absolute',
                      top: '250px',
                      right: '50px',
                      border: '8px double #15803d',
                      borderRadius: '15px',
                      color: '#15803d',
                      fontSize: '52px',
                      fontWeight: '900',
                      padding: '10px 40px',
                      transform: 'rotate(-15deg)',
                      opacity: '0.15',
                      textTransform: 'uppercase',
                      letterSpacing: '8px',
                      zIndex: 0,
                      pointerEvents: 'none'
                    }}>
                      PAID
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `8px solid ${brandColor}`, paddingBottom: '30px', marginBottom: '40px' }}>
                    <div>
                      <h1 style={{ margin: 0, fontSize: '42px', fontWeight: 900, letterSpacing: '-0.05em', color: brandColor }}>
                          {order.site_id === 1 ? 'ACHARU' : 'TAJA SHUTKI'}
                      </h1>
                      <p style={{ margin: '5px 0 0', fontSize: '14px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Premium Artisanal Collection</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#1e293b' }}>TAX INVOICE</h2>
                      <div style={{ marginTop: '10px', padding: '5px 15px', backgroundColor: '#f1f5f9', borderRadius: '8px', display: 'inline-block' }}>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: brandColor }}>#{order.tracking_id}</p>
                      </div>
                      <p style={{ margin: '8px 0 0', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>
                          {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '60px', marginBottom: '50px' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                      <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: brandColor, fontWeight: '900', letterSpacing: '0.1em', margin: '0 0 15px' }}>Recipient Information</h4>
                      <p style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginBottom: '5px' }}>{order.customer_name}</p>
                      <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#475569', marginBottom: '10px' }}>{order.customer_phone}</p>
                      <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', fontWeight: '500' }}>{order.customer_address}, {order.location}</p>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '900', letterSpacing: '0.1em', margin: '0 0 15px' }}>Order Summary</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                              <span style={{ color: '#64748b', fontWeight: 'bold' }}>Status:</span>
                              <span style={{ fontWeight: '900', textTransform: 'uppercase', color: '#0f172a' }}>{order.status}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                              <span style={{ color: '#64748b', fontWeight: 'bold' }}>Payment:</span>
                              <span style={{ fontWeight: '900', textTransform: 'uppercase', color: '#0f172a' }}>{order.payment_method}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                              <span style={{ color: '#64748b', fontWeight: 'bold' }}>Payment Status:</span>
                              <span style={{ fontWeight: '900', textTransform: 'uppercase', color: order.payment_status === 'paid' ? '#15803d' : '#b45309' }}>{order.payment_status}</span>
                          </div>
                      </div>
                    </div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px', marginBottom: '40px' }}>
                    <thead>
                      <tr style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.1em' }}>
                        <th style={{ textAlign: 'left', padding: '0 0 10px 20px' }}>Item Details</th>
                        <th style={{ textAlign: 'center', padding: '0 0 10px' }}>Qty</th>
                        <th style={{ textAlign: 'right', padding: '0 20px 10px 0' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => (
                        <tr key={idx} style={{ backgroundColor: '#fff' }}>
                          <td style={{ padding: '20px', borderRadius: '15px 0 0 15px', border: '1px solid #f1f5f9', borderRight: 'none' }}>
                             <div style={{ fontWeight: '900', fontSize: '15px', color: '#1e293b' }}>{item.name}</div>
                             <div style={{ fontSize: '12px', color: brandColor, fontWeight: 'bold' }}>৳{item.price}</div>
                          </td>
                          <td style={{ textAlign: 'center', padding: '20px', border: '1px solid #f1f5f9', borderLeft: 'none', borderRight: 'none' }}>
                              <span style={{ padding: '5px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', fontWeight: '900' }}>{item.quantity}</span>
                          </td>
                          <td style={{ textAlign: 'right', padding: '20px', borderRadius: '0 15px 15px 0', border: '1px solid #f1f5f9', borderLeft: 'none', fontWeight: '900', fontSize: '16px' }}>
                              ৳{item.price * item.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                    <div style={{ padding: '20px', backgroundColor: '#fdf2f2', borderRadius: '20px', border: `1px dashed ${brandColor}40` }}>
                        <h5 style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: '900', color: brandColor, textTransform: 'uppercase' }}>Note:</h5>
                        <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: '1.5' }}>Please check items upon delivery.</p>
                    </div>
                    <div style={{ padding: '20px 30px', backgroundColor: '#0f172a', borderRadius: '25px', color: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', opacity: 0.6 }}>
                            <span>Subtotal</span>
                            <span>৳{order.subtotal}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', opacity: 0.6 }}>
                            <span>Delivery</span>
                            <span>৳{order.delivery_charge}</span>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', marginTop: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span style={{ fontSize: '32px', fontWeight: '900' }}>৳{order.total_amount}</span>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Thermal Layout */
                <div className="print-receipt">
                  <div style={{ textAlign: 'center', borderBottom: '1.5px solid #000', paddingBottom: '6px', marginBottom: '8px' }}>
                    <h1 style={{ margin: 0, fontSize: '16px', fontWeight: '900' }}>{order.site_id === 1 ? 'ACHARU' : 'TAJA SHUTKI'}</h1>
                    <p style={{ margin: '2px 0 0', fontSize: '9px', fontWeight: 'bold' }}>#{order.tracking_id?.slice(-8)}</p>
                  </div>
                  <div style={{ fontSize: '10px', marginBottom: '10px' }}>
                    <p style={{ margin: '0', fontWeight: '900' }}>{order.customer_name}</p>
                    <p style={{ margin: '1px 0' }}>{order.customer_phone}</p>
                    <p style={{ margin: '1px 0', fontSize: '8px' }}>{order.customer_address}</p>
                  </div>
                  <div style={{ borderBottom: '1px dashed #000', paddingBottom: '6px', marginBottom: '6px' }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '3px' }}>
                        <span>{item.quantity}x {item.name}</span>
                        <span>৳{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '900', textAlign: 'right' }}>
                    TOTAL: ৳{order.total_amount}
                  </div>
                  {order.payment_status === 'paid' && (
                    <div style={{ 
                        marginTop: '4px', 
                        padding: '4px', 
                        backgroundColor: '#15803d', 
                        color: '#fff', 
                        borderRadius: '4px', 
                        fontSize: '10px', 
                        textAlign: 'center',
                        fontWeight: '900',
                        letterSpacing: '2px'
                    }}>
                        PAID
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <style>{`
        @media print {
          @page { size: ${isStandard ? 'A4' : config.width + ' auto'}; margin: ${isStandard ? '0.5in' : '0'}; }
          body * { visibility: hidden; }
          .bulk-print-container, .bulk-print-container * { visibility: visible; }
          .bulk-print-container { position: absolute !important; left: 0; top: 0; width: 100% !important; }
          .invoice-page { page-break-after: always !important; break-after: page !important; }
        }
      `}</style>
    </div>
  );
});

export default BulkInvoiceTemplate;
