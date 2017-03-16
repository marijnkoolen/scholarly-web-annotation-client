import FreetextForm from './FreetextForm';
import ClassifyingForm from './ClassifyingForm';
import LinkingForm from './LinkingForm';

import AnnotationActions from '../../flux/AnnotationActions';
import React from 'react';


//TODO this should all be changed: instead of one annotation with multiple bodies (comments, classifications, links)
//this class should load multiple annotations related to the current target... pff lots of work...
class AnnotationCreator extends React.Component {

    constructor(props) {
        super(props);
        let bodies = {};

        if(this.props.editAnnotation.body) {
            this.props.editAnnotation.body.forEach(function(body) {
                if (!Object.keys(bodies).includes(body.type))
                    bodies[body.type] = [];
                bodies[body.type].push(body);
            });
        }
        let activeTab = null;
        for(let i=0;i<Object.keys(this.props.annotationModes).length;i++) {
            if(Object.keys(this.props.annotationModes)[i] != 'bookmark') {
                activeTab = Object.keys(this.props.annotationModes)[i];
                break;
            }
        }
        this.state = {
            activeTab : activeTab,
            bodies: bodies,
        }
    }

    updateAnnotationBody(mode, value) {
        this.setState({[mode] : value});
    }

    //TODO this function looks like it could be more optimized
    gatherDataAndSave() {
        let component = this;
        var annotation = this.props.editAnnotation;
        var body = [];
        Object.keys(component.state.bodies).forEach(function(bodyType) {
            body = body.concat(component.state.bodies[bodyType]);
        });
        annotation.body = body;
        AnnotationActions.save(annotation);
        this.props.hideAnnotationForm();
    }

    render() {
        //generate the tabs from the configured modes
        const tabs = Object.keys(this.props.annotationModes).map(function(mode) {
            if (mode == 'bookmark') { return null };
            return (
                <li
                    key={mode + '__tab_option'}
                    className={this.state.activeTab == mode ? 'active' : ''}
                >
                    <a data-toggle="tab" href={'#' + mode}>
                        {mode}
                    </a>
                </li>
                )
        }, this)

        //generate the content of each tab (a form based on a annotation mode/motivation)
        var tabContents = Object.keys(this.props.annotationModes).map(function(mode) {
            if (mode == 'bookmark') { return null };
            let form = '';
            switch(mode) {
                case 'classify' : form = (
                    <ClassifyingForm
                        data={this.state.bodies.classification}
                        config={this.props.annotationModes[mode]}
                        onOutput={this.updateAnnotationBody.bind(this)}
                        services={this.props.services}
                    />
                );
                break;
                case 'link' : form = (
                    <LinkingForm
                        data={this.state.bodies.link}
                        config={this.props.annotationModes[mode]}
                        onOutput={this.updateAnnotationBody.bind(this)}
                        services={this.props.services}
                    />
                );
                break;
                default : form = (
                    <FreetextForm
                        data={this.state.bodies[this.props.annotationModes[mode].type]}
                        config={this.props.annotationModes[mode]}
                        onOutput={this.updateAnnotationBody.bind(this)}
                    />
                );
                break;
            }
            return (
                <div
                    key={mode + '__tab_content'}
                    id={mode}
                    className={this.state.activeTab == mode ? 'tab-pane active' : 'tab-pane'}>
                        {form}
                </div>
                );
        }, this);

        return (
            <div>
                <ul className="nav nav-tabs">
                    {tabs}
                </ul>
                <div className="tab-content">
                    {tabContents}
                </div>
                <div className="text-right">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={this.gatherDataAndSave.bind(this)}>
                        Save
                    </button>
                </div>
            </div>
        )
    }
}

export default AnnotationCreator;
