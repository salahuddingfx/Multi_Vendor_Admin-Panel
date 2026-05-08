import React from 'react';

const InvoiceTemplate = React.forwardRef(({ order, type = 'standard' }, ref) => {
  if (!order) return <div ref={ref} style={{ display: 'none' }} />;

  const isStandard = type === 'standard';
  
  // Sizing configuration for Thermal Rolls
  const config = {
    standard: { width: '8.5in', minHeight: '11in', padding: '0.5in', fontSize: '12px', font: "'Inter', system-ui, sans-serif" },
    '1.5': { width: '1.5in', minHeight: '1in', padding: '0.05in', fontSize: '8px', font: "system-ui, sans-serif" },
    '1.75': { width: '1.75in', minHeight: '1in', padding: '0.05in', fontSize: '9px', font: "system-ui, sans-serif" },
    '2.0': { width: '2.0in', minHeight: '1in', padding: '0.1in', fontSize: '10px', font: "system-ui, sans-serif" }
  }[type] || { width: '8.5in', minHeight: '11in', padding: '0.5in', fontSize: '12px', font: "'Inter', system-ui, sans-serif" };

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
    lineHeight: '1.4'
  };

  const brandColor = order.site_id === 1 ? '#800000' : '#064e3b'; // Maroon for Acharu, Emerald for Taja

  // Render Thermal Receipt Style (1.5, 1.75, 2.0)
  if (!isStandard) {
    return (
      <div style={{ display: 'none' }}>
        <div ref={ref} className="print-receipt" style={baseStyle}>
          <div style={{ textAlign: 'center', borderBottom: '1.5px solid #000', paddingBottom: '6px', marginBottom: '8px' }}>
            <h1 style={{ margin: 0, fontSize: '16px', fontWeight: '900', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                {order.site_id === 1 ? 'ACHARU' : 'TAJA SHUTKI'}
            </h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', fontSize: '8px', fontWeight: 'bold', marginTop: '2px' }}>
                <span style={{ border: '1px solid #000', padding: '0 4px', borderRadius: '2px' }}>OFFICIAL INVOICE</span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '9px', fontWeight: 'bold' }}>#{order.tracking_id?.slice(-8)}</p>
          </div>

          <div style={{ fontSize: '9px', marginBottom: '10px', borderBottom: '0.5px dashed #ccc', paddingBottom: '8px' }}>
            <div style={{ textTransform: 'uppercase', fontSize: '7px', fontWeight: 'black', marginBottom: '2px', color: '#666' }}>Deliver To:</div>
            <p style={{ margin: '0', fontWeight: '900', fontSize: '10px' }}>{order.customer_name}</p>
            <p style={{ margin: '1px 0', fontWeight: '700' }}>{order.customer_phone}</p>
            <p style={{ margin: '1px 0', fontSize: '8px', lineHeight: '1.2' }}>{order.customer_address}, {order.location}</p>
            <div style={{ marginTop: '4px', display: 'inline-block', padding: '1px 5px', backgroundColor: '#000', color: '#fff', borderRadius: '2px', fontSize: '8px', fontWeight: 'bold' }}>
                {order.location === 'Cox' ? 'LOCAL HUB' : 'OUTSIDE'}
            </div>
          </div>

          <div style={{ borderBottom: '1px dashed #000', paddingBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '4px' }}>
              <span>Description</span>
              <span>Amt</span>
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ marginBottom: '5px' }}>
                <div style={{ fontSize: '9px', fontWeight: '700', lineHeight: '1.1' }}>
                  {item.quantity}x {item.name} {item.variation_info && `(${item.variation_info})`}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#444' }}>
                  <span>@ ৳{item.price}</span>
                  <span style={{ fontWeight: 'bold', color: '#000' }}>৳{item.price * item.quantity}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '8px', fontSize: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ color: '#666' }}>Subtotal:</span>
              <span style={{ fontWeight: 'bold' }}>৳{order.subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ color: '#666' }}>Delivery:</span>
              <span style={{ fontWeight: 'bold' }}>৳{order.delivery_charge}</span>
            </div>
            {order.discount_amount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', color: '#d97706' }}>
                <span>Discount:</span>
                <span>-৳{order.discount_amount}</span>
              </div>
            )}
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                borderTop: '1.5px solid #000', 
                marginTop: '6px', 
                paddingTop: '6px' 
            }}>
              <div style={{ fontSize: '7px', fontWeight: '900', textTransform: 'uppercase', color: '#444' }}>Total Payable Amount:</div>
              <div style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.03em' }}>৳{order.total_amount}</div>
            </div>
            
            <div style={{ 
                marginTop: '10px', 
                padding: '5px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '4px', 
                fontSize: '8px', 
                textAlign: 'center',
                fontWeight: 'bold',
                border: '0.5px solid #e2e8f0'
            }}>
                {order.payment_method?.toUpperCase()} | WEIGHT: {order.total_weight}KG
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

          <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '7px', borderTop: '0.5px solid #eee', paddingTop: '6px' }}>
             <p style={{ fontWeight: 'bold', marginBottom: '2px' }}>Thank you for shopping!</p>
             <p style={{ color: '#666' }}>Visit again: {order.site_id === 1 ? 'acharu.com' : 'tajashutki.com'}</p>
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
            <div style={{ spaceY: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b', fontWeight: 'bold' }}>Order Status:</span>
                    <span style={{ fontWeight: '900', textTransform: 'uppercase', color: '#0f172a' }}>{order.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b', fontWeight: 'bold' }}>Payment Method:</span>
                    <span style={{ fontWeight: '900', textTransform: 'uppercase', color: '#0f172a' }}>{order.payment_method}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b', fontWeight: 'bold' }}>Payment Status:</span>
                    <span style={{ fontWeight: '900', textTransform: 'uppercase', color: order.payment_status === 'paid' ? '#15803d' : '#b45309' }}>{order.payment_status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0' }}>
                    <span style={{ color: '#64748b', fontWeight: 'bold' }}>Total Weight:</span>
                    <span style={{ fontWeight: '900', textTransform: 'uppercase', color: '#0f172a' }}>{order.total_weight} KG</span>
                </div>
            </div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px', marginBottom: '40px' }}>
          <thead>
            <tr style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.1em' }}>
              <th style={{ textAlign: 'left', padding: '0 0 10px 20px' }}>Item Details</th>
              <th style={{ textAlign: 'center', padding: '0 0 10px' }}>Quantity</th>
              <th style={{ textAlign: 'right', padding: '0 20px 10px 0' }}>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx} style={{ backgroundColor: '#fff' }}>
                <td style={{ padding: '20px', borderRadius: '15px 0 0 15px', border: '1px solid #f1f5f9', borderRight: 'none' }}>
                   <div style={{ fontWeight: '900', fontSize: '15px', color: '#1e293b' }}>
                     {item.name} {item.variation_info && <span style={{fontSize: '13px', color: '#64748b', fontWeight: 'bold'}}>({item.variation_info})</span>}
                   </div>
                   <div style={{ fontSize: '12px', color: brandColor, fontWeight: 'bold', marginTop: '4px' }}>Unit Price: ৳{item.price}</div>
                </td>
                <td style={{ textAlign: 'center', padding: '20px', border: '1px solid #f1f5f9', borderLeft: 'none', borderRight: 'none' }}>
                    <span style={{ padding: '5px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', fontWeight: '900', color: '#1e293b' }}>{item.quantity}</span>
                </td>
                <td style={{ textAlign: 'right', padding: '20px', borderRadius: '0 15px 15px 0', border: '1px solid #f1f5f9', borderLeft: 'none', fontWeight: '900', fontSize: '16px', color: '#0f172a' }}>
                    ৳{item.price * item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            <div style={{ padding: '20px', backgroundColor: '#fdf2f2', borderRadius: '20px', border: `1px dashed ${brandColor}40` }}>
                <h5 style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: '900', color: brandColor, textTransform: 'uppercase' }}>Note to Customer:</h5>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5', fontWeight: '500' }}>
                    Please check your items upon delivery. For any concerns regarding quality or packaging, contact our support team with your Invoice ID.
                </p>
            </div>
            <div style={{ padding: '20px 30px', backgroundColor: '#0f172a', borderRadius: '25px', color: '#fff', shadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', opacity: 0.6 }}>
                    <span>Subtotal</span>
                    <span>৳{order.subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', opacity: 0.6 }}>
                    <span>Delivery Charge</span>
                    <span>৳{order.delivery_charge}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: '#fb923c' }}>
                      <span>Discount</span>
                      <span>-৳{order.discount_amount}</span>
                  </div>
                )}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', marginTop: '15px' }}>
                    <p style={{ margin: '0 0 5px', fontSize: '11px', textTransform: 'uppercase', opacity: 0.5, fontWeight: '900', letterSpacing: '0.1em' }}>Total Payable Amount</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.05em' }}>৳{order.total_amount}</span>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', opacity: 0.4 }}>Inc. VAT</span>
                    </div>
                </div>
            </div>
        </div>

        <div style={{ marginTop: '80px', textAlign: 'center', borderTop: '2px solid #f1f5f9', paddingTop: '30px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', fontWeight: 'bold' }}>Thank you for your patronage!</p>
            <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Authentic Flavors • Artisanal Craft • Pure Heritage</p>
            <div style={{ marginTop: '20px', fontSize: '9px', color: '#cbd5e1', fontWeight: 'bold' }}>COMPUTER GENERATED INVOICE • NO SIGNATURE REQUIRED</div>
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
