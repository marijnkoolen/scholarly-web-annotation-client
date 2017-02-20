import React from 'react';
import FlexModal from './FlexModal';
import AppAnnotationStore from './../flux/AnnotationStore';
import AnnotationActions from './../flux/AnnotationActions';

class LoginBox extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: "",
            warning: ""
        }
    }
    componentDidMount() {
        AppAnnotationStore.bind('login-user', this.onLogin.bind(this));
    }

    onLogin(userDetails) {
        if (userDetails.username) {
            $('#login__modal').modal('hide');//TODO ugly, but without this the static backdrop won't disappear!
            if(this.props.login) {
                this.props.login(userDetails);
            }
        }
        else if (userDetails.error){
            this.setState({
                warning: userDetails.error
            });
        }
    }

    handleUsernameChange(e) {
        this.setState({username: e.target.value})
    }

    handleSubmit(e) {
        e.preventDefault();
        let userDetails = {
            username: this.state.username
        }
        AnnotationActions.login(userDetails);
    }

    render() {
        return (
            <div>
                {this.props.showModal ?
                    <FlexModal
                        elementId="login__modal"
                        handleHideModal={this.props.hideLoginForm.bind(this)}
                        title="User Login">
                        <form className="loginForm" onSubmit={this.handleSubmit.bind(this)}>
                            <label>Username</label>
                            <input
                                type="text"
                                placeholder="username"
                                value={this.state.username}
                                onChange={this.handleUsernameChange.bind(this)}
                            />
                            &nbsp;
                            <input type="submit" value="Login" />
                            <span className="label label-danger">
                                {this.state.warning}
                            </span>
                        </form>
                    </FlexModal>: null
                }
            </div>
        );
    }
}

export default LoginBox;

