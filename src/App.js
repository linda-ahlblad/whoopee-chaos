import React from 'react';
import './styles/global.css';

function App() {
  return (
    <div className="App" style={{ padding: '20px', textAlign: 'center', color: '#f5f5f5', background: '#121212', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px', background: 'linear-gradient(45deg, #8e2de2, #ffcb47)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Whoopee Chaos
      </h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '30px' }}>
        The divine flatulence game of mythical proportions!
      </p>
      <p>Coming soon...</p>
      <div style={{ marginTop: '40px', maxWidth: '500px' }}>
        <img 
          src="logo512.png" 
          alt="Whoopee Cushion" 
          style={{ width: '200px', height: 'auto', margin: '0 auto', display: 'block' }} 
        />
      </div>
    </div>
  );
}

export default App;
