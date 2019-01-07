import Autosuggest from 'react-autosuggest'; //See: https://github.com/moroshko/react-autosuggest
import AnnotationActions from '../../flux/AnnotationActions';
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
        // not yet implemented
        //AnnotationActions.toggleDefault(cs[index]);
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
        }
        if (this.props.services[this.state.vocabulary].addWildcard) {
            value = value + "*";
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
                console.log("results:", data.results);
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
        let entry = AnnotationActions.parseVocabularySuggestion(suggestion, this.state.vocabulary);
        return entry.value;
    }

    //TODO the rendering should be adapted for different vocabularies
    renderSuggestion(suggestion) {
        let entry = AnnotationActions.parseVocabularySuggestion(suggestion, this.state.vocabulary);
        return (
            <span>{entry.value}&nbsp;
                <span className={entry.label.className}>
                    {entry.label.value}
                </span>
                &nbsp;{entry.scopeNote}
            </span>
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
            let csClass = 'badge badge-success tag';
            if(c.vocabulary == 'DBpedia') {
                csClass = 'badge badge-danger tag';
            }
            return (
                <span key={'cl__' + index} className={csClass}>
                    {c.value}
                    &nbsp;
                    <i className="badge badge-light"
                        onClick={this.removeClassification.bind(this, index)}>
                        x
                    </i>
                    &nbsp;
                    <i className="badge badge-light"
                        onClick={this.toggleDefault.bind(this, index)}>
                        o
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
                <label className="vocabulary-option radio-inline" key={index}>
                    <input
                        type="radio"
                        name="vocabularyOptions"
                        id={v}
                        value={v}
                        checked={v == this.state.vocabulary}
                        onChange={this.setVocabulary.bind(this)}/>
                        {' ' + v}
                </label>
            );
        }, this);
        vocabularyOptions.push(
            <label className="vocabulary-option radio-inline" key={vocabularyOptions.length}>
                    <input
                        type="radio"
                        name="vocabularyOptions"
                        id="custom"
                        value="custom"
                        checked={this.state.vocabulary === 'custom'}
                        onChange={this.setVocabulary.bind(this)}/>
                        {' '}Custom (no external lookup)
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
