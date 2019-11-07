import React from 'react';
import { Button, Header, Icon, Image, Modal, Form, Input, Select, Confirm, Message } from 'semantic-ui-react'
import { userService, authenticationService } from '@/_services';

import config from 'config';
import { authHeader, handleResponse, history, Role } from '@/_helpers';

class HomePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: authenticationService.currentUserValue,
            userFromApi: null,
            errorPopup: false,
            errorMessage: null,
            form: {
                password: null,
                confirmPassword: null
            }
        };
    }

    componentDidMount() {
        const { currentUser } = this.state;
        userService.getById(currentUser.id).then(userFromApi => this.setState({ userFromApi }));
    }

    onChangeField = (e, key) => {
        let data = e.target.value;
        let form = this.state.form;
        form[key] = data

        this.setState({ form })
    }

    changePassword = () => {
        const { currentUser } = this.state;

        let password = this.state.form.password;
        let confirmPassword = this.state.form.confirmPassword

        if (password == null || confirmPassword == null) {
            this.setState({ errorPopup: true, errorMessage: "Please fill in the form" })
        }
        else if (password != confirmPassword) {
            this.setState({ errorPopup: true, errorMessage: "Confirm password does not match" })
        }
        else {
            let formData = new FormData();
            formData.append('userId', currentUser.id);
            formData.append('password', password);
            formData.append('confirmPassword', confirmPassword)

            const requestOptions = {mode: 'cors', method: 'POST', headers: authHeader(), body: formData };
            fetch(`${config.apiUrl}/api/users/changepassword`, requestOptions)
                .then(() => alert("Changes has been made!"))
        }
    }

    render() {
        const { currentUser, userFromApi } = this.state;
        return (
            <div>
                <h2>Account Profile</h2>
                <div>
                    You're logged in as:
                    {userFromApi &&
                        <ul>
                            <li>Name: {userFromApi.firstName} {userFromApi.lastName}</li>
                            <li>Role: {userFromApi.role}</li>
                            <li>Name: {userFromApi.email}</li>
                        </ul>
                    }
                    <p>Change password: </p>
                    <Form>
                        <Form.Input label="Password" placeholder='Password' style={{ width: "300px" }} type="password" onChange={(e) => this.onChangeField(e, "password")} />
                        <Form.Input label="Confirm Password" placeholder='Confirm Password' style={{ width: "300px" }} type="password" onChange={(e) => this.onChangeField(e, "confirmPassword")} />
                        <Message
                            visible={this.state.errorPopup}
                            error
                            header={this.state.errorMessage}
                        />
                        <Button type='submit' onClick={this.changePassword}>Submit</Button>
                    </Form>

                </div>
            </div>
        );
    }
}

export { HomePage };