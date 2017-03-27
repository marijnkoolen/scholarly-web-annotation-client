import React from 'react';
import AnnotationCreator from './AnnotationCreator';
import FlexModal from '../FlexModal';

import AnnotationStore from '../../flux/AnnotationStore';

/*
TODO:
    - Dependancy on jquery!! fix this later (see: http://andrewhfarmer.com/react-ajax-best-practices/)
    - Make sure the editing form can be shown in a div rather than a pop-up. This is important, because modals
        prevent you from watching the video while annotating
    - The annotation list does not show only items that are relevant for the current annotation target:
        it simply shows all annotations
*/

/*
Input:
    - Annotation ID
    - Annotation Label (if any, otherwise use ID)
    - User ID

Output/emits:
    - set active annotation (for letting the page know which annotation is active)
    - edit annotation (for opening an edit form)
*/

class AnnotationBox extends React.Component {

    constructor(props) {
        super(props);
        this.onHide = this.onHide.bind(this);
    }

    onHide() {
        $('#annotation__modal').modal('hide');//TODO ugly, but without this the static backdrop won't disappear!
    }

    render() {
        return (
            <div>
                {this.props.showModal ?
                    <FlexModal
                        elementId="annotation__modal"
                        handleHideModal={this.props.hideAnnotationForm.bind(this)}
                        title={'Add one or more annotation bodies'}>
                        <AnnotationCreator
                            editAnnotation={this.props.editAnnotation}
                            currentUser={this.props.currentUser}
                            annotationModes={this.props.annotationModes}
                            services={this.props.services}
                            hideAnnotationForm={this.onHide.bind(this)}
                        />
                    </FlexModal>: null
                }
            </div>
        );
    }
}

export default AnnotationBox;
