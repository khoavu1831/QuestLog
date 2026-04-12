export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{ marginTop: '2rem', fontFamily: 'Arial, sans-serif' }}>
      {/* Back to top bar */}
      <div 
        onClick={scrollToTop}
        style={{
          background: '#37475a',
          color: 'white',
          textAlign: 'center',
          padding: '15px 0',
          cursor: 'pointer',
          fontSize: '13px'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#485769'}
        onMouseLeave={e => e.currentTarget.style.background = '#37475a'}
      >
        Back to top
      </div>

      {/* Main Footer Links */}
      <div style={{ background: 'var(--amz-nav)', color: 'white', padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: '80px', maxWidth: '800px', width: '100%', justifyContent: 'space-around' }}>
          <FooterColumn 
            title="Get to Know Us" 
            links={['About QuestLog', 'The Archive', 'Our Team', 'Contact Us']} 
          />
          <FooterColumn 
            title="Community" 
            links={['Community Guidelines', 'Top Reviewers', 'Forums', 'Game Submission']} 
          />
          <FooterColumn 
            title="Let Us Help You" 
            links={['Your Account', 'Your Reviews', 'Help & Support']} 
          />
        </div>
      </div>

      {/* Bottom Legal/Copyright */}
      <div style={{ background: 'var(--amz-dark)', color: '#ddd', textAlign: 'center', padding: '30px 0', fontSize: '12px', borderTop: '1px solid #3a4553' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '10px' }}>
          <a href="#" style={{ color: '#ddd', textDecoration: 'none' }}>Conditions of Use</a>
          <a href="#" style={{ color: '#ddd', textDecoration: 'none' }}>Privacy Notice</a>
        </div>
        <div>© 2024, QuestLog.archive or its affiliates</div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{title}</h3>
      {links.map(link => (
        <a 
          key={link} 
          href="#" 
          style={{ color: '#ddd', fontSize: '14px', textDecoration: 'none' }}
          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
        >
          {link}
        </a>
      ))}
    </div>
  )
}
