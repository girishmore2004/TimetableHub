import React from 'react';
import Timetable from './components/Timetable'; 

const App = () => {
  return (
    <div className="App">
      <Timetable />
      <footer style={{
      marginTop: '30px',
      padding: '10px',
      backgroundColor: '#f8f9fa',
      textAlign: 'center',
      borderTop: '1px solid #ddd'
    }}>
      <p>&copy; {new Date().getFullYear()} Designed and Developed by Girish More.</p>
      <a href="nethttps://girishmore2004-portfolio.netlify.app" target="_blank" rel="noopener noreferrer">
  Check Out More
</a>
    </footer>
    </div>
  );
};

export default App;
