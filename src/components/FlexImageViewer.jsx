/*
Currently uses:
	- https://openseadragon.github.io
	- https://github.com/picturae/openseadragonselection


	TODO
		- check out the flexplayer to see how to update annotations here
		- check out ViewDir!: https://viewdir.github.io/
*/

import AnnotationAPI from '../../../api/AnnotationAPI';
import AnnotationUtil from '../../../util/AnnotationUtil';

import AnnotationActions from '../../../flux/AnnotationActions';
import AppAnnotationStore from '../../../flux/AnnotationStore';



class FlexImageViewer extends React.Component {

	constructor(props) {
		super(props);

		this.viewer = null;
		this.annotationIdCount = 0;//TODO do this differently later on
		this.state = {
			user : this.props.user || 'JaapTest',
			annotations : [],
			viewerLoaded : false
		}
	}

	/* --------------------------------------------------------------
	-------------------------- OBSERVING THE API --------------------
	---------------------------------------------------------------*/

	componentDidMount() {
		if(this.props.annotationSupport) {
			//load the initial annotations
			this.loadAnnotations();

			//then listen to any changes that happen in the API
			AppAnnotationStore.bind(this.props.mediaObject.url, this.onChange.bind(this));
		} else {
			this.initViewer();
		}
	}

	onChange(eventType, data, annotation) {
		if(eventType) {
			if(eventType == 'update') {
				this.loadAnnotations();
			} else if (eventType == 'delete' && annotation && annotation.id) {
				this.viewer.removeOverlay(annotation.id);
				let temp = [];
				this.state.annotations.forEach((a) => {
					if(a.id != annotation.id) {
						temp.push(a);
					}
				});
				this.setState({annotations : temp});
			}
		}
	}

	loadAnnotations() {
		AppAnnotationStore.getMediaObjectAnnotations(
			this.props.mediaObject.url,
			this.state.user,
			this.onLoadAnnotations.bind(this)
		);
	}

	//FIXME make sure this works again for the new annotations
	onLoadAnnotations(annotationData) {
		if(!this.state.viewerLoaded) {
			this.setState((previousState, currentProps) => {
  				return {annotations : this.deleteOldOverlays.call(this, previousState.annotations, annotationData.annotations)};
			}, this.initViewer.bind(this));

			//this.setState(annotationData, this.initViewer.bind(this));
		} else {
			this.setState((previousState, currentProps) => {
  				return {annotations : this.deleteOldOverlays.call(this, previousState.annotations, annotationData.annotations)};
			});
		}
	}

	deleteAnnotation(annotation, event) {
		if(event) {
			event.preventDefault();
			event.stopPropagation();
		}
		if(annotation && annotation.id) {
			AnnotationActions.delete(annotation);
		}
	}

	/* --------------------------------------------------------------
	-------------------------- VIEWER INITIALIZATION ----------------
	---------------------------------------------------------------*/

	initViewer() {
		//setup the basic viewer
		this.viewer = OpenSeadragon({
			id: 'img_viewer__' + this.props.mediaObject.id,
			prefixUrl: '/static/node_modules/openseadragon/build/openseadragon/images/',
			showSelectionControl: true,
			sequenceMode : false,
			preserveViewport: true,
			height: '100px',

			//in case of a simple image
			tileSources: {
				type: 'image',
				url: this.props.mediaObject.url
			},
		});

		//make sure the selection button tooltips have translations (otherwise annoying debug messages)
		OpenSeadragon.setString('Tooltips.SelectionToggle', 'Toggle selection');
		OpenSeadragon.setString('Tooltips.SelectionConfirm', 'Confirm selection');

		//add the selection (rectangle) support (Picturae plugin)
		if(this.props.annotationSupport) {
			this.viewer.selection({
				showConfirmDenyButtons: true,
				styleConfirmDenyButtons: true,
				returnPixelCoordinates: true,
				keyboardShortcut: 'c', // key to toggle selection mode
				rect: null, // initial selection as an OpenSeadragon.SelectionRect object
				startRotated: false, // alternative method for drawing the selection; useful for rotated crops
				startRotatedHeight: 0.1, // only used if startRotated=true; value is relative to image height
				restrictToImage: false, // true = do not allow any part of the selection to be outside the image
				onSelection: function(rect) {
					this.addEmptyAnnotation.call(
						this,
						AnnotationUtil.generateW3CEmptyAnnotation(
							this.props.user,
							this.props.mediaObject.url,
							this.props.mediaObject.mimeType,
							{
								rect : {
									x : rect.x,
									y : rect.y,
									w : rect.width,
									h : rect.height
								},
								rotation : rect.rotation
							}
						)
					);
				}.bind(this), // callback
				prefixUrl: '/static/vendor/openseadragonselection-master/images/',
				navImages: { // overwrites OpenSeadragon's options
					selection: {
						REST:   'selection_rest.png',
						GROUP:  'selection_grouphover.png',
						HOVER:  'selection_hover.png',
						DOWN:   'selection_pressed.png'
					},
					selectionConfirm: {
						REST:   'selection_confirm_rest.png',
						GROUP:  'selection_confirm_grouphover.png',
						HOVER:  'selection_confirm_hover.png',
						DOWN:   'selection_confirm_pressed.png'
					},
					selectionCancel: {
						REST:   'selection_cancel_rest.png',
						GROUP:  'selection_cancel_grouphover.png',
						HOVER:  'selection_cancel_hover.png',
						DOWN:   'selection_cancel_pressed.png'
					},
				}
			});

			this.viewer.addHandler('open', function(target, info) {
				this.renderAll.bind(this);
				this.setState({viewerLoaded : true});
			}.bind(this));
		}

	}

	/* --------------------------------------------------------------
	-------------------------- ANNOTATION CRUD ----------------------
	---------------------------------------------------------------*/

	renderAll() {
		this.state.annotations.forEach((annotation) => {
			if(!this.viewer.getOverlayById(annotation.id)) {
				this.renderAnnotation(annotation);
			}
		});
	}

	deleteOldOverlays(oldAnnotations, newAnnotations) {
		oldAnnotations.forEach((annotation) => {
			this.viewer.removeOverlay(annotation.id);
		});
		return newAnnotations;
	}

	addEmptyAnnotation(annotation) {
		let annotations = this.state.annotations;
		annotation.id = AnnotationUtil.guid();
		annotations.push(annotation);
		this.setState({
			annotations : annotations
		}, this.openAnnotationForm.bind(this, annotation));
	}

	setActiveAnnotation(annotationId, event) {
		var d = document.getElementById(annotationId);
		var overlays = document.getElementsByClassName('image-overlay');
		if(overlays) {
			[].forEach.call(overlays, (elm) => {
				elm.className = 'image-overlay';
			});
			if(d && d.className.indexOf('image-overlay') != -1 && d.className.indexOf('active') == -1) {
				d.className += " active";
			}
		}
	}

	renderAnnotation(annotation) {
		let area = AnnotationUtil.extractSpatialFragmentFromURI(annotation.target.selector.value);
		var rect = this.viewer.viewport.imageToViewportRectangle(
			parseInt(area.x),
			parseInt(area.y),
			parseInt(area.w),
			parseInt(area.h)
		);
		var elt = document.createElement('div');
		elt.className = 'image-overlay';
		elt.onclick= this.setActiveAnnotation.bind(this, annotation.id);
		elt.id = annotation.id;

		var buttonDiv = document.createElement('div');
		buttonDiv.className = 'text-center';

		//add the remove button
		var addBtn = document.createElement('button');
		addBtn.className = 'btn btn-default';
		addBtn.onclick = this.openAnnotationForm.bind(this, annotation);
		var addGlyph = document.createElement('span');
		addGlyph.className = 'glyphicon glyphicon-pencil';
		addBtn.appendChild(addGlyph);

		//add the remove button
		var removeBtn = document.createElement('button');
		removeBtn.className = 'btn btn-default';
		removeBtn.onclick = this.deleteAnnotation.bind(this, annotation);
		var removeGlyph = document.createElement('span');
		removeGlyph.className = 'glyphicon glyphicon-remove';
		removeBtn.appendChild(removeGlyph);

		buttonDiv.appendChild(addBtn);
		buttonDiv.appendChild(removeBtn);

		elt.appendChild(buttonDiv);

		this.viewer.addOverlay({
			element: elt,
			location: rect
		});

	}

	openAnnotationForm(annotation, event) {
		if(event) {
			event.preventDefault();
			event.stopPropagation();
		}
		if(this.props.editAnnotation) {
			this.props.editAnnotation(annotation);
		}
	}

	/* ------------------------------------------------------------------------------
	------------------------------- COMMUNICATION WITH OWNER/RECIPE -----------------
	------------------------------------------------------------------------------- */

	//TODO assign the current media Object as target
	setActiveAnnotationTarget(annotationTarget) {
		if(this.props.setActiveAnnotationTarget) {
			this.props.setActiveAnnotationTarget(annotationTarget);
		}
	}

	//TODO this should 'play' props.playingAnnotation
	playAnnotation(annotation) {
		console.debug('to be implemented: playAnnotation()');
	}

	render() {
		if(this.state.viewerLoaded) {
			this.renderAll();
		}
		return (
			<div id={'img_viewer__' + this.props.mediaObject.id}></div>
		)
	}

}

export default FlexImageViewer;