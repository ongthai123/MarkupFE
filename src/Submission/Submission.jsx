import React from 'react';
import { Router, Route, Link } from 'react-router-dom';
import { Button, Header, Icon, Image, Modal, Form, Input, Select, Dropdown, Confirm } from 'semantic-ui-react'
import config from 'config';
import { userService, authenticationService } from '@/_services';
import { authHeader, handleResponse } from '@/_helpers';
import { Student } from '../AdminPage/Student';
import moment from 'moment'

class Submission extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: authenticationService.currentUserValue,
            userFromApi: null,
            submissions: null,
            students: null,
            assignments: null,
            files: [],
            openPreviewModal: false,
            openUploadModal: false,
            isCRUDModalOpen: false,
            crudModalTitle: "",
            openConfirm: false,
        };
    }

    componentDidMount() {
        const { currentUser } = this.state;
        userService.getById(currentUser.id).then(userFromApi => this.setState({ userFromApi }));

        this.loadData();
    }

    loadData = () => {
        const id = this.props.match.params.id;
        const requestOptions = { method: 'GET', headers: authHeader() };

        // console.log(id)

        fetch(`${config.apiUrl}/api/users/getallusers`, requestOptions)
            .then(r => r.json().then(data => ({ status: r.status, body: data })))
            .then(obj => {
                // console.log("Lecturers: ", obj.body)
                this.setState({
                    lecturers: obj.body
                })
            });

        fetch(`${config.apiUrl}/api/submission/${id}`, requestOptions)
            .then(r => r.json().then(data => ({ status: r.status, body: data })))
            .then(obj => {
                // console.log("Submission: ", obj.body)
                this.setState({
                    submissions: obj.body
                })
            })
            .then(() => {
                fetch(`${config.apiUrl}/api/assignment/get/${id}`, requestOptions)
                    .then(r => r.json().then(data => ({ status: r.status, body: data })))
                    .then(obj => {
                        // console.log("Assignments: ", obj.body)
                        this.setState({
                            assignment: obj.body
                        })
                    })
                    .then(() => {
                        fetch(`${config.apiUrl}/api/student/${this.state.assignment.courseId}`, requestOptions)
                            .then(r => r.json().then(data => ({ status: r.status, body: data })))
                            .then(obj => {
                                // console.log("Students: ", obj.body)
                                this.setState({
                                    students: obj.body
                                })
                            })
                            .then(() => {
                                if (this.state.submissions) {
                                    const mergeById = (a1, a2) =>
                                        a1.map(itm => ({
                                            ...a2.find((item) => (item.studentId === itm.id) && item),
                                            ...itm
                                        }));
                                    // console.log(mergeById(this.state.students, this.state.submissions));
                                    const list = mergeById(this.state.students, this.state.submissions);
                                    this.setState({ students: list })
                                }
                            })
                    })
            })
    }

    handleCRUDModal = (crudModalTitle, data) => {
        const { isCRUDModalOpen } = this.state;

        this.setState({ crudModalTitle })

        this.setState({ isCRUDModalOpen: !isCRUDModalOpen, data })
    }

    onFileHandler = (e) => {

        let files = [];

        Array.from(e.target.files).forEach(file => {
            files.push(file)
        });
        this.setState({ files })
    }

    addSubmission = () => {
        const { currentUser, assignment, data, files } = this.state;
        const studentId = data;

        const formData = new FormData();

        for (const file of files) {
            formData.append('Files', file);
        }
        formData.append('UserId', currentUser.id)
        formData.append('AssignmentId', assignment.id)
        formData.append('StudentId', studentId)

        fetch(`${config.apiUrl}/api/submission/create`, {
            mode: 'cors',
            headers: authHeader(),
            method: 'POST',
            body: formData,
        })
            .then(() => this.handleCRUDModal())
            .then((response => this.loadData()))

    }

    editSubmission = () => {
        const { currentUser, assignment, data, files } = this.state;
        // const studentId = data;

        const formData = new FormData();

        for (const file of files) {
            formData.append('Files', file);
        }
        formData.append('UserId', currentUser.id)
        formData.append('AssignmentId', assignment.id)
        formData.append('SubmissionId', data)

        fetch(`${config.apiUrl}/api/submission/edit`, {
            mode: 'cors',
            headers: authHeader(),
            method: 'POST',
            body: formData,
        })
            .then(() => this.handleCRUDModal())
            .then((response => this.loadData()))

        this.setState({
            assignment: "undefined",
            data: "undefined",
            files: []
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

        fetch(`${config.apiUrl}/api/submission/delete`, {
            mode: 'cors',
            headers: authHeader(),
            method: 'POST',
            body: formData,
        })
            .then((response => this.loadData()))
            .then(() => this.handleConfirm())
    }

    assignModerator = () => {
        const { key, data } = this.state

        fetch(`${config.apiUrl}/api/submission/assignmoderator/${data}/${key}`, {
            headers: authHeader(),
            method: 'GET',
        })
            .then(() => this.handleCRUDModal())
            .then(() => this.loadData())

    }

    previewFile = (student) => {
        fetch(`${config.apiUrl}/api/submission/get/${student.submissionId}`, {
            headers: authHeader(),
            method: 'GET',
        })
            .then(r => {
                // console.log("Submissions: ", r)
            });
        this.setState({
            apiUrl: `${config.apiUrl}/api/submission/get/` + student.submissionId
        })
    }

    onSelectHandler = (event, data) => {

        let selectValue = event.target.textContent;

        const { key } = data.options.find(o => o.text === selectValue);

        this.setState({ selectValue, key })
        // console.log("Key: ", key)

    }

    render() {
        const { currentUser, userFromApi, submissions, assignments, students, lecturers, files, openUploadModal, isCRUDModalOpen, crudModalTitle, openConfirm } = this.state;

        let lecturerData = [];
        if (lecturers != null) {
            lecturers.forEach(element => {
                const lecturerObject = {};

                lecturerObject['key'] = element.id;
                lecturerObject['text'] = element.firstName + " " + element.lastName;
                lecturerObject['value'] = element.id;

                lecturerData.push(lecturerObject)
            });
        }

        let tableData = [];

        if (students != null) {
            // console.log("tableData: ", students)
            tableData = students.map(student =>
                <tr key={student.id}>
                    <td>{student.courseTitle}</td>
                    <td>{student.studentId}</td>
                    <td>{student.firstName + " " + student.lastName}</td>
                    <td>{student.email}</td>
                    <td>{student.referencePath ? <Icon name="check circle" /> : null}</td>
                    <td>{student.updatedOn ? moment.utc(student.updatedOn).local().format('lll') : null}</td>
                    <td>{student.updatedBy ? student.updatedBy.firstName + " " + student.updatedBy.lastName : null}</td>
                    <td>{student.moderator ? student.moderator.firstName + " " + student.moderator.lastName : null}</td>
                    <td style={{ textAlign: "right" }}>
                        {student.referencePath ?
                            <button className="ui green button" disabled><i className="cloud upload icon" style={{ margin: 0 }}></i></button>
                            :
                            <button className="ui green button" onClick={() => this.handleCRUDModal("Add", student.id)}><i className="cloud upload icon" style={{ margin: 0 }}></i></button>}
                        
                        <a href={this.state.apiUrl} onClick={() => { this.previewFile(student) }} target="_blank"><button className="ui primary button"><i className="eye icon" style={{ margin: 0 }}></i></button></a>
                        <button className="ui orange button" onClick={() => this.handleCRUDModal("Share", student.submissionId)}><i className="share alternate icon" style={{ margin: 0 }}></i></button>
                        
                        {student.referencePath ?
                            <Link to={"/markings/" + student.submissionId}><button className="ui teal button"><i className="paint brush icon" style={{ margin: 0 }}></i></button></Link>
                            :
                            <button className="ui teal button" disabled><i className="paint brush icon" style={{ margin: 0 }}></i></button>}

                        <button className="ui yellow button" onClick={() => this.handleCRUDModal("Edit", student.submissionId)}><i className="edit icon" style={{ margin: 0 }}></i></button>
                        <button className="ui red button" onClick={() => this.handleConfirm(student.submissionId)}><i className="trash alternate icon" style={{ margin: 0 }}></i></button>
                    </td>
                </tr>
            )
        }

        return (
            <div>
                <div className="ui grid">
                    <div className="ten wide column"><h1>Submission</h1></div>
                    <div className="six wide column">
                    </div>
                </div>
                <table className="ui selectable inverted table" style={{ textAlign: "center" }}>
                    <thead>
                        <tr><th>Course</th>
                            <th>StudentId</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Submitted</th>
                            <th>Last Updated</th>
                            <th>Updated By</th>
                            <th>Moderator</th>
                            <th>Action</th>
                        </tr></thead>
                    <tbody>
                        {tableData}
                    </tbody>
                </table>

                {students == null || students.length == 0 ? <h3>Please Add Student Before Submitting Submissions.</h3> : null}

                <Modal
                    open={isCRUDModalOpen}
                    onClose={() => this.handleCRUDModal("")}
                    size='small'
                    style={{ maxHeight: "400px", verticalAlign: "center", margin: "auto" }}
                >
                    <Modal.Header>{crudModalTitle}</Modal.Header>
                    <Modal.Content>
                        {crudModalTitle == "Add" ? <input type="file" accept="application/pdf" onChange={this.onFileHandler}></input>
                            : crudModalTitle == "Edit" ? <input type="file" accept="application/pdf" onChange={this.onFileHandler}></input>
                                    : crudModalTitle == "Share" ? <Dropdown placeholder="Moderator" clearable options={lecturerData} selection onChange={this.onSelectHandler} />
                                        : null}
                    </Modal.Content>
                    <Modal.Actions>
                        {crudModalTitle == "Add" ?
                            <Button primary onClick={() => this.addSubmission()}>
                                {crudModalTitle} <Icon name='chevron right' />
                            </Button>
                            : crudModalTitle == "Edit" ?
                                <Button primary onClick={() => this.editSubmission()}>
                                    {crudModalTitle} <Icon name='chevron right' />
                                </Button>
                                    : crudModalTitle == "Share" ?
                                        <Button primary onClick={() => this.assignModerator()}>
                                            {crudModalTitle} <Icon name='chevron right' />
                                        </Button>
                                        : null

                        }
                    </Modal.Actions>
                </Modal>

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

export { Submission };