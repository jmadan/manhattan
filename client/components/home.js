import React from 'react';
import { Link } from 'react-router';

let Home = React.createClass({
	render: function(){
		return (<div className="jumbotron"><h1>Hello, world!</h1><p>Lets begin...</p>
			<p><Link to="/interest">Show me Interests</Link></p>
			<p><Link to="/stufftoread">Show me stuff</Link></p>
			</div>);
	}
});

export default Home;