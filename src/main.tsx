import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import AuthBoundary from './components/AuthBoundary';

createRoot(document.getElementById('root')!).render(<AuthBoundary><App /></AuthBoundary>);
