import React from 'react';

class HelloComponent extends React.Component {
	render() {
		return <div>Hello You</div>;
	}
}

var app = document.getElementById('app');
React.render(<HelloComponent />, app);