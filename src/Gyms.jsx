//TODO en canviar estat, el label no surt on toca

import React, {Component} from 'react';
import {
    Col,
    ControlLabel,
    Form,
    FormControl,
    FormGroup,
    Glyphicon,
    Grid,
    InputGroup, ListGroup, ListGroupItem, OverlayTrigger, Panel, Popover, Row
} from 'react-bootstrap';
import update from 'immutability-helper';

import Navbar from './Navbar';
import Footer from './Footer';

import $ from 'jquery';

import PriorityQueue from 'js-priority-queue';

window.jQuery = window.$ = $;
require('bootstrap');
require('bootstrap-timepicker');

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.data = {
            time: { // in minutes
                empty: 120,
                grey: 20,
                green: 30,
                blue: 40,
                purple: 50,
                gold: 60
            },
            // empty: 10; 1st: 10; 2nd: 7; 3rd: 6; 4th-5th: 5; 6th-9th: 4; 10th-20th: 3; 21st+: 2
            exp: [10, 10, 7, 6, 5, 5, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2],
            colors: ['gold', 'purple', 'blue', 'green', 'grey'],
            iterations: 1000
        };
        let defaults = JSON.parse(localStorage.getItem('gyms'));
        if (defaults === null) {
            defaults = {
                expBoost: 0,
                timeBoost: 0,
                heroes: {
                    grey: 0,
                    green: 0,
                    blue: 0,
                    purple: 0,
                    gold: 0
                },
                monsters: [{
                    grey: 0,
                    green: 0,
                    blue: 0,
                    purple: 0,
                    gold: 0
                }]
            };
        }
        this.state = {...defaults};
        this.handleChange = this.handleChange.bind(this);
        this.optimalGym = this.optimalGym.bind(this);
    }

    convertMinutesToText(minutes) {
        let seconds = minutes * 60;
        seconds = Math.round(seconds);
        let h = Math.floor(seconds / 3600);
        seconds -= h * 3600;
        let m = Math.floor(seconds / 60);
        seconds -= m * 60;
        let s = seconds;

        if (h < 10) h = '0' + h;
        if (m < 10) m = '0' + m;
        if (s < 10) s = '0' + s;

        return h + ':' + m + ':' + s;
    }

    convertTextToMinutes(text) {
        let matches = /(\d{1,2}):(\d{2}):(\d{2})/.exec(text);
        if (matches) {
            return (matches[1] * 3600 + matches[2] * 60 + matches[3] * 1) / 60;
        } else {
            return 0;
        }
    }

    componentDidMount() {
        $('#timeBoost').timepicker({
            maxHours: 99,
            minuteStep: 1,
            secondStep: 1,
            showSeconds: true,
            showMeridian: false
        });
    }

    componentWillUpdate(nextProps, nextState) {
        localStorage.setItem('gyms', JSON.stringify(nextState));
    }

    handleChange(event) {
        let split = event.target.id.split('-');
        let value = event.target.type === 'number' ? +event.target.value : event.target.value;
        if (split.length === 1) {
            this.setState({
                [event.target.id]: value
            });
        } else if (split.length === 2) {
            this.setState(update(this.state, {
                [split[0]]: {
                    [split[1]]: {
                        $set: value
                    }
                }
            }));
        }
    }

    optimalGym(nGyms, allHeroes) {

        let clone = data => {
            return JSON.parse(JSON.stringify(data));
        };

        let countHeroes = function (heroes) {
            return this.data.colors.reduce((acc, color) => {
                return acc + heroes[color];
            }, 0);
        }.bind(this);

        let sumTime = function(heroes) {
            return this.data.colors.reduce((acc, color) => {
                return acc + heroes[color] * this.data.time[color];
            }, 0);
        }.bind(this);

        let compare = (a, b) => {
            let difHeroes = a.difHeroes - b.difHeroes;
            if (difHeroes !== 0) {
                return difHeroes;
            } else {
                return a.difTime - b.difTime;
            }
        };

        let branch = (node) => {
            let nodes = [];

            // Choose hero
            let color = this.data.colors.find(color => node.heroes[color] > 0);
            node.heroes[color]--;

            // We create nodes: in each of these a different monster is trained by the hero
            for (let i = 0; i < node.monsters.length; i++) {
                let newNode = clone(node);
                let monster = newNode.monsters[i];
                monster[color]++;
                monster.total++;
                monster.time += this.data.time[color];
                monster.exp += monster.total < this.data.exp.length ? this.data.exp[monster.total] : this.data.exp[this.data.exp.length - 1];

                if (monster.total > heuristicHeroes || monster.time > heuristicTime) {
                    continue;
                } else if (visitedNodes[getHash(newNode)]) {
                    continue;
                }

                let minHeroes = Number.MAX_VALUE;
                let maxHeroes = Number.MIN_VALUE;
                let minTime = Number.MAX_VALUE;
                let maxTime = Number.MIN_VALUE;
                newNode.monsters.forEach(m => {
                    if (m.total < minHeroes)
                        minHeroes = m.total;
                    if (m.total > maxHeroes)
                        maxHeroes = m.total;
                    if (m.time < minTime)
                        minTime = m.time;
                    if (m.time > maxTime)
                        maxTime = m.time;
                });
                newNode.difHeroes = maxHeroes - minHeroes;
                newNode.difTime = maxTime - minTime;

                nodes.push(newNode);
            }

            return nodes;
        };

        // Calculates a unique hash for a given state
        let getHash = function(state) {
            let hash = 0;
            let acc = 1;

            this.data.colors.forEach(c => {
                state.monsters.forEach(m => {
                    hash += m[c] * acc;
                    acc *= this.state.heroes[c];
                });
            });

            return hash;
        }.bind(this);

        let queue = new PriorityQueue({ comparator: compare });
        let visitedNodes = {};

        let totalHeroes = countHeroes(allHeroes);
        let heuristicHeroes = Math.ceil(totalHeroes / nGyms);
        let heuristicTime = Math.ceil(sumTime(allHeroes) / nGyms);

        let s0 = {
            heroes: clone(allHeroes),
            monsters: [],
            difHeroes: 0,
            difTime: 0
        };
        for (let nMon = 0; nMon < nGyms; nMon++) {
            s0.monsters.push({
                grey: 0,
                green: 0,
                blue: 0,
                purple: 0,
                gold: 0,
                total: 0,
                time: 0,
                exp: 0
            });
        }

        queue.queue(s0);

        let best = clone(s0);
        best.difHeroes = Number.MAX_VALUE;
        best.difTime = Number.MAX_VALUE;


        //TODO canviar que les diferències hagin de ser zero a el que sigui que tenim quan NO és divisible

        let iterations = 0;
        while (queue.length > 0 && ++iterations < this.data.iterations) {
            let node = queue.dequeue();
            visitedNodes[getHash(node)] = true;
            if (countHeroes(node.heroes) === 0) {
                // It's a leaf: a possible solution
                if (compare(best, node) > 0) {
                    // We found a better solution
                    best = node;
                    if (node.difHeroes === 0 && node.difTime === 0) {
                        // Perfect solution
                        break;
                    }
                }
            } else {
                let nodes = branch(node);
                nodes.forEach(n => {
                    queue.queue(n);
                });
            }
        }

        return best.monsters;
    }

    render() {

        let gyms = [];

        for (let nGyms = 1; nGyms <= 6; nGyms++) {
            let monsters = this.optimalGym(nGyms, this.state.heroes);

            let listGroupItems = [];
            monsters.forEach((monster, i) => {
                listGroupItems.push(<ListGroupItem key={i}>
                    Monster #{i+1}
                    Heroes: {monster.gold}/{monster.purple}/{monster.blue}/{monster.green}/{monster.grey}
                    Time: {this.convertMinutesToText(monster.time + this.data.time.empty + this.convertTextToMinutes(this.state.timeBoost))}
                    Exp/h: {(monster.exp + this.data.exp[0]) * (100 + this.state.expBoost)}
                </ListGroupItem>);
            });

            gyms.push(<Col md={4} key={nGyms}>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h4">{nGyms} gym{nGyms > 1 ? 's' : ''}</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <ListGroup>
                            {listGroupItems}
                        </ListGroup>
                    </Panel.Body>
                </Panel>
            </Col>)
        }

        return (

            <div>
                <Navbar location={this.props.location.pathname}/>
                <Grid>
                    <Form horizontal>
                        <h3>Data</h3>
                        <FormGroup controlId="expBoost">
                            <Col componentClass={ControlLabel} sm={2}>
                                Training EXP Boost
                            </Col>
                            <Col sm={10}>
                                <InputGroup>
                                    <InputGroup.Addon>+</InputGroup.Addon>
                                    <FormControl type="number" min="0" step="0.1" value={this.state['expBoost']} onChange={this.handleChange} />
                                    <InputGroup.Addon>%</InputGroup.Addon>
                                </InputGroup>
                            </Col>
                        </FormGroup>
                        <FormGroup controlId="timeBoost">
                            <Col componentClass={ControlLabel} sm={2}>
                                Training Time Boost
                            </Col>
                            <Col sm={10}>
                                <InputGroup className="bootstrap-timepicker timepicker">
                                    <FormControl type="text" value={this.state['timeBoost']} onChange={this.handleChange} />
                                    <InputGroup.Addon>
                                        <Glyphicon glyph="time" />
                                    </InputGroup.Addon>
                                </InputGroup>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={2}>
                                Heroes
                            </Col>
                            <Col sm={10}>
                                <Row>
                                    <Col md={2}>
                                        <InputGroup>
                                            <InputGroup.Addon style={{backgroundColor: 'gold'}}>Gold</InputGroup.Addon>
                                            <FormControl id="heroes-gold" type="number" min="0" value={this.state.heroes.gold} onChange={this.handleChange} />
                                        </InputGroup>
                                    </Col>
                                    <Col md={2}>
                                        <InputGroup>
                                            <InputGroup.Addon style={{backgroundColor: 'mediumpurple'}}>Purple</InputGroup.Addon>
                                            <FormControl id="heroes-purple" type="number" min="0" value={this.state.heroes.purple} onChange={this.handleChange} />
                                        </InputGroup>
                                    </Col>
                                    <Col md={2}>
                                        <InputGroup>
                                            <InputGroup.Addon style={{backgroundColor: 'lightblue'}}>Blue</InputGroup.Addon>
                                            <FormControl id="heroes-blue" type="number" min="0" value={this.state.heroes.blue} onChange={this.handleChange} />
                                        </InputGroup>
                                    </Col>
                                    <Col md={2}>
                                        <InputGroup>
                                            <InputGroup.Addon style={{backgroundColor: 'lightgreen'}}>Green</InputGroup.Addon>
                                            <FormControl id="heroes-green" type="number" min="0" value={this.state.heroes.green} onChange={this.handleChange} />
                                        </InputGroup>
                                    </Col>
                                    <Col md={2}>
                                        <InputGroup>
                                            <InputGroup.Addon style={{backgroundColor: 'lightgrey'}}>Grey</InputGroup.Addon>
                                            <FormControl id="heroes-grey" type="number" min="0" value={this.state.heroes.grey} onChange={this.handleChange} />
                                        </InputGroup>
                                    </Col>
                                    <Col md={2}>
                                        <InputGroup>
                                            <InputGroup.Addon>Total</InputGroup.Addon>
                                            <FormControl disabled type="text" value={this.state.heroes.grey + this.state.heroes.green + this.state.heroes.blue + this.state.heroes.purple + this.state.heroes.gold} />
                                        </InputGroup>
                                    </Col>
                                </Row>
                            </Col>
                        </FormGroup>
                        <h3>Example builds <OverlayTrigger placement="top" trigger="click" rootClose overlay={<Popover id="calculation">
                            This calculation may be imprecise. Finding a perfect solution would take forever.
                        </Popover>}>
                            <Glyphicon style={{cursor: 'pointer'}} glyph="info-sign"/>
                        </OverlayTrigger></h3>
                        <Row>
                            {gyms}
                        </Row>
                    </Form>
                    <Footer/>
                </Grid>
            </div>
        );
    }
}