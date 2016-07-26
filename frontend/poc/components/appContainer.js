import React from 'react';
import { connect, Provider } from 'react-redux';
import { EditorPOC } from './editor';
import { init, changeState } from '../actions/appActions';

export class App extends React.Component {
    componentWillMount(){
      if (!this.props.serverInit) {
        this.props.init();
      }
    }

    render(){
      const { props } = this;
      return (
        props.clientRender ?
          <EditorPOC {...props }/> : false
      );
    }
}

const mapStateToProps = (state)=>{
    return { }
};
export const AppContainer = connect(mapStateToProps, { init, changeState })(App);
