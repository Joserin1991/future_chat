import Chat from './components/Chat';

export default function Home() {
  return (
    <main style={{ 
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: '#f5f5f5'
    }}>
      <Chat />
    </main>
  );
}
