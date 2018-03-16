import React from 'react';
import FlexModal from './FlexModal';
import AppAnnotationStore from './../flux/AnnotationStore';
import AnnotationActions from './../flux/AnnotationActions';
import $ from 'jquery';

class LoginBox extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedAction: "login",
            username: "",
            password: "",
            warning: "",
            showLoginModal: false,
            user: null,
            loggedIn: false,
            loginButtonLabel: "login",
            loginMessage: "You are not logged in"
        }
    }
    componentDidMount() {
        AppAnnotationStore.bind('login-succeeded', this.doLogin.bind(this));
        AppAnnotationStore.bind('register-succeeded', this.doLogin.bind(this));
    }
    handleLogin() {
        if (!this.state.loggedIn) {
            this.setState({showLoginModal: true});
        }
        else {
            this.setState({
                user: null,
                loggedIn: false,
                loginButtonLabel: "login",
                loginMessage: "You are not logged in"
            });
            AnnotationActions.logoutUser();
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

    handlePasswordChange(e) {
        this.setState({password: e.target.value});
    }

    handleUsernameChange(e) {
        this.setState({username: e.target.value});
    }

    handleActionChange(e) {
        this.setState({selectedAction: e.target.value});
        console.log(e.target.value)
    }

    handleSubmit(e) {
        e.preventDefault();
        let userDetails = {
            username: this.state.username,
            password: this.state.password
        }
        console.log(userDetails);
        console.log(this.state.selectedAction);
        if (this.state.selectedAction === "register") {
            AnnotationActions.registerUser(userDetails);
        } else {
            AnnotationActions.loginUser(userDetails);
        }
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
                        <div className="authentication-action">
                            <label>
                                Login as existing user
                                <input
                                    type="radio"
                                    value="login"
                                    checked={this.state.selectedAction === "login"}
                                    onChange={this.handleActionChange.bind(this)}
                                />
                            </label>
                            <label>
                                Register as new user
                                <input
                                    type="radio"
                                    value="register"
                                    checked={this.state.selectedAction === "register"}
                                    onChange={this.handleActionChange.bind(this)}
                                />
                            </label>
                        </div>
                        <form className="loginForm" onSubmit={this.handleSubmit.bind(this)}>
                            <label>Username</label>
                            <input
                                type="text"
                                placeholder="username"
                                value={this.state.username}
                                onChange={this.handleUsernameChange.bind(this)}
                            />
                            &nbsp;
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="password"
                                value={this.state.password}
                                onChange={this.handlePasswordChange.bind(this)}
                            />
                            &nbsp;
                            <input className="btn btn-default" type="submit" value="Login" />
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
