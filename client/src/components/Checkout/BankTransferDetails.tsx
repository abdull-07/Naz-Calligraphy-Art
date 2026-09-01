
export function BankTransferDetails() {
  return (
    <div
      style={{
        marginTop: '16px',
        padding: '16px',
        background: '#F8F4EF',
        borderRadius: '10px',
        border: '1px solid #F0EAE0',
        fontSize: '13px',
      }}
    >
      <p style={{ fontWeight: '700', color: '#1A1A1A', marginBottom: '8px' }}>
        Bank Account Details:
      </p>
      <p style={{ color: '#374151', marginBottom: '4px' }}>
        Bank: <strong>Meezan Bank</strong>
      </p>
      <p style={{ color: '#374151', marginBottom: '4px' }}>
        Account Title: <strong>Naz Calligraphy Art</strong>
      </p>
      <p style={{ color: '#374151', marginBottom: '4px' }}>
        IBAN: <strong>PK00MEZN0000000000000</strong>
      </p>
      <p
        style={{
          color: '#9CA3AF',
          marginTop: '8px',
          fontSize: '12px',
        }}
      >
        After transfer, send screenshot to WhatsApp: +92 300 123 4567
      </p>
    </div>
  )
}