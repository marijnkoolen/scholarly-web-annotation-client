'use strict'

import React from 'react';
import AppAnnotationStore from './../../flux/AnnotationStore';
import AnnotationActions from './../../flux/AnnotationActions';
import Annotation from './Annotation.jsx';

class AnnotationList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            annotations: [],
        }
    }
    componentDidMount() {
        AppAnnotationStore.bind('loaded-annotations', this.setAnnotations.bind(this));
        AppAnnotationStore.bind('load-annotations', this.loadAnnotations.bind(this));
        AppAnnotationStore.bind('changed-target', this.loadAnnotations.bind(this));
        AppAnnotationStore.bind('deleted-annotation', this.loadAnnotations.bind(this));
        console.log("mounted");
        console.log(this.props.currentUser);
    }
    loadAnnotations() {
        AnnotationActions.loadAnnotations();
    }
    setAnnotations(annotations) {
        this.setState({annotations: annotations});
    }
    render() {
        var annotationItems = null;
        let component = this;
        if (this.state.annotations) {
            annotationItems = this.state.annotations.map(function(annotation) {
                return (
                    <Annotation
                        annotation={annotation}
                        key={annotation.id}
                        currentUser={component.props.currentUser}
                    />
                );
            });
        }
        return (
            <div className="annotationList">
                <h3>Saved annotations</h3>
                <ul className="list-group">
                    {annotationItems}
                </ul>
            </div>
        );
    }
}

export default AnnotationList;
