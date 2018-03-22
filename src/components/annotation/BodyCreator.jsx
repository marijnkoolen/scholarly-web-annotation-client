import FreetextForm from './FreetextForm';
import ClassifyingForm from './ClassifyingForm';
import LinkingForm from './LinkingForm';

import React from 'react';


class BodyCreator extends React.Component {

    constructor(props) {
        super(props);

        let activeTab = null;
        for(let i=0;i<Object.keys(this.props.annotationTasks).length;i++) {
            if(Object.keys(this.props.annotationTasks)[i] != 'bookmark') {
                activeTab = Object.keys(this.props.annotationTasks)[i];
                break;
            }
        }
        this.state = {
            activeTab : activeTab,
            bodies: this.props.createdBodies,
            defaultCollection: null,
        }
    }

	componentDidMount() {
	}

    closeSelectorModal() {
        this.setState({showSelectorModal: false});
    }
    updateAnnotationBody(annotationMode, value) {
        var bodies = this.state.bodies;
        bodies[annotationMode] = value;
        this.setState({bodies: bodies});
        this.props.setBodies(bodies);
    }

    addTargets() {
        this.props.addTargets();
    }

    render() {
        //generate the tabs from the configured modes
        const tabs = Object.keys(this.props.annotationTasks).map(function(mode) {
            if (mode == 'bookmark') { return null };
            return (
                <li
                    key={mode + '__tab_option'}
                    className="nav-tab"
                >
                    <a data-toggle="tab" href={'#' + mode} className={this.state.activeTab == mode ? 'nav-link active' : 'nav-link'}>
                        {mode}
                    </a>
                </li>
                )
        }, this)

        //generate the content of each tab (a form based on a annotation mode/motivation)
        var tabContents = Object.keys(this.props.annotationTasks).map(function(mode) {
            if (mode == 'bookmark') { return null };
            let form = '';
            switch(mode) {
                case 'classify' : form = (
                    <ClassifyingForm
                        data={this.state.bodies.classification}
                        config={this.props.annotationTasks[mode]}
                        onOutput={this.updateAnnotationBody.bind(this)}
                        services={this.props.services}
                    />
                );
                break;
                case 'link' : form = (
                    <LinkingForm
                        data={this.state.bodies.link}
                        config={this.props.annotationTasks[mode]}
                        onOutput={this.updateAnnotationBody.bind(this)}
                        services={this.props.services}
                    />
                );
                break;
                default : form = (
                    <FreetextForm
                        data={this.state.bodies[this.props.annotationTasks[mode].type]}
                        config={this.props.annotationTasks[mode]}
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
            <div className="container-fluid">
                <ul className="nav nav-tabs">
                    {tabs}
                </ul>
                <div className="tab-content">
                    {tabContents}
                </div>
                <div>
                </div>
            </div>
        )
    }
}

export default BodyCreator;
