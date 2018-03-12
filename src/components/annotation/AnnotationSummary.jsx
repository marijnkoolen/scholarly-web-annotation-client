import TimeUtil from '../../util/TimeUtil';
import AnnotationUtil from '../../util/AnnotationUtil';
import IconUtil from '../../util/IconUtil';
import IDUtil from '../../util/IDUtil';

import Classification from './Classification';

import AnnotationActions from '../../flux/AnnotationActions';

/*
Input:
	- TODO

Output:
	- TODO

HTML markup & CSS attributes:
	- regular div => .bg__annotation-summary
*/

class AnnotationSummary extends React.Component {

	constructor(props) {
		super(props);
		this.CLASS_PREFIX = 'ans'
	}

	editAnnotation(subAnnotation) {
		AnnotationActions.edit(this.props.annotation, subAnnotation);
	}

	render() {
		let title = null;
		let classifications = null;
		let cards = null;
		let comments = null;
		let links = null;

		if(this.props.annotation && this.props.annotation.body) {

			//if configured, extract the title based on the start & end times of the segment
			if(this.props.showTitle) {
				//title
				let frag = AnnotationUtil.extractTemporalFragmentFromAnnotation(this.props.annotation);
				title = (
					<h4>
						{'[' + TimeUtil.formatTime(frag.start) + ' - ' + TimeUtil.formatTime(frag.end) + ']'}
					</h4>
				);
			}

			//all the classifications are colorful labels
			let clItems = this.props.annotation.body.filter((a) => {
				return a.annotationType == 'classification';
			}).map((c, index) => {
				return (
					<span onDoubleClick={this.editAnnotation.bind(this, c)}>
						<Classification key={'cl__' + index} classification={c}/>
					</span>
				);
			});
			if(clItems.length > 0) {
				classifications = (
					<div className="well">
						{clItems}
					</div>
				)
			}

			//a tabbed panel holding a filled in card for each tab
			let cTabs = this.props.annotation.body.filter((a) => {
				return a.annotationType == 'metadata';
			}).map((a, index) => {
				let iconClass = IconUtil.getAnnotationTemplateIcon(a.annotationTemplate);
				return (
					<li key={index + '__tab'} className={index == 0 ? 'active' : ''}>
						<a data-toggle="tab" href={'#__tab_' + a.annotationId}>
							{a.annotationTemplate ? a.annotationTemplate : 'generic'}
							&nbsp;<span className={iconClass}></span>
						</a>
					</li>
				)
			});

			let cTabContents = this.props.annotation.body.filter((a) => {
				return a.annotationType == 'metadata';
			}).map((a, index) => {
				let cardItems = a.properties.map((prop, i) => {
					return (
						<li key={'c__' + index + '__' + i}>
							<span className="key">{prop.key}:</span>&nbsp;{prop.value}
						</li>);
				});
				let cardList = (
					<ul className={IDUtil.cssClassName('card-list', this.CLASS_PREFIX)}
						key={'c__' + index}
						onDoubleClick={this.editAnnotation.bind(this, a)}>
						{cardItems}
					</ul>
				);
				return (
					<div key={index + '__tab_c'} id={'__tab_' + a.annotationId}
						className={index == 0 ? 'tab-pane active' : 'tab-pane'}>
						{cardList}
					</div>
				);
			});

			if(cTabs.length > 0) {
				cards = (
					<div>
						<ul className="nav nav-tabs">
							{cTabs}
						</ul>
						<div className="tab-content">
							{cTabContents}
						</div>
					</div>
				)
			}


			//comments are shown in the form of a speech bubble with a number in it
			let commentList = this.props.annotation.body.filter((a) => {
				return a.annotationType == 'comment';
			});
			if(commentList.length > 0) {
				comments = (
					<div>
						<a href="javascript:void(0);" onClick={this.editAnnotation.bind(this, commentList[0])}>
							Comments: {commentList.length}&nbsp;
							<span className={IconUtil.getUserActionIcon('comment')}></span>
						</a>
					</div>
				)
			}

			//links are also shown in the form of a speech bubble with a number in it
			let linkList = this.props.annotation.body.filter((a) => {
				return a.annotationType == 'link';
			});
			if(linkList.length > 0) {
				links = (
					<div>
						<a href="javascript:void(0);" onClick={this.editAnnotation.bind(this, linkList[0])}>
							Links: {linkList.length}&nbsp;
							<span className={IconUtil.getUserActionIcon('link')}></span>
						</a>
					</div>
				)
			}

		}
		if(cards || classifications || comments || links) {
			return (
				<div className={IDUtil.cssClassName('annotation-summary')}>
					{title}
					{comments}
					{links}
					{classifications}
					{cards}
				</div>
			);
		} else {
			return (<div className="notice">No annotations added</div>);
		}
	}
};

export default AnnotationSummary;