import React from 'react';
import { Button, Header, Icon, Image, Modal, Form, Input, Select } from 'semantic-ui-react'
import { Router, Route, Link } from 'react-router-dom';
import { OutTable, ExcelRenderer } from 'react-excel-renderer';

import config from 'config';
import { userService, authenticationService } from '@/_services';
import { authHeader, handleResponse } from '@/_helpers';

class Student extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            users: null,
            students: null,
            isCRUDModalOpen: false,
            crudModalTitle: ""
        };
    }

    componentDidMount() {
        userService.getAll().then(users => this.setState({ users }));

        this.loadData();
    }

    loadData = () => {
        const id = this.props.match.params.id;

        const requestOptions = { method: 'GET', headers: authHeader() };
        fetch(`${config.apiUrl}/api/student/${id}`, requestOptions)
            .then(r => r.json().then(data => ({ status: r.status, body: data })))
            .then(obj => {
                console.log("Students: ", obj.body)
                this.setState({
                    students: obj.body
                })
            });
    }

    handleCRUDModal = (crudModalTitle) => {
        const { isCRUDModalOpen } = this.state;

        this.setState({ crudModalTitle })

        this.setState({ isCRUDModalOpen: !isCRUDModalOpen })
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

                    const students = new FormData();

                    // console.log("rows[1][0]: ", resp.rows[1][0])

                    // let cell = null;
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
                        students.append('students', object)
                    }

                    // students.append('students', result)
                    let newArray = result.filter(value => Object.keys(value).length !== 0);
                    console.log("result:", newArray)

                    const requestOptions = { 
                        method: 'POST', 
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                          }, 
                        body: JSON.stringify(newArray)};
                    fetch(`${config.apiUrl}/api/student/create`, requestOptions)
                    .then(() => this.handleCRUDModal(""))
                    .then(() => this.loadData())
                        // .then(r => r.json().then(data => ({ status: r.status, body: data })))
                        // .then(obj => {
                        //     console.log("Assignments: ", obj.body)
                            // this.setState({
                            //     assignments: obj.body
                            // })
                        // });
                });
            }
        });
    }

    addStudent = () => {
        console.log("Add")
    }

    editStudent = () => {
        console.log("Edit")
    }

    deleteStudent = () => {
        console.log("Delete")
    }

    render() {
        const { users, isCRUDModalOpen, crudModalTitle, students } = this.state;

        let tableData = null;

        if (students != null) {
            tableData = students.map(student =>
                <tr key={student.id}>
                    <td>{student.courseTitle}</td>
                    <td>{student.firstName + " " + student.lastName}</td>
                    <td>{student.email}</td>
                    <td>
                        {/* <Link to={"/assignments/" + student.id}><button className="ui brown button"><i className="book icon" style={{ margin: 0 }}></i></button></Link> */}
                        {/* <Link to={"/students/" + student.id}><button className="ui blue button"><i className="user icon" style={{ margin: 0 }}></i></button></Link> */}
                        <button className="ui yellow button" onClick={() => this.handleCRUDModal("Edit")}><i className="edit icon" style={{ margin: 0 }}></i></button>
                        <button className="ui red button" onClick={() => this.handleCRUDModal("Delete")}><i className="trash alternate icon" style={{ margin: 0 }}></i></button>
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
                        <tr><th>Course</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Action</th>
                        </tr></thead>
                    <tbody>
                        {tableData}
                    </tbody>
                </table>

                {/* CRUD Modal Start */}
                <Modal open={isCRUDModalOpen} onClose={() => this.handleCRUDModal("")} size="small" style={{ maxHeight: "300px", verticalAlign: "center", margin: "auto" }}>
                    <Modal.Header>{crudModalTitle}</Modal.Header>
                    <Modal.Content>
                        <Form>
                            <input type="file" onChange={(e) => this.onSelectColor(e)}></input>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        {crudModalTitle == "Add" ?
                            <Button primary onClick={() => this.addStudent()}>
                                {crudModalTitle} <Icon name='chevron right' />
                            </Button>
                            : crudModalTitle == "Edit" ?
                                <Button primary onClick={() => this.editStudent()}>
                                    {crudModalTitle} <Icon name='chevron right' />
                                </Button>
                                :
                                <Button primary onClick={() => this.deleteStudent()}>
                                    {crudModalTitle} <Icon name='chevron right' />
                                </Button>
                        }
                    </Modal.Actions>
                </Modal>
                {/* CRUD Modal End */}

            </div>
        );
    }
}

export { Student };