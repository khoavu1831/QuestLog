export default function AISummary({ aiSummary }) {
  if (!aiSummary) return null;

  return (
    <div style={{ border: '1px solid #d5d9d9', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>Customers say</h4>
        <span style={{ fontSize: '12px', background: '#F0F2F2', padding: '2px 8px', borderRadius: '12px', color: '#565959' }}>AI-generated from the text of customer reviews</span>
      </div>
      
      <p style={{ fontSize: '14px', lineHeight: '20px', color: '#0f1111', marginBottom: '10px' }}>
        Customers like the {aiSummary.pros.map((pro, idx) => {
          return (idx === aiSummary.pros.length - 1 && idx !== 0) ? ` and ${pro.toLowerCase()}` : (idx === 0 ? pro.toLowerCase() : `, ${pro.toLowerCase()}`);
        })}. However, some customers have different views on {aiSummary.cons[0]?.toLowerCase()} and {aiSummary.cons[1]?.toLowerCase()}.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {aiSummary.pros.map((pro, i) => (
          <span key={`p${i}`} style={{ background: '#EDFDF2', border: '1px solid #007600', color: '#007600', padding: '4px 10px', borderRadius: '16px', fontSize: '13px', fontWeight: 'bold' }}>
            ✓ {pro}
          </span>
        ))}
        {aiSummary.cons.map((con, i) => (
          <span key={`c${i}`} style={{ background: '#FEF2F2', border: '1px solid #B12704', color: '#B12704', padding: '4px 10px', borderRadius: '16px', fontSize: '13px', fontWeight: 'bold' }}>
            {con}
          </span>
        ))}
      </div>
    </div>
  )
}
