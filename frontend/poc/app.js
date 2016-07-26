/**
 * Created by vladimirn on 11/27/15.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { AppContainer } from './components/appContainer';
import { createComposedStore } from './appStore';
import rootReducer from './reducers/rootReducer';
const initialState = window.pdo
const appStore = createComposedStore(rootReducer, initialState)

import 'draft-js-alignment-plugin/lib/plugin.css';
import 'draft-js-focus-plugin/lib/plugin.css';
import 'draft-js-image-plugin/lib/plugin.css';
import 'draft-js-table-plugin/lib/plugin.css';
import 'draft-js-toolbar-plugin/lib/plugin.css';


ReactDOM.render(<Provider store={appStore}>
                    <AppContainer shouldInit={ true } clientRender={ true }/>
                </Provider>, document.getElementById('app'));
