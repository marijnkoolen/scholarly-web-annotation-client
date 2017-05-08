import Autosuggest from 'react-autosuggest'; //See: https://github.com/moroshko/react-autosuggest
import React from 'react';


/*
Input:
    - list of classifications (props.data)
    - a annotation config (props.config)
    - onOutput (what to do after adding/removing a classification) --> should be changed to Flux?

Output/emits:
    - a list of classifications
*/

class ClassifyingForm extends React.Component {

    constructor(props) {
        super(props);
        var vocabulary = this.props.config.vocabularies ? this.props.config.vocabularies[0] : null;
        this.state = {
            data: this.props.data ? this.props.data : [],
            value : '', //the label of the selected classification (autocomplete)
            suggestionId : null, //stores the id/uri of the selected classification (e.g. GTAA URI)
            suggestions : [], //current list of suggestions shown
            isLoading : false, //loading the suggestions from the server
            vocabulary : vocabulary
        }
        this.xhrs = [];
    }

    /* ------------------- CRUD / loading of classifications ------------------- */

    addClassification(e) {
        if(this.state.value != '') {
            e.preventDefault();
            var cs = this.state.data;
            if(cs) {
                cs.push({
                    id : this.state.suggestionId,
                    value : this.state.value,
                    vocabulary : this.state.vocabulary,
                    purpose : this.props.config.purpose,
                    type : this.props.config.type
                });
                this.setState({
                    value : '',
                    data : cs
                }, this.onOutput.bind(this));
            }
        }
    }

	toggleDefault(index) {
		AnnotationActions.toggleDefault(cs[index]);
	}
    removeClassification(index) {
        var cs = this.state.data;
        if(cs) {
            cs.splice(index, 1);
            this.setState({data : cs}, this.onOutput.bind(this));
        }
    }

    onOutput() {
        if(this.props.onOutput) {
            this.props.onOutput(this.props.config.type, this.state.data);
        }
    }

    setVocabulary(event) {
        this.setState({vocabulary : event.target.value});
    }

    getSuggestions(value, callback) {
        //cancel all previous outgoing requests
        for(let x=this.xhrs.length;x>0;x--) {
            this.xhrs[x-1].abort();
            this.xhrs.pop();
            //this.xhrs[x-1].abort().call(this, () => {
            //    this.xhrs.pop();
            //});
        }
        let url = this.props.services[this.state.vocabulary].api + value;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        // ensure service can return JSON
        xhr.setRequestHeader("Accept", "application/json");
        xhr.send();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                let data = JSON.parse(xhr.responseText);
                callback(data.results);
            }
        }
        //let url = '/autocomplete?vocab=' + this.state.vocabulary + '&term=' + value;
        this.xhrs.push(xhr);
    }

    /* ------------------- functions specifically needed for react-autosuggest ------------------- */

    loadSuggestions(value) {
        this.setState({
            isLoading: true,
            suggestions: []
        });
        if(value.value === this.state.chosenValue) {
            this.setState({
                isLoading: false
            });
        } else {
            this.getSuggestions(value.value, (data) => {
                if(data.error) {
                    this.setState({
                        isLoading: false,
                        suggestions: []
                    });
                } else {
                    this.setState({
                        isLoading: false,
                        suggestions: data
                    });
                }
            });
        }
    }

    getSuggestionValue(suggestion) {
        this.setState({suggestionId : suggestion.uri});
          return suggestion.label.split('|')[0];
    }

    //TODO the rendering should be adapted for different vocabularies
    renderSuggestion(suggestion) {
        let arr = suggestion.label.split('|');
        let label = arr[1];
        let scopeNote = arr[2] ? '(' + arr[2] + ')' : ''
        if (this.state.vocabulary === "GTAA") {
            switch(arr[1]) {
                case 'Persoon' :
                    label = (<span className="label label-warning">Persoon</span>);break;
                case 'Maker' :
                    label = (<span className="label label-warning">Maker</span>);break;
                case 'Geografisch' :
                    label = (<span className="label label-success">Locatie</span>);break;
                case 'Naam' :
                    label = (<span className="label label-info">Naam</span>);break;
                case 'Onderwerp' :
                    label = (<span className="label label-primary">Onderwerp</span>);break;
                case 'Genre' :
                    label = (<span className="label label-default">Genre</span>);break;
                case 'B&G Onderwerp' :
                    label = (<span className="label label-danger">B&G Onderwerp</span>);break;
                default :
                    label = (<span className="label label-default">Concept</span>);break;
            }
        } else if (this.state.vocabulary === "DBpedia") {
            label = (<span className="label label-default">Concept</span>);
        } else if (this.state.vocabulary == 'UNESCO') {
            switch(arr[1]) {
                case 'Education' : label = (<span className="label label-warning">{arr[1]}</span>);break;
                case 'Science' : label = (<span className="label label-warning">{arr[1]}</span>);break;
                case 'Social and human sciences' : label = (<span className="label label-success">{arr[1]}</span>);break;
                case 'Information and communication' : label = (<span className="label label-info">{arr[1]}</span>);break;
                case 'Politics, law and economics' : label = (<span className="label label-primary">{arr[1]}</span>);break;
                case 'Countries and country groupings' : label = (<span className="label label-default">{arr[1]}</span>);break;
                default : label = (<span className="label label-default">{arr[1]}</span>);break;
            }
        }
        return (
            <span>{arr[0]}&nbsp;{label}&nbsp;{scopeNote}</span>
        );
    }

    onSuggestionsFetchRequested(value) {
        this.loadSuggestions(value);
    }

    onSuggestionsClearRequested() {
        this.setState({
            suggestions: []
        });
    }

    onSuggestionsUpdateRequested(value) {
        this.loadSuggestions(value);
    }

    onChange(event, { newValue }) {
        this.setState({
            chosenValue: newValue,
            value: newValue
        });
    } /* ------------------- end of specific react-autosuggest functions ------------------- */

    render() {
        let classificationList = null;
        const classifications = this.state.data.map((c, index) => {
            let csClass = 'label label-success tag';
            if(c.vocabulary == 'DBpedia') {
                csClass = 'label label-danger tag';
            }
            return (
                <span key={'cl__' + index} className={csClass}>
                    {c.value}
                    <i className="glyphicon glyphicon-remove interactive"
                        onClick={this.removeClassification.bind(this, index)}>
                    </i>
                    <i className="glyphicon glyphicon-star-empty interactive"
                        onClick={this.toggleDefault.bind(this, index)}>
                    </i>
                    &nbsp;
                </span>
            )
        }, this);
        if(classifications.length > 0) {
            classificationList = (
                <div>
                    <h4>Added classifications</h4>
                    <div className="well">
                        {classifications}
                    </div>
                </div>
            )
        }

        const inputProps = {
            placeholder: "Search term",
            value: this.state.value,
            onChange: this.onChange.bind(this)
        };

        //generate the options from the config and add a default one
        const vocabularyOptions = this.props.config.vocabularies.map((v, index) => {
            return (
                <label className="radio-inline" key={index}>
                    <input
                        type="radio"
                        name="vocabularyOptions"
                        id={v}
                        value={v}
                        checked={v == this.state.vocabulary}
                        onChange={this.setVocabulary.bind(this)}/>
                        {v}
                </label>
            );
        }, this);
        vocabularyOptions.push(
            <label className="radio-inline" key={vocabularyOptions.length}>
                    <input
                        type="radio"
                        name="vocabularyOptions"
                        id="custom"
                        value="custom"
                        checked={this.state.vocabulary === 'custom'}
                        onChange={this.setVocabulary.bind(this)}/>
                        Custom (no external lookup)
            </label>
        );

        return (
            <div key={'form__classify'}>
                <br/>
                <div className="row">
                    <div className="col-md-12">
                        {classificationList}
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <form>
                            <div className="form-group">
                                <h4>Add classifications</h4>
                                <br/>
                                <div className="text-left">
                                    <label>Vocabulary:&nbsp;</label>
                                    {vocabularyOptions}
                                </div>
                                <br/>
                                <Autosuggest
                                    ref={this.props.config.type}
                                    suggestions={this.state.suggestions}
                                     onSuggestionsFetchRequested={this.onSuggestionsFetchRequested.bind(this)}
                                     onSuggestionsClearRequested={this.onSuggestionsClearRequested.bind(this)}
                                     getSuggestionValue={this.getSuggestionValue.bind(this)}
                                     renderSuggestion={this.renderSuggestion.bind(this)}
                                     inputProps={inputProps}
                                 />
                            </div>
                            <button className="btn btn-primary" onClick={this.addClassification.bind(this)}>Add</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

}

export default ClassifyingForm;
