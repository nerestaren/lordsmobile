import React, { Component } from 'react';
import {Nav, Navbar, NavItem} from 'react-bootstrap';
import {Link} from 'react-router-dom';

export default class MyNavbar extends Component {
    render() {
        return (
            <Navbar inverse collapseOnSelect staticTop>
                <Navbar.Header>
                    <Navbar.Brand>
                        <Link to="/">Home</Link>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav>
                        <NavItem componentClass={Link} eventKey={1} to="/gathering" href="/gathering" active={this.props.location === '/gathering'}>Gathering</NavItem>
                        <NavItem componentClass={Link} eventKey={2} to="/buildings" href="/buildings" active={this.props.location === '/buildings'}>Buildings</NavItem>
                        <NavItem componentClass={Link} eventKey={3} to="/gyms" href="/gyms" active={this.props.location === '/gyms'}>Gyms</NavItem>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }
};