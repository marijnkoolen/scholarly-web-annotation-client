
'use strict'

import React from 'react';
import AnnotationUtil from './../../util/AnnotationUtil.js';
import AppAnnotationStore from './../../flux/AnnotationStore';
import AnnotationActions from '../../flux/AnnotationActions.js';

export default class CollectionViewer extends React.Component {
	constructor(props) {
		super(props);
		console.log("constructor done");
		this.state = {
			collections: []
		}
	}

	componentDidMount() {
		console.log("collectionList mounted");
		AppAnnotationStore.bind('load-collections', this.loadCollections.bind(this));
	}

	loadCollections(collections) {
		console.log(collections);
		this.setState({collections: collections});
	}

	render() {
		let collections = this.state.collections.map((collection, index) => {
			console.log(index);
			let key = "collection-" + index;
			return (
				<div className="Collection" key={key}>
					{collection.label}
				</div>
			)
		})
		return (
			<div className="CollectionList">
				<h3>Saved collections</h3>
				<ul>
					{collections}
				</ul>
			</div>
		)
	}

}

