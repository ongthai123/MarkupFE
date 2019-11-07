import React from 'react';
import { Button, Header, Icon, Image, Modal, Form, Input, Select, Confirm, Message } from 'semantic-ui-react'
import { Router, Route, Link } from 'react-router-dom';
import { OutTable, ExcelRenderer } from 'react-excel-renderer';

import config from 'config';
import { userService, authenticationService } from '@/_services';
import { authHeader, handleResponse, history, Role } from '@/_helpers';
class Student extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: authenticationService.currentUserValue,
            users: null,
            students: null,
            isCRUDModalOpen: false,
            crudModalTitle: "",
            openConfirm: false,
        };
    }

    componentDidMount() {
        // userService.getAll().then(users => this.setState({ users }));
        const { currentUser } = this.state;
        userService.getById(currentUser.id).then(userFromApi => this.setState({ userFromApi }));

        this.loadData();
    }

    loadData = () => {
        const id = this.props.match.params.id;

        const requestOptions = { method: 'GET', headers: authHeader() };
        fetch(`${config.apiUrl}/api/student/${id}`, requestOptions)
            .then(r => r.json().then(data => ({ status: r.status, body: data })))
            .then(obj => {
                // console.log("Students: ", obj.body)
                this.setState({
                    students: obj.body
                })
            });
    }

    handleCRUDModal = (crudModalTitle, studentData) => {
        const { isCRUDModalOpen } = this.state;

        this.setState({ crudModalTitle })

        this.setState({ isCRUDModalOpen: !isCRUDModalOpen, studentData })
    }

    handleField = (field, e) => {
        // console.log(field)
        // console.log(e.target.value)

        this.setState({
            [field]: e.target.value
        })
    }

    editStudent = () => {
        const { selectValue, firstName, lastName, email, studentData } = this.state;

        let formData = new FormData();
        formData.append('firstName', firstName)
        formData.append('lastName', lastName)
        formData.append('email', email)
        // formData.append('role', selectValue)
        formData.append('studentId', studentData.id)

        const requestOptions = {
            mode: 'cors',
            method: 'POST',
            headers: authHeader(),
            body: formData
        };

        fetch(`${config.apiUrl}/api/student/edit`, requestOptions)
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

        const formData = new FormData();
        formData.append('id', this.state.deleteId)

        fetch(`${config.apiUrl}/api/student/delete`, {
            mode: 'cors',
            headers: authHeader(),
            method: 'POST',
            body: formData,
        })
            .then((response => this.loadData()))
            .then(() => this.handleConfirm())
    }

    onSelectColor = (event) => {
        const id = this.props.match.params.id;
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
                    // console.log("cols: ", resp.cols)
                    // console.log("rows: ", resp.rows)

                    const id = this.props.match.params.id;

                    const students = new FormData();

                    // let cell = null;
                    const result = [];
                    for (let i = 1; i < resp.rows.length; i++) {
                        let object = {};
                        for (let j = 0; j < resp.cols.length; j++) {
                            // console.log(resp.rows[i][j])
                            if (resp.rows[i][j] == undefined) {
                                break;
                            }
                            else {
                                object[resp.rows[0][j]] = resp.rows[i][j]
                            }
                        }
                        result.push(object);
                        students.append('students', object)
                    }

                    let newArray = result.filter(value => Object.keys(value).length !== 0);
                    // console.log("result:", newArray)

                    let formData = new FormData();

                    for (var i = 0; i < newArray.length; i++) {
                        formData.append("Students[" + i + "].StudentId", newArray[i].StudentId)
                        formData.append("Students[" + i + "].FirstName", newArray[i].FirstName)
                        formData.append("Students[" + i + "].LastName", newArray[i].LastName)
                        formData.append("Students[" + i + "].Email", newArray[i].Email)
                    }
                    formData.append('courseId', id)

                    const requestOptions = {
                        mode: 'cors',
                        method: 'POST',
                        headers: authHeader(),
                        body: formData
                    };
                    fetch(`${config.apiUrl}/api/student/create`, requestOptions)
                        .then(() => this.handleCRUDModal(""))
                        .then(() => this.loadData())
                });
            }
        });
    }

    render() {
        const { currentUser, users, isCRUDModalOpen, crudModalTitle, students, openConfirm } = this.state;

        let tableData = null;

        if (students != null) {
            tableData = students.map(student =>
                <tr key={student.id}>
                    <td>{student.courseTitle}</td>
                    <td>{student.studentId}</td>
                    <td>{student.firstName + " " + student.lastName}</td>
                    <td>{student.email}</td>
                    <td>
                        <button className="ui yellow button" onClick={() => this.handleCRUDModal("Edit", student)}><i className="edit icon" style={{ margin: 0 }}></i></button>
                        <button className="ui red button" onClick={() => this.handleConfirm(student.id)}><i className="trash alternate icon" style={{ margin: 0 }}></i></button>
                    </td>
                </tr>
            )
        }

        const lecturers = [
            { key: 1, text: 'Lecturer 69', value: 113 },
            { key: 2, text: 'Lecturer 96', value: 246 },
            { key: 3, text: 'Lecturer ABC', value: 357 },
        ]

        return (
            <div>
                <div className="ui grid">
                    <div className="ten wide column"><h1>Student</h1></div>
                    <div className="six wide column">
                        <button className="ui inverted green button" style={{ float: "right" }} onClick={() => this.handleCRUDModal("Add")}>Add New</button>
                    </div>
                </div>
                <table className="ui selectable inverted table" style={{ textAlign: "center" }}>
                    <thead>
                        <tr>
                            <th>Course</th>
                            <th>StudentId</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData}
                    </tbody>
                </table>

                {/* CRUD Modal Start */}
                <Modal open={isCRUDModalOpen} onClose={() => this.handleCRUDModal("")} size="small" style={{ maxHeight: "600px", verticalAlign: "center", margin: "auto" }}>
                    <Modal.Header>{crudModalTitle}</Modal.Header>
                    <Modal.Content>
                        {crudModalTitle == "Add" ?
                            <Form>
                                <div>
                                    <input type="file" onChange={(e) => this.onSelectColor(e)}></input>
                                    Please follow this example:
                                </div>
                                <div>
                                    <img src="https://i.imgur.com/5gC3AyJ.png" height="400" width="500" />
                                </div>
                            </Form>
                            :
                            <Form>
                                <Form.Group widths='equal'>
                                    <Form.Field label='FirstName' control='input' onChange={e => this.handleField("firstName", e)} />
                                    <Form.Field label='LastName' control='input' onChange={e => this.handleField("lastName", e)} />
                                </Form.Group>
                                <Form.Group widths="equal">
                                    <Form.Field label='Email' control='input' onChange={e => this.handleField("email", e)} />
                                </Form.Group>
                                <Message
                                    error
                                    header='Action Forbidden'
                                    content='You can only sign up for an account once with a given e-mail address.'
                                />
                            </Form>
                        }
                    </Modal.Content>
                    <Modal.Actions>
                        {crudModalTitle == "Add" ?
                            null
                            : crudModalTitle == "Edit" ?
                                <Button primary onClick={() => this.editStudent()}>
                                    {crudModalTitle} <Icon name='chevron right' />
                                </Button>
                                :
                                null
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

export { Student };