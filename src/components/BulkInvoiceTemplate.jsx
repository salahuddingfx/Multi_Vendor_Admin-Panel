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
                minHeight: isStandard ? '11in' : 'auto',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
            }}>
              {/* Standard Layout */}
              {isStandard ? (
                <div className="print-standard" style={{ position: 'relative', height: '100%', fontSize: '11px', padding: '0.75in', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
                  {order.payment_status === 'paid' && (
                    <div style={{
                      position: 'absolute',
                      top: '30%',
                      left: '50%',
                      border: '8px double #10b981',
                      color: '#10b981',
                      fontSize: '80px',
                      fontWeight: '900',
                      padding: '10px 40px',
                      transform: 'translate(-50%, -50%) rotate(-15deg)',
                      opacity: '0.15',
                      textTransform: 'uppercase',
                      letterSpacing: '10px',
                      zIndex: 0,
                      pointerEvents: 'none'
                    }}>
                      PAID
                    </div>
                  )}

                  <div style={{ display: 'flex', marginBottom: '25px' }}>
                    <div>
                      <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#1e293b', margin: 0, letterSpacing: '-0.5px' }}>
                        {order.site_id === 1 ? 'ACHARU' : 'TAJA SHUTKI'}
                      </h1>
                      <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '1px', marginTop: '2px', fontWeight: '700' }}>
                        {order.site_id === 1 ? 'Premium Artisanal Collection' : 'Freshness Delivered Daily'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', width: '100%', marginBottom: '30px', alignItems: 'center' }}>
                    <div style={{ background: brandColor, height: '35px', width: '55%' }}></div>
                    <div style={{ padding: '0 20px', whiteSpace: 'nowrap' }}>
                      <h2 style={{ fontSize: '38px', fontWeight: 600, color: '#334155', letterSpacing: '1px', margin: 0, lineHeight: 1 }}>INVOICE</h2>
                    </div>
                    <div style={{ background: brandColor, height: '35px', flexGrow: 1 }}></div>
                  </div>

                  <div style={{ display: 'flex', width: '100%', marginBottom: '40px', justifyContent: 'space-between' }}>
                    <div style={{ width: '50%' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '5px' }}>Invoice to:</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '2px' }}>{order.customer_name}</div>
                      <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, lineHeight: 1.5 }}>
                        {order.customer_phone}<br />
                        {order.customer_address}<br />
                        {order.location}
                      </div>

                      {order.customer_notes && (
                        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fef3c7', borderLeft: '3px solid #f59e0b', color: '#b45309', fontSize: '11px', fontWeight: 600 }}>
                          <span style={{ fontWeight: 800, display: 'block', marginBottom: '2px' }}>Customer Note:</span>
                          {order.customer_notes}
                        </div>
                      )}
                    </div>
                    <div style={{ width: '50%', textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <table style={{ borderCollapse: 'collapse', marginBottom: '20px' }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: '4px 20px 4px 0', fontWeight: 700, color: '#1e293b', fontSize: '13px', textAlign: 'left' }}>Invoice#</td>
                            <td style={{ padding: '4px 0', fontWeight: 600, color: '#475569', textAlign: 'right', fontSize: '12px' }}>{order.tracking_id?.toUpperCase()}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '4px 20px 4px 0', fontWeight: 700, color: '#1e293b', fontSize: '13px', textAlign: 'left' }}>Date</td>
                            <td style={{ padding: '4px 0', fontWeight: 600, color: '#475569', textAlign: 'right', fontSize: '12px' }}>
                              {new Date(order.created_at).toLocaleDateString('en-GB')}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>Invoice From:</div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', marginBottom: '2px' }}>{order.site?.name || (order.site_id === 1 ? 'ACHARU' : 'TAJA SHUTKI')}</div>
                        <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, lineHeight: 1.5 }}>
                          {(() => {
                            let settings = {};
                            try { settings = typeof order.site?.settings === 'string' ? JSON.parse(order.site.settings) : (order.site?.settings || {}); } catch(e) {}
                            return (
                              <>
                                {settings.address || (order.site_id === 1 ? 'Dhaka, Bangladesh' : 'Cox\'s Bazar, Bangladesh')}<br />
                                {settings.support_phone || (order.site_id === 1 ? '01700000000' : '01800000000')}<br />
                                {settings.store_email || `support@${order.site_id === 1 ? 'acharu' : 'tajashutki'}.com`}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                    <thead>
                      <tr>
                        <th style={{ backgroundColor: '#334155', color: '#fff', padding: '12px 15px', textAlign: 'center', fontSize: '11px', fontWeight: 600, width: '50px' }}>SL.</th>
                        <th style={{ backgroundColor: '#334155', color: '#fff', padding: '12px 15px', textAlign: 'left', fontSize: '11px', fontWeight: 600 }}>Item Description</th>
                        <th style={{ backgroundColor: '#334155', color: '#fff', padding: '12px 15px', textAlign: 'center', fontSize: '11px', fontWeight: 600 }}>Price</th>
                        <th style={{ backgroundColor: '#334155', color: '#fff', padding: '12px 15px', textAlign: 'center', fontSize: '11px', fontWeight: 600 }}>Qty.</th>
                        <th style={{ backgroundColor: '#334155', color: '#fff', padding: '12px 15px', textAlign: 'right', fontSize: '11px', fontWeight: 600 }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => (
                        <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                          <td style={{ padding: '15px', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', color: '#1e293b', fontWeight: 600, fontSize: '11px', textAlign: 'center' }}>{idx + 1}</td>
                          <td style={{ padding: '15px', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', color: '#1e293b', fontWeight: 600, fontSize: '11px' }}>
                            {item.name} {item.variation_info && `(${item.variation_info})`}
                          </td>
                          <td style={{ padding: '15px', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', color: '#1e293b', fontWeight: 600, fontSize: '11px', textAlign: 'center' }}>৳{Number(item.price).toFixed(2)}</td>
                          <td style={{ padding: '15px', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', color: '#1e293b', fontWeight: 600, fontSize: '11px', textAlign: 'center' }}>{item.quantity}</td>
                          <td style={{ padding: '15px', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', color: '#1e293b', fontWeight: 600, fontSize: '11px', textAlign: 'right' }}>৳{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ display: 'flex', width: '100%', marginBottom: '60px' }}>
                    <div style={{ width: '55%', paddingRight: '20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '15px' }}>Thank you for shopping with us</div>
                      
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '5px', marginTop: '15px' }}>Terms & Conditions</div>
                      <div style={{ fontSize: '9px', color: '#475569', lineHeight: 1.5, fontWeight: 500, width: '80%' }}>
                        Please check your items upon delivery. For any concerns regarding quality or packaging, contact our support team with your Invoice ID.
                      </div>

                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '5px', marginTop: '15px' }}>Order Info:</div>
                      <table style={{ borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: '2px 0', fontSize: '9px', fontWeight: 600, color: '#1e293b', paddingRight: '15px' }}>Status:</td>
                            <td style={{ padding: '2px 0', fontSize: '9px', fontWeight: 500, color: '#475569', textTransform: 'capitalize' }}>{order.status}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '2px 0', fontSize: '9px', fontWeight: 600, color: '#1e293b', paddingRight: '15px' }}>Payment Mode:</td>
                            <td style={{ padding: '2px 0', fontSize: '9px', fontWeight: 500, color: '#475569', textTransform: 'capitalize' }}>{order.payment_method}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '2px 0', fontSize: '9px', fontWeight: 600, color: '#1e293b', paddingRight: '15px' }}>Payment Status:</td>
                            <td style={{ padding: '2px 0', fontSize: '9px', fontWeight: 500, color: '#475569', textTransform: 'capitalize' }}>{order.payment_status}</td>
                          </tr>
                          {order.customer_notes && (
                            <tr>
                              <td style={{ padding: '2px 0', fontSize: '9px', fontWeight: 600, color: '#1e293b', paddingRight: '15px' }}>Note:</td>
                              <td style={{ padding: '2px 0', fontSize: '9px', fontWeight: 500, color: '#475569' }}>Included in Customer Details</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ width: '45%' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: '8px 15px', fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>Sub Total:</td>
                            <td style={{ padding: '8px 15px', fontSize: '11px', fontWeight: 600, color: '#1e293b', textAlign: 'right' }}>৳{Number(order.subtotal).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '8px 15px', fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>Delivery Charge:</td>
                            <td style={{ padding: '8px 15px', fontSize: '11px', fontWeight: 600, color: '#1e293b', textAlign: 'right' }}>৳{Number(order.delivery_charge).toFixed(2)}</td>
                          </tr>
                          {order.discount_amount > 0 && (
                            <tr>
                              <td style={{ padding: '8px 15px', fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>Discount:</td>
                              <td style={{ padding: '8px 15px', fontSize: '11px', fontWeight: 600, color: '#1e293b', textAlign: 'right' }}>-৳{Number(order.discount_amount).toFixed(2)}</td>
                            </tr>
                          )}
                          <tr>
                            <td style={{ padding: '12px 15px', fontSize: '14px', fontWeight: 700, color: '#fff', backgroundColor: brandColor }}>Total:</td>
                            <td style={{ padding: '12px 15px', fontSize: '14px', fontWeight: 700, color: '#fff', backgroundColor: brandColor, textAlign: 'right' }}>৳{Number(order.total_amount).toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="print-footer" style={{ marginTop: 'auto', width: '100%', borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ width: '60%' }}>
                      <div style={{ background: brandColor, height: '4px', width: '100%', marginBottom: '10px' }}></div>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#1e293b' }}>
                        {(() => {
                          let settings = {};
                          try { settings = typeof order.site?.settings === 'string' ? JSON.parse(order.site.settings) : (order.site?.settings || {}); } catch(e) {}
                          return (
                            <>
                              {settings.support_phone || (order.site_id === 1 ? '01700000000' : '01800000000')} &nbsp;|&nbsp; 
                              {settings.address || (order.site_id === 1 ? 'Dhaka, Bangladesh' : 'Cox\'s Bazar, Bangladesh')} &nbsp;|&nbsp; 
                              {settings.website || (order.site_id === 1 ? 'www.acharu.com' : 'www.tajashutki.com')}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div style={{ width: '40%', textAlign: 'right' }}>
                      <div style={{ borderTop: '1px solid #1e293b', width: '150px', display: 'inline-block', marginBottom: '8px' }}></div><br />
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#1e293b' }}>Authorised Sign</span>
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
                  <div style={{ fontSize: '10px', fontWeight: '900', textAlign: 'right', marginTop: '4px' }}>
                    <span style={{ fontSize: '7px', textTransform: 'uppercase', opacity: 0.6 }}>{order.payment_status === 'paid' ? 'Paid:' : 'Payable:'}</span> ৳{order.total_amount}
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
          @page { size: ${isStandard ? 'A4' : config.width + ' auto'}; margin: ${isStandard ? '0.75in' : '0'}; }
          html, body { background: #fff !important; }
          body * { visibility: hidden; }
          .print-container { padding: 0 !important; background: #fff !important; }
          .print-standard, .print-standard * { visibility: visible; }
          .print-standard { background: #fff !important; position: static !important; width: 100% !important; min-height: 297mm !important; padding: 0.75in !important; box-sizing: border-box !important; margin-bottom: 0 !important; page-break-after: always; box-shadow: none !important; display: flex !important; flex-direction: column !important; }
          .bulk-print-container, .bulk-print-container * { visibility: visible; }
          .bulk-print-container { position: absolute !important; left: 0; top: 0; width: 100% !important; }
          .invoice-page { 
            position: relative !important;
            page-break-after: always;
            margin: 0 !important;
            box-shadow: none !important;
            width: ${isStandard ? '210mm' : config.width} !important;
            min-height: ${isStandard ? '297mm' : 'auto'} !important;
          }
          .print-footer { position: static !important; width: 100% !important; margin-top: auto !important; }
        }
      `}</style>
    </div>
  );
});

export default BulkInvoiceTemplate;
