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
            currentUser: authenticationService.currentUserValue,
            users: null,
            assignments: null,
            isCRUDModalOpen: false,
            crudModalTitle: "",
            inputValue: ""
        };
    }

    componentDidMount() {
        // userService.getAll().then(users => this.setState({ users }));

        this.loadData();
    }

    loadData = () => {
        const id = this.props.match.params.id;

        const requestOptions = { method: 'GET', headers: authHeader() };
        fetch(`${config.apiUrl}/api/assignment/${id}`, requestOptions)
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

    onSelectHandler = (event, data) => {

        let selectValue = event.target.textContent;
        // console.log(selectValue);
        const { key } = data.options.find(o => o.text === selectValue);

        this.setState({ selectValue, key })
        // console.log("Key: ", key)

    }

    onInputHandler = (e) => {
        let inputValue = e.target.value
        this.setState({ inputValue })
        // console.log("inputValue: ", inputValue)
    }

    onFileHandler = (e, type) => {

        console.log("E: ", e.target.files)
        console.log("type: ", type)

        let files = [];

        Array.from(e.target.files).forEach(file => {
            files.push(file)
        });

        if (type == "assignment") {
            this.setState({ assignmentFiles: files })
        }
        else if (type == "criteria") {
            this.setState({ criteriaFiles: files })
        }

    }

    addAssignment = () => {
        const { currentUser, inputValue, assignmentFiles, criteriaFiles } = this.state
        const id = this.props.match.params.id;

        let formData = new FormData();

        formData.append('userId', currentUser.id)
        formData.append('courseId', id)
        formData.append('title', inputValue)

        for (const file of assignmentFiles) {
            formData.append('AssignmentFiles', file);

        }

        for (const file of criteriaFiles) {
            formData.append('CriteriaFiles', file);
        }

        const requestOptions = {
            headers: authHeader(),
            method: 'POST',
            body: formData

        };
        fetch(`${config.apiUrl}/api/assignment/create`, requestOptions)
            .then(() => this.handleCRUDModal(""))
            .then(() => this.loadData())
    }

    previewFile = (assignment, type) => {
        console.log(assignment)
        console.log(type)

        fetch(`${config.apiUrl}/api/assignment/${type}/${assignment.id}`, {
            headers: authHeader(),
            method: 'GET',
        })
            .then(r => {
                console.log("assignment: ", r)
            });
        this.setState({
            apiUrl: `${config.apiUrl}/api/assignment/`+ type + "/" + assignment.id
        })
    }

    editAssignment = () => {
        console.log("Edit")
    }

    deleteAssignment = () => {
        console.log("Delete")
    }

    render() {
        const { users, isCRUDModalOpen, crudModalTitle, assignments, criterias } = this.state;

        let tableData = null;

        if (assignments != null) {
            tableData = assignments.map(assignment =>
                <tr key={assignment.id}>
                    <td>{assignment.courseTitle}</td>
                    <td>{assignment.title}</td>
                    <td>
                        <Link to={"/submissions/" + assignment.id}><button className="ui pink button"><i className="user icon" style={{ margin: 0 }}></i></button></Link>
                        <a href={this.state.apiUrl} onClick={() => { this.previewFile(assignment, "getassignment") }} target="_blank"><button className="ui olive button"><i className="eye icon" style={{ margin: 0 }}></i></button></a>
                        <a href={this.state.apiUrl} onClick={() => { this.previewFile(assignment, "getcriteria") }} target="_blank"><button className="ui primary button"><i className="eye icon" style={{ margin: 0 }}></i></button></a>
                        <button className="ui yellow button" onClick={() => this.handleCRUDModal("Edit")}><i className="edit icon" style={{ margin: 0 }}></i></button>
                        <button className="ui red button" onClick={() => this.handleCRUDModal("Delete")}><i className="trash alternate icon" style={{ margin: 0 }}></i></button>
                    </td>
                </tr>
            )
        }

        const modifiedCriterias = [];

        if (criterias != null) {
            criterias.forEach(element => {
                const criteriaObject = {};

                lecturerObject['key'] = element.id;
                lecturerObject['text'] = element.id

                modifiedCriterias.push(criteriaObject)
            });
        }

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
                                    onChange={this.onInputHandler}
                                />
                                {/* <Form.Field
                                    control={Select}
                                    options={modifiedCriterias}
                                    label={{ children: 'Marking Criteria', htmlFor: 'form-select-control-gender' }}
                                    placeholder='Marking Criteria'
                                    search
                                    searchInput={{ id: 'form-select-control-gender' }}
                                    onChange={this.onSelectHandler}
                                /> */}
                                <input title="Assignment" type="file" accept="application/pdf" onChange={(e) => this.onFileHandler(e, "assignment")}></input>
                                <input title="Marking Criteria" type="file" accept="application/pdf" onChange={(e) => this.onFileHandler(e, "criteria")}></input>
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