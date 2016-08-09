import React from 'react';

import NavBar from './nav';
import Footer from './footer';

const Main = React.createClass({
	
	render: function() {

		return (<div className="container">
			<NavBar />
			{this.props}
			<Footer />
			</div>);
	}
});

// module.exports = class MainComponent extends React.Component {
// 	render(){
// 		return (<NavBar />{React.cloneElement(this.props.childern, this.props)}<Footer />);
// 	}
// };

export default Main;