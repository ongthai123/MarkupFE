import React from 'react';

import { Button, Header, Icon, Image, Modal, Form, Input, Select } from 'semantic-ui-react'
import { Router, Route, Link } from 'react-router-dom';

import config from 'config';
import { userService, authenticationService } from '@/_services';
import { authHeader, handleResponse } from '@/_helpers';

class Assignment extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            users: null,
            assignments: null,
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
        fetch(`${config.apiUrl}/api/assignment/${id}`/*, requestOptions*/)
            .then(r => r.json().then(data => ({ status: r.status, body: data })))
            .then(obj => {
                console.log("Assignments: ", obj.body)
                this.setState({
                    assignments: obj.body
                })
            });
    }

    handleCRUDModal = (crudModalTitle) => {
        const { isCRUDModalOpen } = this.state;

        this.setState({ crudModalTitle })

        this.setState({ isCRUDModalOpen: !isCRUDModalOpen })
    }

    addAssignment = () => {
        console.log("Add")
    }

    editAssignment = () => {
        console.log("Edit")
    }

    deleteAssignment = () => {
        console.log("Delete")
    }

    render() {
        const { users, isCRUDModalOpen, crudModalTitle, assignments } = this.state;

        let tableData = null;

        if (assignments != null) {
            tableData = assignments.map(assignment =>
                <tr key={assignment.id}>
                    <td>{assignment.courseTitle}</td>
                    <td>{assignment.title}</td>
                    <td>
                        {/* <Link to={"/assignments/" + assignment.id}><button className="ui brown button"><i className="book icon" style={{ margin: 0 }}></i></button></Link> */}
                        {/* <Link to={"/assignments/" + assignment.id}><button className="ui blue button"><i className="user icon" style={{ margin: 0 }}></i></button></Link> */}
                        <Link to={"/submissions/" + assignment.id}><button className="ui pink button"><i className="user icon" style={{ margin: 0 }}></i></button></Link>
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
                    <div className="ten wide column"><h1>Assignment</h1></div>
                    <div className="six wide column">
                        <button className="ui inverted green button" style={{ float: "right" }} onClick={() => this.handleCRUDModal("Add")}>Add New</button>
                    </div>
                </div>
                <table className="ui selectable inverted table" style={{ textAlign: "center" }}>
                    <thead>
                        <tr><th>Course</th>
                            <th>Title</th>
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
                            <Form.Group widths='equal'>
                                <Form.Field
                                    id='form-input-control-first-name'
                                    control={Input}
                                    label='Title'
                                    placeholder='Title'
                                />
                                <Form.Field
                                    control={Select}
                                    options={lecturers}
                                    label={{ children: 'Lecturer', htmlFor: 'form-select-control-gender' }}
                                    placeholder='Lecturer'
                                    search
                                    searchInput={{ id: 'form-select-control-gender' }}
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        {crudModalTitle == "Add" ?
                            <Button primary onClick={() => this.addAssignment()}>
                                {crudModalTitle} <Icon name='chevron right' />
                            </Button>
                            : crudModalTitle == "Edit" ?
                                <Button primary onClick={() => this.editAssignment()}>
                                    {crudModalTitle} <Icon name='chevron right' />
                                </Button>
                                :
                                <Button primary onClick={() => this.deleteAssignment()}>
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

export { Assignment };