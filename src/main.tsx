import {createRoot} from 'react-dom/client';
import './index.css';
import AuthBoundary from './components/AuthBoundary';

createRoot(document.getElementById('root')!).render(<AuthBoundary />);
