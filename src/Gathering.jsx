import React, { Component } from 'react';
import {Button, Col, ControlLabel, Form, FormControl, FormGroup, Glyphicon, Grid, InputGroup} from 'react-bootstrap';

import Navbar from './Navbar';
import Footer from './Footer';

import $ from 'jquery';
window.jQuery = window.$ = $;
require('bootstrap');
require('bootstrap-timepicker');

export default class Gathering extends Component {
    constructor(props) {
        super(props);
        this.data = {
            gatheringRateByType: {      // Amount of rss per second at lvl 1
                field: 24,
                rocks: 16,
                woods: 16,
                richVein: 16,
                ruins: 8.75
            },
            gatheringRateByLevel: {     // Rate of rss per second at different levels
                1: 1,
                2: 1.5,
                3: 2,
                4: 3,
                5: 4
            },
            tileMaxCapacityByType: {    // Max capacity at different tile levels (no formula available)
                field: [0, 225000, 412500, 900000, 1575000, 4125000],   // 1, 1.8333, 4, 7, 18.3333
                rocks: [0, 180000, 330000, 720000, 1260000, 3300000],   // 1, 1.8333, 4, 7, 18.3333
                woods: [0, 180000, 330000, 720000, 1260000, 3300000],  // 1, 1.8333, 4, 7, 18.3333
                richVein: [0, 135000, 247500, 540000, 945000, 2475000], // 1, 1.8333, 4, 7, 18.3333
                ruins: [0, 67500, 123500, 270000, 472500, 1462500]      // 1, 1.8296, 4, 7, 21.6667 <- weird
            }
        };
        let defaults = JSON.parse(localStorage.getItem('gathering'));
        console.log('defaults', defaults);
        if (defaults === null) {
            defaults = {
                'gathering-speed-bonus': 0,
                'gathering-tile-type': 'field',
                'gathering-tile-level': 1
            };
            defaults['gathering-capacity'] = defaults['gathering-tile-max-capacity'] = this.computeGatheringMaxCapacity(defaults['gathering-tile-type'], defaults['gathering-tile-level']);
            defaults['gathering-time'] = this.computeGatheringTime(defaults['gathering-capacity'], defaults['gathering-speed-bonus'], defaults['gathering-tile-type'], defaults['gathering-tile-level']);
        }
        this.state = { ...defaults };
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.getCapacityValidationState = this.getCapacityValidationState.bind(this);
    }

    computeGatheringTime(gatheringCapacity, gatheringSpeedBonus, gatheringTileType, gatheringTileLevel) {
        // time = capacity / (speed * rate by tile type * rate by tile level)
        return this.convertSecondsToText(gatheringCapacity / (
            (1 + gatheringSpeedBonus / 100) *
            this.data.gatheringRateByType[gatheringTileType] *
            this.data.gatheringRateByLevel[gatheringTileLevel]
        ));
    }

    computeGatheringMaxCapacity(gatheringTileType, gatheringTileLevel) {
        return this.data.tileMaxCapacityByType[gatheringTileType][gatheringTileLevel];
    }

    computeGatheringCapacity(gatheringSpeedBonus, gatheringTileType, gatheringTileLevel, gatheringTime) {
        // capacity = speed * rate by tile type * rate by tile level * time
        return (1 + gatheringSpeedBonus / 100) *
            this.data.gatheringRateByType[gatheringTileType] *
            this.data.gatheringRateByLevel[gatheringTileLevel] *
            this.convertTextToSeconds(gatheringTime);
    }

    convertSecondsToText(seconds) {
        seconds = Math.ceil(seconds);
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

    convertTextToSeconds(text) {
        let matches = /(\d{2}):(\d{2}):(\d{2})/.exec(text);
        if (matches) {
            return matches[1] * 3600 + matches[2] * 60 + matches[3] * 1;
        } else {
            return 0;
        }
    }

    componentDidMount() {
        $('#gathering-time').timepicker({
            maxHours: 99,
            minuteStep: 1,
            secondStep: 1,
            showSeconds: true,
            showMeridian: false
        });
    }

    componentWillUpdate(nextProps, nextState) {
        localStorage.setItem('gathering', JSON.stringify(nextState));
        console.log('saving state', nextState, localStorage.getItem('gathering'));
    }

    handleChange(event) {
        switch (event.target.id) {
            case 'gathering-speed-bonus':
                // gathering-speed-bonus -> gathering-time
                this.setState({
                    'gathering-speed-bonus': event.target.value,
                    'gathering-time': this.computeGatheringTime(
                        this.state['gathering-capacity'],
                        event.target.value,
                        this.state['gathering-tile-type'],
                        this.state['gathering-tile-level']
                    )
                });
                break;
            case 'gathering-tile-type': {
                // gathering-tile-level -> gathering-tile-max-capacity -> gathering-capacity -> gathering-time
                let maxCapacity = this.computeGatheringMaxCapacity(event.target.value, this.state['gathering-tile-level']);
                let gatheringCapacity = maxCapacity;
                this.setState({
                    'gathering-tile-type': event.target.value,
                    'gathering-capacity': gatheringCapacity,
                    'gathering-tile-max-capacity': maxCapacity,
                    'gathering-time': this.computeGatheringTime(
                        gatheringCapacity,
                        this.state['gathering-speed-bonus'],
                        event.target.value,
                        this.state['gathering-tile-level']
                    )
                });
                break;
            }
            case 'gathering-tile-level': {
                // gathering-tile-level -> gathering-tile-max-capacity -> gathering-capacity -> gathering-time
                let maxCapacity = this.computeGatheringMaxCapacity(this.state['gathering-tile-type'], event.target.value);
                let gatheringCapacity = maxCapacity;
                this.setState({
                    'gathering-tile-level': event.target.value,
                    'gathering-capacity': gatheringCapacity,
                    'gathering-tile-max-capacity': maxCapacity,
                    'gathering-time': this.computeGatheringTime(
                        gatheringCapacity,
                        this.state['gathering-speed-bonus'],
                        this.state['gathering-tile-type'],
                        event.target.value
                    )
                });
                break;
            }
            case 'gathering-capacity': {
                // gathering-capacity -> gathering-time
                let gatheringCapacity = Math.min(event.target.value, this.state['gathering-tile-max-capacity']);
                this.setState({
                    'gathering-capacity': gatheringCapacity,
                    'gathering-time': this.computeGatheringTime(
                        gatheringCapacity,
                        this.state['gathering-speed-bonus'],
                        this.state['gathering-tile-type'],
                        this.state['gathering-tile-level']
                    )
                });
                break;
            }
            case 'gathering-time':
                // gathering-time -> gathering-capacity
                this.setState({
                    'gathering-capacity': this.computeGatheringCapacity(
                        this.state['gathering-speed-bonus'],
                        this.state['gathering-tile-type'],
                        this.state['gathering-tile-level'],
                        event.target.value
                    ),
                    'gathering-time': event.target.value
                });
                break;
            default:
                break;
        }
    }

    handleClick(event) {
        switch (event.target.id) {
            case 'gathering-set-max-capacity':
                // gathering-capacity -> gathering-time
                let gatheringCapacity = this.state['gathering-tile-max-capacity']
                this.setState({
                    'gathering-capacity': gatheringCapacity,
                    'gathering-time': this.computeGatheringTime(
                        gatheringCapacity,
                        this.state['gathering-speed-bonus'],
                        this.state['gathering-tile-type'],
                        this.state['gathering-tile-level']
                    )
                });
                break;
            default:
                break;
        }
    }

    getCapacityValidationState() {
        let dif = this.state['gathering-tile-max-capacity'] - this.state['gathering-capacity'];
        if (dif > 0) {
            return 'warning';
        } else if (dif === 0) {
            return 'success';
        } else {
            return 'error';
        }
    }

    render() {
        return (
            <div>
                <Navbar location={this.props.location.pathname}/>
                <Grid>
                    <Form horizontal>
                        <FormGroup controlId="gathering-speed-bonus">
                            <Col componentClass={ControlLabel} sm={2}>
                                Speed bonus
                            </Col>
                            <Col sm={10}>
                                <InputGroup>
                                    <InputGroup.Addon>+</InputGroup.Addon>
                                    <FormControl type="number" min="0" step="0.01" value={this.state['gathering-speed-bonus']} onChange={this.handleChange} />
                                    <InputGroup.Addon>%</InputGroup.Addon>
                                </InputGroup>
                            </Col>
                        </FormGroup>
                        <FormGroup controlId="gathering-tile-type">
                            <Col componentClass={ControlLabel} sm={2}>
                                Tile type
                            </Col>
                            <Col sm={10}>
                                <FormControl componentClass="select" value={this.state['gathering-tile-type']} onChange={this.handleChange}>
                                    <option value="field">Field</option>
                                    <option value="rocks">Rocks</option>
                                    <option value="woods">Woods</option>
                                    <option value="richVein">Rich Vein</option>
                                    <option value="ruins">Ruins</option>
                                </FormControl>
                            </Col>
                        </FormGroup>
                        <FormGroup controlId="gathering-tile-level">
                            <Col componentClass={ControlLabel} sm={2}>
                                Tile level
                            </Col>
                            <Col sm={10}>
                                <FormControl componentClass="select" value={this.state['gathering-tile-level']} onChange={this.handleChange}>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                </FormControl>
                            </Col>
                        </FormGroup>
                        <FormGroup controlId="gathering-capacity" validationState={this.getCapacityValidationState()}>
                            <Col componentClass={ControlLabel} sm={2}>
                                Tile capacity
                            </Col>
                            <Col sm={10}>
                                <InputGroup>
                                    <FormControl type="number" min="0" max={this.state['gathering-tile-max-capacity']} lang="ca-ES" value={this.state['gathering-capacity']} onChange={this.handleChange} />
                                    <InputGroup.Addon> / {this.state['gathering-tile-max-capacity']}</InputGroup.Addon>
                                    <InputGroup.Button>
                                        <Button id="gathering-set-max-capacity" onClick={this.handleClick}>All</Button>
                                    </InputGroup.Button>
                                </InputGroup>
                            </Col>
                        </FormGroup>
                        <FormGroup controlId="gathering-time">
                            <Col componentClass={ControlLabel} sm={2}>
                                Time
                            </Col>
                            <Col sm={10}>
                                <InputGroup className="bootstrap-timepicker timepicker">
                                    <FormControl type="text" value={this.state['gathering-time']} onChange={this.handleChange} />
                                    <InputGroup.Addon>
                                        <Glyphicon glyph="time" />
                                    </InputGroup.Addon>
                                </InputGroup>
                            </Col>
                        </FormGroup>
                    </Form>
                    <Footer />
                </Grid>
            </div>
        );
    }
};