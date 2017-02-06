import CommentingForm from './CommentingForm';
import ClassifyingForm from './ClassifyingForm';
import LinkingForm from './LinkingForm';

import AnnotationActions from '../../flux/AnnotationActions';
import React from 'react';


//TODO this should all be changed: instead of one annotation with multiple bodies (comments, classifications, links)
//this class should load multiple annotations related to the current target... pff lots of work...
class AnnotationCreator extends React.Component {

    constructor(props) {
        super(props);
        //make this less shitty verbosey
        let comments = [];
        let classifications = [];
        let links = [];

        if(this.props.editAnnotation.body) {
            this.props.editAnnotation.body.forEach(function(body) {
                if (body.type === "Classification") {
                    classifications.push(body);
                }
                if (body.type === "Comment") {
                    comments.push(body);
                }
                if (body.type === "Link") {
                    links.push(body);
                }
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
            classifications : classifications,
            comments : comments,
            links : links
        }
    }

    updateAnnotationBody(mode, value) {
        this.setState({[mode] : value});
    }

    //TODO this function looks like it could be more optimized
    gatherDataAndSave() {
        var annotation = this.props.editAnnotation;
        var body = [];
        if(this.state.classifications.length > 0) {
            body = body.concat(this.state.classifications);
        }
        if(this.state.comments.length > 0) {
            body = body.concat(this.state.comments);
        }
        if(this.state.links.length > 0) {
            body = body.concat(this.state.links);
        }
        annotation.body = body;
        AnnotationActions.save(annotation);
        this.props.hideAnnotationForm();
        AnnotationActions.reload();
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
                case 'comment' : form = (
                    <CommentingForm
                        data={this.state.comments}
                        config={this.props.annotationModes[mode]}
                        onOutput={this.updateAnnotationBody.bind(this)}
                    />
                );
                break;
                case 'classify' : form = (
                    <ClassifyingForm
                        data={this.state.classifications}
                        config={this.props.annotationModes[mode]}
                        onOutput={this.updateAnnotationBody.bind(this)}
                        services={this.props.services}
                    />
                );
                break;
                case 'link' : form = (
                    <LinkingForm
                        data={this.state.links}
                        config={this.props.annotationModes[mode]}
                        onOutput={this.updateAnnotationBody.bind(this)}
                        services={this.props.services}
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
