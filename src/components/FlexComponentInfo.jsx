import React from 'react';

class FlexComponentInfo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            componentConfig : null
        }
    }

    toList(list) {
        if(!list || typeof list != 'object') {
            return '';
        }
        return list.join('; ');
    }

    //TODO extend this to something more elaborate that also includes the component config
    render() {
        let childrenWithProps = null;
        if(this.props.config) {//this.state.componentConfig
            let config = {
                key : "testbox",
                blockId : "labs-catalogue-aggr",
                //searchAPI: _config.SEARCH_API_BASE,
                indexPath: '/search/labs-catalogue-aggr',
                prefixQueryFields: this.props.config.getSearchableFields(),
                dateFields: this.props.config.getDateFields(),
                facets: this.props.config.getFacets(),
            }
            childrenWithProps = React.Children.map(this.props.children,
                (child) => React.cloneElement(child, config)//this.state.componentConfig
            );
        }
        return (
            <div>
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <h3 className="panel-title">{this.props.title}</h3>
                    </div>
                    <div className="panel-body">
                        <div className="row">
                            <div className="col-md-12">
                                {this.props.description}
                            </div>
                        </div>
                        <br/>
                        <div className="row">
                            <div className="col-md-10">
                                <table className="table table-striped">
                                    <tbody>
                                    <tr>
                                        <th scope="row">Composed based on these components: </th>
                                        <td>{this.toList(this.props.consistsOf) || '-'}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Required input:</th>
                                        <td>{this.props.input || '-'}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Generates output:</th>
                                        <td>{this.props.output || '-'}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Components that generate the required input: </th>
                                        <td>{this.toList(this.props.inputComponents) || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Components that support the generated output: </th>
                                        <td>{this.toList(this.props.outputComponents) || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Current input:</th>
                                        <td>{this.toList(this.props.currentInput) || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Current configuration:</th>
                                        <td>{this.toList(this.props.config) || 'N/A'}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <br/>
                        <div className="row">
                            <div className="col-md-10">

                            </div>
                        </div>
                    </div>
                </div>
                {childrenWithProps ? childrenWithProps : this.props.children}
            </div>
        )
    }
}

export default FlexComponentInfo;
