import * as React from 'react';
import Basic from './pages/basic/Basic';
import ValidationPage from './pages/validationPage/ValidationPage';
import Header from './components/header/Header';
import { hot } from 'react-hot-loader';

const App = () => (
    <div>
        <Header />
        {false && <Basic />}
        {true && <ValidationPage />}
    </div>
);

export default hot(module)(App);