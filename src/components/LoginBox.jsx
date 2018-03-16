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
            loginButtonLabel: "Login"
        }
    }

    componentDidMount() {
        AppAnnotationStore.bind('login-succeeded', this.loginSuccess.bind(this));
        AppAnnotationStore.bind('register-succeeded', this.loginSuccess.bind(this));
        AppAnnotationStore.bind('login-failed', this.loginFailed.bind(this));
        AppAnnotationStore.bind('register-failed', this.loginFailed.bind(this));
    }

    handleLogin() {
        if (!this.state.loggedIn) {
            this.setState({showLoginModal: true});
        } else {
            this.setState({
                user: null,
                loggedIn: false,
                loginButtonLabel: "Login"
            });
            AnnotationActions.logoutUser();
            localStorage.removeItem("userDetails");
        }
    }

    loginSuccess(userDetails) {
        this.setState({
            user: userDetails,
            loggedIn: true,
            loginButtonLabel: "Logout " + userDetails.username,
            warning: null
        });
        localStorage.setItem("userDetails", JSON.stringify(userDetails));
        this.hideLoginForm();
    }

    loginFailed(error) {
        this.setState({
            warning: error.message
        });
    }

    showLoginForm() {
        this.setState({showLoginModal: true});
    }

    hideLoginForm() {
        $('#login__modal').modal('hide');//TODO ugly, but without this the static backdrop won't disappear!
        this.setState({showLoginModal: false});
    }

    handlePasswordChange(e) {
        this.setState({password: e.target.value});
    }

    handleUsernameChange(e) {
        this.setState({username: e.target.value});
    }

    handleActionChange(e) {
        this.setState({selectedAction: e.target.value});
    }

    handleSubmit(e) {
        e.preventDefault();
        let userDetails = {
            username: this.state.username,
            password: this.state.password
        }
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
                {this.showModal ?
                    <FlexModal
                        elementId="login__modal"
                        handleHideModal={this.hideLoginForm.bind(this)}
                        title="Login or Register">
                        <div className="container-fluid">
                            <p className="row">
                                <div className="col-12 text-right">
                                    <div className="btn-group btn-group-toggle">
                                        <label className={this.state.selectedAction === "login" ? "btn btn-primary active" : "btn btn-primary"}>
                                            <input type="radio" value="login"
                                                checked={this.state.selectedAction === "login"}
                                                onChange={this.handleActionChange.bind(this)}
                                            /> Login
                                        </label>
                                        <label className={this.state.selectedAction === "register" ? "btn btn-primary active" : "btn btn-primary"}>
                                            <input type="radio" value="register"
                                                checked={this.state.selectedAction === "register"}
                                                onChange={this.handleActionChange.bind(this)}
                                            /> Register
                                        </label>
                                    </div>
                                </div>
                            </p>
                            <form className="loginForm" onSubmit={this.handleSubmit.bind(this)}>
                                <div className="row">
                                    <div className="col-6">
                                        <label for="loginBoxUsername">Username</label>
                                        <input
                                            id="loginBoxUsername"
                                            type="text"
                                            placeholder="username"
                                            value={this.state.username}
                                            onChange={this.handleUsernameChange.bind(this)}
                                            className={this.state.warning ? "form-control is-invalid" : "form-control"}
                                        />
                                        <div className="invalid-feedback">{this.state.warning}</div>
                                    </div>
                                    <div className="col-6">
                                        <label for="loginBoxPassword">Password</label>
                                        <input
                                            id="loginBoxPassword"
                                            type="password"
                                            placeholder="password"
                                            value={this.state.password}
                                            onChange={this.handlePasswordChange.bind(this)}
                                            className={this.state.warning ? "form-control is-invalid" : "form-control"}
                                        />
                                        <div className="invalid-feedback">{this.state.warning}</div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12">
                                        <p className="text-right">
                                            <input
                                                type="submit"
                                                className="btn btn-primary"
                                                value={this.state.selectedAction === "login" ? "Login" : "Register"}
                                            />
                                        </p>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </FlexModal>: null
                }
            </div>
        );
    }
}

export default LoginBox;
