/*
Input:
    - list of links (props.data)
    - a annotation config (props.config)
    - onOutput (what to do after adding/removing a link) --> should be changed to Flux?

Output/emits:
    - a list of links
*/

import React from 'react';

class LinkingForm extends React.Component {

    constructor(props) {
        super(props);
        var api = this.props.config.apis ? this.props.config.apis[0].name : null;
        this.state = {
            data: this.props.data ? this.props.data : [],
            api : api,
            results : []
        }
    }

    /* ------------------- CRUD / loading of links ------------------- */

    setAPI(event) {
        this.setState({api : event.target.value});
    }

    //TODO make sure that at least one common property is present in the linkData (when hooking up different APIs)
    addLink(linkData) {
        var annotations = this.state.data;
        if(annotations && linkData) {
            var annotation = {
                purpose : "linking",
                type : "Linking",
                value : linkData
            }
            annotations.push(annottion);
            this.setState({data : annotations}, this.onOutput.bind(this));
        }
    }

    removeLink(index) {
        var annotations = this.state.data;
        if(annotations) {
            annotations.splice(index, 1);
            this.setState({data : annotations}, this.onOutput.bind(this));
        }
    }

    onOutput() {
        if(this.props.onOutput) {
            this.props.onOutput('links', this.state.data);
        }
    }

    search(event) {
        event.preventDefault();
        let url = '/link/'+this.state.api+'/search?q=' + this.refs.search.value;
        fetch(url, {
            method: "GET",
            cache: 'no-cache',
            mode: 'cors'
        }).then(function(response) {
            this.onSearch(response.json());
        }.bind(this)).catch(function(err) {
            console.error(url, err.toString());
        });
    }

    onSearch(data) {
        this.setState({results : data});
    }

    render() {
        let linkList = null;
        let links = null;
        if(this.state.data) {
            links = this.state.data.map((link, index) => {
                return (
                    <li key={'com__' + index} className="list-group-item">
                        <i className="glyphicon glyphicon-remove interactive" onClick={this.removeLink.bind(this, index)}></i>
                        &nbsp;
                        {link.label}
                    </li>
                )
            }, this);
            if(links.length > 0) {
                linkList = (
                    <div>
                        <h4>Added links</h4>
                        <ul className="list-group">
                            {links}
                        </ul>
                    </div>
                )
            }
        }

        //generate the options from the config and add a default one
        const apiOptions = this.props.config.apis.map((api, index) => {
            return (
                <label className="radio-inline" key={index}>
                    <input
                        type="radio"
                        name="apiOptions"
                        id={api.name}
                        value={api.name}
                        checked={api.name == this.state.api}
                        onChange={this.setAPI.bind(this)}/>
                        {api.name}
                </label>
            );
        }, this);

        const results = this.state.results.map((res, index) => {
            let poster = '';
            if(res.poster) {
                poster = (<img src={res.poster} style={{maxWidth:'100px'}}/>);
            }
            return(
                <tr key={'result__' + index} onDoubleClick={this.addLink.bind(this, res)}>
                    <td>{poster}</td>
                    <td><label className="media-heading">{res.label ? res.label : res.title}</label></td>
                    <td>{res.description}</td>
                </tr>
            )
        }, this)

        return (
            <div key={'form__link'}>
                <br/>
                <div className="row">
                    <div className="col-md-12">
                        {linkList}
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <form>
                            <div className="form-group">
                                <h4>Add links</h4>
                                <br/>
                                <div className="text-left">
                                    <label>API:&nbsp;</label>
                                    {apiOptions}
                                </div>
                                <br/>
                                <input type="text" ref="search" className="form-control"/>
                            </div>

                            <button className="btn btn-primary" onClick={this.search.bind(this)}>Search</button>
                        </form>

                        {this.state.results.length > 0 ?
                            <div>
                                <h4>Gevonden resultaten <small>Dubbelklik een gevonden resultaat om deze toe te voegen</small></h4>
                                <div className="well"
                                    style={
                                        {
                                            height: '400px',
                                            overflow: 'auto'
                                        }}>
                                    <table className="table table-bordered">
                                        <tbody>
                                            {results}
                                        </tbody>
                                    </table>
                                </div>
                            </div>: null}
                    </div>
                </div>
            </div>
        );
    }

}

export default LinkingForm;
