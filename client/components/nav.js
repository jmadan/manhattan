import React from 'react';
import { Link } from 'react-router';

const NavBar = React.createClass({
	render(){
		return (
			<nav className='navbar navbar-inverse navbar-fixed-top'>
			      <div className='container'>
			        <div className='navbar-header page-scroll'>
			          <button type='button' className='navbar-toggle collapsed' data-toggle='collapse' data-target='#navbar' aria-expanded='false' aria-controls='navbar'>
			            <span className='sr-only'>Toggle navigation</span>
			            <span className='icon-bar'></span>
			            <span className='icon-bar'></span>
			            <span className='icon-bar'></span>
			          </button>
			          <Link to='/' className='navbar-brand'>Manhattan</Link>
			        </div>
			        <div id='navbar' className='navbar-collapse collapse'>
			          <ul className='nav navbar-nav navbar-right'>
			           <li className="active"><Link to="/">Home</Link></li>
			           <li><Link to="/">Sign In</Link></li>
			           <li><Link to="/">About Me</Link></li>
			          </ul>
			          <form className="navbar-form navbar-right">
        				<div className="form-group">
          					<input type="text" className="form-control" placeholder="Search" />
        				</div>
        				<button type="submit" className="btn btn-default">Submit</button>
      				</form>
			        </div>
			      </div>
				</nav>
		);
	}
});

export default NavBar;