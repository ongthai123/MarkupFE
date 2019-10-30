import React from 'react';
import { Router, Route, Link } from 'react-router-dom';
import { Button, Header, Icon, Image, Modal, Form, Input, Select, Confirm } from 'semantic-ui-react'
import config from 'config';
import { userService, authenticationService } from '@/_services';
import { authHeader, handleResponse } from '@/_helpers';
import { Student } from '../AdminPage/Student';
import moment from 'moment'

class Marking extends React.Component {
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
        fetch(`${config.apiUrl}/api/marking/getall/${id}`, requestOptions)
            .then(r => r.json().then(data => ({ status: r.status, body: data })))
            .then(obj => {
                console.log("Markings: ", obj.body)
                this.setState({
                    submissions: obj.body
                })
            });

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
        fetch(`${config.apiUrl}/api/marking/delete`, requestOptions)
            .then(() => this.loadData())
            .then(() => this.handleConfirm())
    }

    handleUploadModal = () => {
        const { openUploadModal } = this.state;

        this.setState({
            openUploadModal: !openUploadModal
        })
    }

    handleCurrentSubmission = (studentId, assignmentId) => {
        this.setState({
            studentId,
            assignmentId
        })

        this.handleUploadModal();
    }

    addNewMarking = () => {
        const { currentUser } = this.state;
        const id = this.props.match.params.id;

        let formData = new FormData();
        formData.append('userId', currentUser.id)
        formData.append('submissionId', id)

        const requestOptions = {
            method: 'POST',
            headers: authHeader(),
            body: formData
        };
        fetch(`${config.apiUrl}/api/marking/create`, requestOptions)
            .then(() => this.loadData())

    }

    previewFile = (submission) => {
        fetch(`${config.apiUrl}/api/marking/${submission.id}`, {
            headers: authHeader(),
            method: 'GET',
        })
            .then(r => {
                console.log("Submissions: ", r)
            });
        this.setState({
            apiUrl: `${config.apiUrl}/api/marking/` + submission.id
        })
    }

    sendEmail = (marking) => {
        const { currentUser } = this.state;
        const id = this.props.match.params.id;

        let formData = {};
        formData['user'] = currentUser
        formData['markingId'] = marking.id
        formData['student'] = marking.student

        const requestOptions = {
            method: 'POST',
            headers: {
                ...authHeader(), ...{
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            },
            body: JSON.stringify(formData)
        };
        fetch(`${config.apiUrl}/api/marking/send`, requestOptions)

    }

    render() {
        const { currentUser, userFromApi, submissions, assignments, students, files, openUploadModal, openConfirm } = this.state;

        let tableData = null;
        if (submissions != null) {
            tableData = submissions.map(submission =>
                <tr key={submission.id}>
                    <td data-label="Student">{submission.student.firstName + " " + submission.student.lastName}</td>
                    <td data-label="Updated By">{submission.updatedBy.firstName + " " + submission.updatedBy.lastName}</td>
                    <td data-label="Updated On">{moment.utc(submission.updatedOn).local().format('lll')}</td>
                    <td data-label="Grade">{submission.grade ? submission.grade : 'Unmarked'}</td>
                    <td>
                        <button className="ui black button" onClick={() => this.sendEmail(submission)}><i className="mail icon" style={{ margin: 0 }}></i></button>
                        <a href={this.state.apiUrl} onClick={() => { this.previewFile(submission) }} target="_blank"><button className="ui primary button"><i className="eye icon" style={{ margin: 0 }}></i></button></a>
                        <Link to={"/test/" + submission.id} ><button className="ui yellow button"><i className="edit icon" style={{ margin: 0 }}></i></button></Link>
                        <button className="ui red button" onClick={() => { this.handleConfirm(submission.id) }}><i className="trash alternate icon" style={{ margin: 0 }}></i></button>
                    </td>
                </tr>
            )
        }

        return (
            <div>
                <div className="ui grid">
                    <div className="ten wide column"><h1>Markings</h1></div>
                    <div className="six wide column">
                        <button className="ui inverted green button" style={{ float: "right" }} onClick={() => this.addNewMarking()}>New Marking</button>
                    </div>
                </div>
                <table className="ui selectable inverted table" style={{ textAlign: "center" }}>
                    <thead>
                        <tr><th>Student</th>
                            <th>Updated By</th>
                            <th>Updated On</th>
                            <th>Grade</th>
                            <th>Action</th>
                        </tr></thead>
                    <tbody>
                        {tableData}
                    </tbody>
                </table>

                <Modal
                    open={openUploadModal}
                    onOpen={this.handleUploadModal}
                    onClose={this.handleUploadModal}
                    size='small'
                    style={{ maxHeight: "300px", verticalAlign: "center", margin: "auto" }}
                >
                    <Modal.Header>Upload Submission</Modal.Header>
                    <Modal.Content>
                        <input type="file" accept="application/pdf" onChange={this.onFileHandler}></input>
                    </Modal.Content>
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

export { Marking };