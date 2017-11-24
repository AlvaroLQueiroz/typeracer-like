import React from 'react';
import ReactDOM from 'react-dom';

import './styles/index.css';
import '../node_modules/materialize-css/dist//css/materialize.min.css';
import '../node_modules/jquery/dist/jquery.min.js';
import '../node_modules/materialize-css/dist/js/materialize.min.js';

import App from './pages/App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
