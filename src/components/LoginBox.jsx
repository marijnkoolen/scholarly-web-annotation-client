import React from 'react';
import FlexModal from './FlexModal';
import AppAnnotationStore from './../flux/AnnotationStore';
import AnnotationActions from './../flux/AnnotationActions';

class LoginBox extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: "",
            warning: "",
            showLoginModal: false,
            user: null,
            loggedIn: false,
            loginButtonLabel: "login",
            loginMessage: "You are not logged in"
        }
    }
    componentDidMount() {
        AppAnnotationStore.bind('login-user', this.doLogin.bind(this));
        if (localStorage.userDetails) {
            AnnotationActions.login(JSON.parse(localStorage.userDetails));
        }
    }
    handleLogin() {
        if (!this.state.loggedIn) {
            this.setState({showLoginModal: true});
        }
        else {
            console.log("logging out");
            this.setState({
                user: null,
                loggedIn: false,
                loginButtonLabel: "login",
                loginMessage: "You are not logged in"
            });
            AnnotationActions.logout();
            localStorage.removeItem("userDetails");
        }
    }
    showLoginForm() {
        this.setState({showLoginModal: true});
    }
    hideLoginForm() {
        $('#login__modal').modal('hide');//TODO ugly, but without this the static backdrop won't disappear!
        this.setState({showLoginModal: false});
    }
    doLogin(userDetails) {
        this.setState({
            user: userDetails,
            loggedIn: true,
            loginButtonLabel: "logout",
            loginMessage: "You are logged in as " + userDetails.username
        });
        localStorage.setItem("userDetails", JSON.stringify(userDetails));
        if (userDetails.username) {
            this.hideLoginForm();
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
        this.showModal = this.state.showLoginModal;
        return (
            <div>
                <button className="btn btn-default"
                    onClick={this.handleLogin.bind(this)}>
                    {this.state.loginButtonLabel}
                </button>
                &nbsp;
                <span>{this.state.loginMessage}</span>
                {this.showModal ?
                    <FlexModal
                        elementId="login__modal"
                        handleHideModal={this.hideLoginForm.bind(this)}
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

