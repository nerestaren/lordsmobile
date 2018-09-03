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
    InputGroup, OverlayTrigger, Panel, Popover, Row
} from 'react-bootstrap';
import update from 'immutability-helper';

import Navbar from './Navbar';
import Footer from './Footer';

import $ from 'jquery';

window.jQuery = window.$ = $;
require('bootstrap');
require('bootstrap-timepicker');

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.data = {
            materials: {
                prison: {
                    1: 1,
                    2: 2,
                    3: 5,
                    4: 12,
                    5: 20,
                    6: 30,
                    7: 45,
                    8: 60,
                    9: 85,
                    10: 100,
                    11: 120,
                    12: 150,
                    13: 180,
                    14: 250,
                    15: 340,
                    16: 500,
                    17: 700,
                    18: 900,
                    19: 1200,
                    20: 1500,
                    21: 1800,
                    22: 2100,
                    23: 2400,
                    24: 3000,
                    25: 4500
                },
                battleHall: {
                    1: 1,
                    2: 2,
                    3: 5,
                    4: 12,
                    5: 20,
                    6: 30,
                    7: 45,
                    8: 60,
                    9: 85,
                    10: 100,
                    11: 120,
                    12: 150,
                    13: 180,
                    14: 250,
                    15: 340,
                    16: 500,
                    17: 700,
                    18: 900,
                    19: 1200,
                    20: 1500,
                    21: 1800,
                    22: 2100,
                    23: 2400,
                    24: 3000,
                    25: 4500
                },
                altar: {
                    1: 1,
                    2: 2,
                    3: 5,
                    4: 12,
                    5: 20,
                    6: 30,
                    7: 45,
                    8: 60,
                    9: 85,
                    10: 100,
                    11: 120,
                    12: 150,
                    13: 180,
                    14: 250,
                    15: 340,
                    16: 500,
                    17: 700,
                    18: 900,
                    19: 1200,
                    20: 1500,
                    21: 1800,
                    22: 2100,
                    23: 2400,
                    24: 3000,
                    25: 4500
                },
                treasureTrove: {
                    1: 0, 2: 5, 3: 25, 4: 55, 5: 75, 6: 145, 7: 295, 8: 900, 9: 3500
                }
            },
            gems: {
                prison: {
                    1: 15,
                    10: 120,
                    100: 1100,
                    1000: 10000
                },
                battleHall: {
                    1: 15,
                    10: 120,
                    100: 1100,
                    1000: 10000
                },
                altar: {
                    1: 15,
                    10: 120,
                    100: 1100,
                    1000: 10000
                },
                treasureTrove: {
                    1: 20,
                    10: 160,
                    100: 1500,
                    1000: 14000
                }
            },
            buildings: ['prison', 'battleHall', 'altar', 'treasureTrove'],
            buildingNames: {
                prison: 'Prison',
                battleHall: 'Battle Hall',
                altar: 'Altar',
                treasureTrove: 'Treasure Trove'
            },
            resourceNames: {
                prison: 'Steel Cuffs',
                battleHall: 'War Tomes',
                altar: 'Soul Crystals',
                treasureTrove: 'Crystal Pickaxes'
            }
        };
        let defaults = JSON.parse(localStorage.getItem('buildings'));
        if (defaults === null) {
            defaults = {
                level: {
                    prison: 0,
                    battleHall: 0,
                    altar: 0,
                    treasureTrove: 0
                },
                materials: {
                    prison: 0,
                    battleHall: 0,
                    altar: 0,
                    treasureTrove: 0
                }
            };
        }
        this.state = {...defaults};
        this.handleChange = this.handleChange.bind(this);
    }

    componentWillUpdate(nextProps, nextState) {
        localStorage.setItem('buildings', JSON.stringify(nextState));
    }

    handleChange(event) {
        let id = event.target.id.split('-');
        let levelOrMaterial = id[1];
        let building = id[0];

        this.setState(update(this.state, {
            [levelOrMaterial]: {
                [building]: {
                    $set: +event.target.value
                }
            }
        }));
    }

    render() {
        let formGroups = [];
        let totalUsedGems = 0;
        let totalRemainingGems = 0;

        this.data.buildings.forEach((id, i) => {
            let levels = Object.keys(this.data.materials[id]).map(a => parseInt(a, 10)).sort((a, b) => a - b);
            let materialPacks = Object.keys(this.data.gems[id]).map(a => parseInt(a, 10)).sort((a, b) => b - a);
            let used = 0;
            let remaining = 0;
            let owned = this.state.materials[id];
            let usedAndOwned = 0;

            let usedGems;
            let remainingGems;
            let usedGemsExplanation = [];
            let remainingGemsExplanation = [];

            // Calculate used and remaining materials
            levels.forEach(level => {
                if (this.state.level[id] >= level) {
                    used += this.data.materials[id][level];
                } else {
                    remaining += this.data.materials[id][level];
                }
            });
            usedAndOwned = used + owned;
            remaining -= owned;

            // Calculate used and remaining gems
            let calcGems = function(materials, explanation) {
                let gems = 0;
                if (materials === 9 && this.data.gems[id][1] * 9 > this.data.gems[id][10]) {
                    // Better to buy 1x 10 pack than 9x 1 packs
                    gems += this.data.gems[id][10];
                    explanation.push(<li>1&times;10</li>)
                } else {
                    materialPacks.forEach(amount => {
                        if (amount <= materials) {
                            console.log(`${amount} <= ${materials}`);
                            let quantity = Math.floor(materials / amount);
                            gems += this.data.gems[id][amount] * quantity;
                            explanation.push(<li key={amount}>{quantity}&times;{amount}</li>);
                            materials -= amount * quantity;
                        }
                    });
                }
                return gems;
            }.bind(this);

            usedGems = calcGems(usedAndOwned, usedGemsExplanation);
            remainingGems = calcGems(remaining, remainingGemsExplanation);

            totalUsedGems += usedGems;
            totalRemainingGems += remainingGems;

            if (usedGems === 0) {
                usedGemsExplanation = 'No used gems';
            } else {
                usedGemsExplanation = <ul>{usedGemsExplanation}</ul>;
            }
            if (remainingGems === 0) {
                remainingGemsExplanation = 'No remaining gems';
            } else {
                remainingGemsExplanation = <ul>{remainingGemsExplanation}</ul>;
            }

            formGroups.push(<div key={id}>
                <h3>{this.data.buildingNames[id]}</h3>
                <FormGroup>
                    <Col componentClass={ControlLabel} sm={2}>{this.data.buildingNames[id]} level</Col>
                    <Col sm={10}>
                        <FormControl id={`${id}-level`} componentClass="select" value={this.state.level[id]}
                                     onChange={this.handleChange}>
                            <option value="0">-</option>
                            {levels.map(level => {
                                return <option key={level}>{level}</option>
                            })}
                        </FormControl>
                    </Col>
                </FormGroup>
                <FormGroup>
                    <Col componentClass={ControlLabel} sm={2}>Used {this.data.resourceNames[id]}</Col>
                    <Col sm={10}>
                        <FormControl type="text" disabled value={used}/>
                    </Col>
                </FormGroup>
                <FormGroup>
                    <Col componentClass={ControlLabel} sm={2}>Owned {this.data.resourceNames[id]}</Col>
                    <Col sm={10}>
                        <FormControl id={`${id}-materials`} type="number" value={this.state.materials[id]}
                                     min="0" onChange={this.handleChange}/>
                    </Col>
                </FormGroup>
                <FormGroup>
                    <Col componentClass={ControlLabel} sm={2}>Used gems</Col>
                    <Col sm={10}>
                        <InputGroup>
                            <FormControl type="text" disabled value={usedGems}/>
                            <InputGroup.Addon>
                                <OverlayTrigger placement="top" trigger="click" rootClose overlay={<Popover id="used-gems-explanation" title={`Used gems: ${usedGems}`}>
                                        {usedGemsExplanation}
                                    </Popover>}>
                                    <Glyphicon style={{cursor: 'pointer'}} glyph="info-sign"/>
                                </OverlayTrigger>
                            </InputGroup.Addon>
                        </InputGroup>
                    </Col>
                </FormGroup>
                <FormGroup>
                    <Col componentClass={ControlLabel} sm={2}>Remaining {this.data.resourceNames[id]}</Col>
                    <Col sm={10}>
                        <FormControl type="text" disabled value={remaining}/>
                    </Col>
                </FormGroup>
                <FormGroup>
                    <Col componentClass={ControlLabel} sm={2}>Remaining gems</Col>
                    <Col sm={10}>
                        <InputGroup>
                            <FormControl type="text" disabled value={remainingGems}/>
                            <InputGroup.Addon>
                                <OverlayTrigger placement="top" trigger="click" rootClose overlay={<Popover id="remaining-gems-explanation" title={`Remaining gems: ${remainingGems}`}>
                                        {remainingGemsExplanation}
                                    </Popover>}>
                                    <Glyphicon style={{cursor: 'pointer'}} glyph="info-sign"/>
                                </OverlayTrigger>
                            </InputGroup.Addon>
                        </InputGroup>
                    </Col>
                </FormGroup>
            </div>);
        });

        return (

            <div>
                <Navbar location={this.props.location.pathname}/>
                <Grid>
                    <Form horizontal>
                        {formGroups}
                        <h3>Total</h3>
                        <Row>
                            <Col md={6}>
                                <Panel>
                                    <Panel.Heading>
                                        <Panel.Title componentClass="h4">Used gems</Panel.Title>
                                    </Panel.Heading>
                                    <Panel.Body>
                                        {totalUsedGems}
                                    </Panel.Body>
                                </Panel>
                            </Col>
                            <Col md={6}>
                                <Panel>
                                    <Panel.Heading>
                                        <Panel.Title componentClass="h4">Remaining gems</Panel.Title>
                                    </Panel.Heading>
                                    <Panel.Body>
                                        {totalRemainingGems}
                                    </Panel.Body>
                                </Panel>
                            </Col>
                        </Row>
                    </Form>
                    <Footer/>
                </Grid>
            </div>
        );
    }
}
;