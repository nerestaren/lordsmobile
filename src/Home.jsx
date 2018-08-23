import React, { Component } from 'react';
import {Col, Grid, Jumbotron, Row} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default class Home extends Component {
    render() {
        return (
            <div>
                <Navbar location={this.props.location.pathname}/>
                <Grid>
                    <Jumbotron>
                        <h1>Lords mobile</h1>
                        <p>Some tools for peasants.</p>
                    </Jumbotron>
                    <Row>
                        <Col md={4}>
                            <h2>Gathering calculator</h2>
                            <p>Time to complete a node, amount of resources gathered in an amount of time.</p>
                            <p><Link className="btn btn-default" to="/gathering" role="button">View details »</Link></p>
                        </Col>
                        <Col md={4}>
                            <h2>Advanced buildings</h2>
                            <p>Gems needed to upgrade your Prison, Battle Hall, Altar and Treasure Trove.</p>
                            <p><Link className="btn btn-default" to="/buildings" role="button">View details »</Link></p></Col>
                        <Col md={4}></Col>
                    </Row>
                    <Footer />
                </Grid>
            </div>
        );
    }
};