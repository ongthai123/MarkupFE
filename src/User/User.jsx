import React from 'react';

import { Button, Header, Icon, Image, Modal, Form, Input, Select, Confirm, Pagination } from 'semantic-ui-react'
import { Router, Route, Link } from 'react-router-dom';
import { OutTable, ExcelRenderer } from 'react-excel-renderer';

import config from 'config';
import { userService, authenticationService } from '@/_services';
import { authHeader, handleResponse } from '@/_helpers';

class User extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            users: null,
            isCRUDModalOpen: false,
            crudModalTitle: "",
            openConfirm: false,
            pageSize: 10,
            length: 0,
            activePage: 1
        };
    }

    componentDidMount() {
        // userService.getAll().then(users => this.setState({ users }, () => console.log("Users: ", this.state.users)));

        this.loadData();
    }

    loadData = () => {
        const { activePage, pageSize } = this.state;

        let formData = new FormData();
        formData.append('activePage', activePage)
        formData.append('pageSize', pageSize)

        const requestOptions = { method: 'POST', headers: authHeader(), body: formData };
        fetch(`${config.apiUrl}/api/users`, requestOptions)
            .then(r => r.json().then(data => ({ status: r.status, body: data })))
            .then(obj => {
                console.log("Users: ", obj.body)
                this.setState({
                    users: obj.body.users,
                    length: obj.body.length
                })
            });


    }

    onPageChange = (e, data) => {
        this.setState({
            activePage: Math.ceil(data.activePage)
        }, () => this.loadData())
    }

    handleCRUDModal = (crudModalTitle, userData) => {
        const { isCRUDModalOpen } = this.state;

        this.setState({ crudModalTitle })

        this.setState({ isCRUDModalOpen: !isCRUDModalOpen, userData })
    }

    onSelectColor = (event) => {

        let fileObj = event.target.files[0];

        //just pass the fileObj as parameter
        ExcelRenderer(fileObj, (err, resp) => {
            if (err) {
                console.log(err);
            }
            else {
                this.setState({
                    cols: resp.cols,
                    rows: resp.rows
                }, () => {
                    console.log("cols: ", resp.cols)
                    console.log("rows: ", resp.rows)

                    const id = this.props.match.params.id;

                    const result = [];
                    for (let i = 1; i < resp.rows.length; i++) {
                        let object = {};
                        for (let j = 0; j < resp.cols.length; j++) {
                            console.log(resp.rows[i][j])
                            if (resp.rows[i][j] == undefined) {
                                break;
                            }
                            else {
                                object[resp.rows[0][j]] = resp.rows[i][j]
                            }
                        }
                        result.push(object);
                    }

                    let newArray = result.filter(value => Object.keys(value).length !== 0);
                    console.log("result:", newArray)

                    const requestOptions = {
                        method: 'POST',
                        headers: {
                            ...authHeader(), ...{
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            }
                        },
                        body: JSON.stringify(newArray)
                    };
                    fetch(`${config.apiUrl}/api/users/create`, requestOptions)
                        .then(() => this.handleCRUDModal(""))
                });
            }
        });
    }

    addUser = () => {
        console.log("Add")
    }

    handleField = (field, e) => {
        // console.log(field)
        // console.log(e.target.value)

        this.setState({
            [field]: e.target.value
        })
    }

    handleSelect = (event, data) => {

        let selectValue = event.target.textContent;
        // console.log(selectValue);

        this.setState({ selectValue })
    }

    editUser = () => {
        const {selectValue, firstName, lastName, email, userData} = this.state;

        let formData = new FormData();
        formData.append('firstName', firstName)
        formData.append('lastName', lastName)
        formData.append('email', email)
        formData.append('role', selectValue)
        formData.append('userId', userData.id)

        const requestOptions = {
            method: 'POST',
            headers: authHeader(),
            body: formData
        };

        fetch(`${config.apiUrl}/api/users/edit`, requestOptions)
        .then(() => this.handleCRUDModal(""))
        .then(() => this.loadData())

        this.setState({
            firstName: "undefined",
            lastName: "undefined",
            email: "undefined"
        })
    }

    handleConfirm = (id) => {
        const { openConfirm } = this.state;

        this.setState({
            openConfirm: !openConfirm,
            deleteId: id
        })
    }

    delete = () => {

        let formData = new FormData();
        formData.append('id', this.state.deleteId)

        const requestOptions = {
            method: 'POST',
            headers: authHeader(),
            body: formData
        };
        fetch(`${config.apiUrl}/api/users/delete`, requestOptions)
            .then(() => this.loadData())
            .then(() => this.handleConfirm())
    }

    render() {
        const { users, isCRUDModalOpen, crudModalTitle, openConfirm, activePage, length, pageSize } = this.state;

        let roles = []

        let obj = {}
        obj['key'] = "Admin";
        obj['text'] = "Admin";
        obj['value'] = "Admin";

        roles.push(obj);

        let obj2 = {}
        obj2['key'] = "User";
        obj2['text'] = "User";
        obj2['value'] = "User";

        roles.push(obj2);

        let tableData = null;

        if (users != null) {
            tableData = users.map(user =>
                <tr key={user.id}>
                    <td>{user.firstName + " " + user.lastName}</td>
                    <td>{user.role}</td>
                    <td>{user.email}</td>
                    <td>
                        <button className="ui yellow button" onClick={() => this.handleCRUDModal("Edit", user)}><i className="edit icon" style={{ margin: 0 }}></i></button>
                        <button className="ui red button" onClick={() => { this.handleConfirm(user.id) }}><i className="trash alternate icon" style={{ margin: 0 }}></i></button>
                    </td>
                </tr>
            )
        }

        return (
            <div>
                <div className="ui grid">
                    <div className="ten wide column"><h1>User</h1></div>
                    <div className="six wide column">
                        <button className="ui inverted green button" style={{ float: "right" }} onClick={() => this.handleCRUDModal("Add")}>Add New</button>
                    </div>
                </div>
                <table className="ui selectable inverted table" style={{ textAlign: "center" }}>
                    <thead>
                        <tr><th>Name</th>
                            <th>Role</th>
                            <th>Email</th>
                            <th>Action</th>
                        </tr></thead>
                    <tbody>
                        {tableData}
                    </tbody>
                </table>
                <Pagination defaultActivePage={1} totalPages={(length / pageSize)} onPageChange={this.onPageChange} />

                {/* CRUD Modal Start */}
                <Modal open={isCRUDModalOpen} onClose={() => this.handleCRUDModal("")} size="small" style={{ height: "30%", verticalAlign: "center", margin: "auto" }}>
                    <Modal.Header>{crudModalTitle}</Modal.Header>
                    <Modal.Content>
                        {crudModalTitle == "Add" ?
                            <Form>
                                <input type="file" onChange={(e) => this.onSelectColor(e)}></input>
                            </Form>
                            :
                            <Form>
                                <Form.Group widths='equal'>
                                    <Form.Field label='FirstName' control='input' onChange={e => this.handleField("firstName", e)} />
                                    <Form.Field label='LastName' control='input' onChange={e => this.handleField("lastName", e)} />
                                </Form.Group>
                                <Form.Group widths="equal">
                                    <Form.Field label='Email' control='input' onChange={e => this.handleField("email", e)} />
                                    <Form.Field
                                        control={Select}
                                        options={roles}
                                        label="Role"
                                        placeholder='Role'
                                        onChange={this.handleSelect}
                                    />
                                </Form.Group>
                            </Form>
                        }
                    </Modal.Content>
                    <Modal.Actions>
                        {crudModalTitle == "Add" ?
                            <Button primary onClick={() => this.addUser()}>
                                {crudModalTitle} <Icon name='chevron right' />
                            </Button>
                            : crudModalTitle == "Edit" ?
                                <Button primary onClick={() => this.editUser()}>
                                    {crudModalTitle} <Icon name='chevron right' />
                                </Button>
                                :
                                null
                                // <Button primary onClick={() => this.deleteUser()}>
                                //     {crudModalTitle} <Icon name='chevron right' />
                                // </Button>
                        }
                    </Modal.Actions>
                </Modal>
                {/* CRUD Modal End */}

                <Confirm
                    open={openConfirm}
                    onCancel={this.handleConfirm}
                    onConfirm={this.delete}
                    size='tiny'
                    content='Do you want to DELETE this?'
                    style={{ maxHeight: "200px", verticalAlign: "center", margin: "auto" }}
                />

            </div>
        );
    }
}

export { User };